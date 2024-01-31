#!/usr/bin/env node

import { Command } from 'commander'
import Conf from 'conf'
import crypto from 'crypto'
import debug from 'debug'
import getStdin from 'get-stdin'
import http from 'http'
import SpotifyWebApi from 'spotify-web-api-node'
import { readFile } from 'node:fs/promises'

import { buildSchema } from './lib/config/validation.js'
import { loadYAMLConfig } from './lib/config/yaml.js'
import { usesAlbumField, usesGenreField } from './lib/config/analysis.js'
import {
  createAuthorizationURL,
  getAccessToken,
  getRefreshedAccessToken
} from './lib/spotify/auth.js'
import * as dedupeTracksTask from './lib/task/dedupeTracks.js'
import * as exportTracksTask from './lib/task/exportTracks.js'
import * as filterTracksTask from './lib/task/filterTracks.js'
import * as getAlbumTracksTask from './lib/task/getAlbumTracks.js'
import * as getLibraryTracksTask from './lib/task/getLibraryTracks.js'
import * as getPlaylistTracksTask from './lib/task/getPlaylistTracks.js'
import * as mergeTracksTask from './lib/task/mergeTracks.js'
import * as replacePlaylistTracksTask from './lib/task/replacePlaylistTracks.js'
import * as shuffleTracksTask from './lib/task/shuffleTracks.js'
import * as sortTracksTask from './lib/task/sortTracks.js'
import * as updatePlaylistDetailsTask from './lib/task/updatePlaylistDetails.js'

const SPOTIFY_APP_REDIRECT_URI_PORT = 3182
const SPOTIFY_APP_REDIRECT_URI = `http://localhost:${SPOTIFY_APP_REDIRECT_URI_PORT}`
// https://developer.spotify.com/documentation/general/guides/scopes/
const SPOTIFY_APP_REQUIRED_SCOPES = [
  'playlist-modify-public', // Needed to save changes to public playlists
  'playlist-modify-private', // Needed to save changes to private playlists
  'playlist-read-private', // Needed to read data from private playlists
  'playlist-read-collaborative', // Needed to read data from collaborative playlists
  'user-library-read' // Needed to read data from library
]
const APP_DATA_SPOTIFY_AUTH_KEY = 'spotify.auth'
const APP_DATA_SPOTIFY_APP_CLIENT_ID = 'spotify.app_client_id'

const debugApp = debug('app')
const debugAuth = debug('auth')

/**
 * Log an error message to the console. If debug is enabled log original error
 * to the console.
 *
 * @param {string} message
 * @param {Error} error
 *
 * @returns {void}
 */
function logErr (message, error) {
  if (debug.enabled('app') === false) {
    console.error(message)
  }

  if (error && debug.enabled('app') === true) {
    console.error('\n', error, '\n')
  }
}

/**
 * Log a warning message to the console
 *
 * @param {string} message
 *
 * @returns {void}
 */
function logWarn (message) {
  console.warn(message)
}

/**
 * Log an info message to the console, but only if not in debug mode (to reduce
 * console clutter)
 *
 * @param {string} message
 *
 * @returns {void}
 */
function logInfo (message) {
  if (debug.enabled('app') === true) return

  console.info(message)
}

/**
 * Load config from either the provided config path or stdin
 *
 * @param {string} [configPath]
 *
 * @returns {Promise<object>}
 */
async function loadConfig (configPath) {
  let config

  const input = await getStdin()

  if (input !== '') {
    debugApp('loading config from stdin')

    if (configPath !== undefined) {
      throw new Error('cannot load config from stdin and a config file at the same time')
    }

    try {
      config = JSON.parse(input)
    } catch (err) {
      throw new Error(`failed to load config from stdin: ${err.message}`)
    }
  } else if (configPath !== undefined) {
    debugApp(`loading config from: ${configPath}`)

    config = await loadYAMLConfig(configPath)
  } else {
    throw new Error('no config was provided')
  }

  return config
}

/**
 * Validate that the provided config is valid
 *
 * @param {object} config
 *
 * @returns {void}
 */
function validateConfig (config) {
  const schema = buildSchema([
    dedupeTracksTask,
    exportTracksTask,
    filterTracksTask,
    getAlbumTracksTask,
    getLibraryTracksTask,
    getPlaylistTracksTask,
    mergeTracksTask,
    replacePlaylistTracksTask,
    shuffleTracksTask,
    sortTracksTask,
    updatePlaylistDetailsTask
  ])
  const { error } = schema.validate(config)

  if (error) {
    throw new Error(`config validation failed due to: ${error.message}`)
  }
}

/**
 * Attempt to authenticate with Spotify using: Authorization Code Flow with Proof Key for Code Exchange (PKCE)
 *
 * @param {string} clientId
 *
 * @returns {Promise<object>}
 *
 * @see https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow-with-proof-key-for-code-exchange-pkce
 */
async function authenticate (clientId) {
  const codeVerifierSize = Math.random() * (128 - 43 + 1) + 43 //  43 = min, 128 = max
  const codeVerifier = crypto.randomBytes(codeVerifierSize)
    .toString('hex')
    .slice(0, codeVerifierSize)
  const codeChallenge = crypto.createHash('sha256')
    .update(codeVerifier)
    .digest()
    .toString('base64url')
  const state = crypto.randomBytes(32).toString('hex')
  const url = createAuthorizationURL({
    redirectUri: SPOTIFY_APP_REDIRECT_URI,
    clientId,
    scopes: SPOTIFY_APP_REQUIRED_SCOPES,
    state,
    codeChallenge
  })

  // Prompt user to visit authentication URL
  logWarn(`\nauthorization required - please visit the following URL in a browser on this machine:\n\n${url}\n`)

  // Start a HTTP server that is listening on the same URI that the spotify app
  // is set to redirect too after user accepts / declines authentication. Wait for
  // a request to the server before continuing execution
  let server

  try {
    const result = await new Promise((resolve, reject) => {
      server = http.createServer(async (req, res) => {
        debugAuth('HTTP request received to authentication handler')

        const queryParams = new URL(req.url, SPOTIFY_APP_REDIRECT_URI).searchParams

        if (queryParams.get('state') !== state) {
          res.writeHead(500)
          res.end('authentication unsuccessful')

          return reject(
            new Error('authentication failed: invalid state received to authentication HTTP handler')
          )
        }

        if (queryParams.get('error') !== null) {
          res.writeHead(500)
          res.end('authentication unsuccessful')

          return reject(
            new Error(`authentication failed: ${queryParams.get('error')}`)
          )
        }

        const { body, statusCode } = await getAccessToken({
          redirectUri: SPOTIFY_APP_REDIRECT_URI,
          clientId,
          code: queryParams.get('code'),
          codeVerifier
        })

        if (statusCode !== 200) {
          res.writeHead(500)
          res.end('authentication unsuccessful')

          return reject(
            new Error('authentication failed: invalid status code received whilst requesting access token')
          )
        }

        res.writeHead(200)
        res.end('authentication successful, you can now close this page')

        return resolve({
          accessToken: body.access_token,
          refreshToken: body.refresh_token,
          expiresAt: new Date(new Date().getTime() + (1000 * body.expires_in))
        })
      })

      debugAuth('starting HTTP authentication handler')

      server.listen(SPOTIFY_APP_REDIRECT_URI_PORT)
    })

    server.close()

    return result
  } catch (err) {
    server.close()

    throw err
  }
}

/**
 * Initialise the Spotify client ensuring that it is authenticated to make requests
 *
 * @param {Conf} appData
 * @param {string} userProvidedAccessToken
 *
 * @returns {Promise<SpotifyWebApi>}
 */
async function initSpotify (appData, userProvidedAccessToken) {
  const clientId = appData.get(APP_DATA_SPOTIFY_APP_CLIENT_ID)

  const spotify = new SpotifyWebApi({
    clientId,
    redirectUri: SPOTIFY_APP_REDIRECT_URI
  })

  // If an access token was provided use it for authenticating requests
  // otherwise attempt authentication flow
  if (userProvidedAccessToken !== undefined) {
    debugAuth('using user provided access token for auth')

    spotify.setAccessToken(userProvidedAccessToken)
  } else {
    debugAuth('attempting auth flow')

    const existingSpotifyAuthData = appData.get(APP_DATA_SPOTIFY_AUTH_KEY)

    // If user has not previously authenticated, attempt authentication
    if (existingSpotifyAuthData === undefined) {
      debugAuth('auth data not present in app data')

      const { accessToken, refreshToken, expiresAt } = await authenticate(clientId)

      appData.set(APP_DATA_SPOTIFY_AUTH_KEY, { accessToken, refreshToken, expiresAt })

      spotify.setAccessToken(accessToken)
      spotify.setRefreshToken(refreshToken)
    } else {
      // If user has previously authenticated, check that authentication credentials
      // are still valid
      debugAuth('auth data present in app data, skipping auth flow')

      spotify.setAccessToken(existingSpotifyAuthData.accessToken)
      spotify.setRefreshToken(existingSpotifyAuthData.refreshToken)

      // If the existing authentication credentials have expired, or are due to
      // expire within the next minute, request refreshed credentials
      if (
        new Date(existingSpotifyAuthData.expiresAt) <=
        new Date(new Date().getTime() - (1000 * 60))
      ) {
        try {
          debugAuth('access token expired, refreshing access token')

          const { body } = await getRefreshedAccessToken({
            refreshToken: spotify.getRefreshToken(),
            clientId: spotify.getClientId()
          })

          appData.set(APP_DATA_SPOTIFY_AUTH_KEY, {
            accessToken: body.access_token,
            expiresAt: new Date(new Date().getTime() + (1000 * body.expires_in)),
            refreshToken: body.refresh_token
          })

          spotify.setAccessToken(body.access_token)
          spotify.setRefreshToken(body.refresh_token)
        } catch (err) {
          // If an error occurs during refreshing authentication credentials, clear
          // any saved authentication credentials to force user to re-authenticate
          // on next execution
          appData.delete(APP_DATA_SPOTIFY_AUTH_KEY)

          throw new Error('an authentication error has occurred, please try running the command again')
        }
      } else {
        debugAuth('access token has not yet expired, refresh not required')
      }
    }
  }

  debugAuth('auth successful')
  debugAuth(`access token: ${spotify.getAccessToken()}`)
  debugAuth(`refresh token: ${spotify.getRefreshToken()}`)

  return spotify
}

/**
 * Execute all tasks listed in the config
 *
 * @param {object} config
 * @param {SpotifyWebApi} spotify
 *
 * @returns {Promise<void>}
 */
async function executeTasks (config, spotify) {
  const taskIds = Object.keys(config.tasks)
  const trackCollections = {}

  debugApp(`executing: "${config.name}"`)
  logInfo(`executing tasks for "${config.name}"`)

  debugApp(`${taskIds.length} tasks to execute`)
  logInfo(`${taskIds.length} tasks to execute`)

  const ctx = {
    retrieveAlbumDetails: usesAlbumField(config),
    retrieveArtistGenreDetails: usesGenreField(config)
  }

  debugApp('context:', ctx)

  for (const taskId of taskIds) {
    const taskConfig = config.tasks[taskId]

    debugApp(`executing task: "${taskId}" (${taskConfig.type})`)
    logInfo(`executing task "${taskId}"`)

    try {
      switch (taskConfig.type) {
        case 'album.get_tracks':
          trackCollections[taskId] = await getAlbumTracksTask.execute({
            config: taskConfig,
            ctx,
            spotify
          })

          debugApp(`${trackCollections[taskId].length} tracks retrieved`)
          break
        case 'library.get_tracks':
          trackCollections[taskId] = await getLibraryTracksTask.execute({
            config: taskConfig,
            ctx,
            spotify
          })

          debugApp(`${trackCollections[taskId].length} tracks retrieved`)
          break
        case 'playlist.get_tracks':
          trackCollections[taskId] = await getPlaylistTracksTask.execute({
            config: taskConfig,
            ctx,
            spotify
          })

          debugApp(`${trackCollections[taskId].length} tracks retrieved`)
          break
        case 'playlist.replace_tracks':
          await replacePlaylistTracksTask.execute({
            config: taskConfig,
            trackCollections,
            spotify
          })
          break
        case 'tracks.dedupe':
          trackCollections[taskId] = await dedupeTracksTask.execute({
            config: taskConfig,
            trackCollections
          })
          break
        case 'tracks.export':
          await exportTracksTask.execute({
            config: taskConfig,
            trackCollections
          })
          break
        case 'tracks.filter':
          trackCollections[taskId] = await filterTracksTask.execute({
            config: taskConfig,
            trackCollections
          })
          break
        case 'tracks.merge':
          trackCollections[taskId] = await mergeTracksTask.execute({
            config: taskConfig,
            trackCollections
          })
          break
        case 'tracks.shuffle':
          trackCollections[taskId] = await shuffleTracksTask.execute({
            config: taskConfig,
            trackCollections
          })
          break
        case 'tracks.sort':
          trackCollections[taskId] = await sortTracksTask.execute({
            config: taskConfig,
            trackCollections
          })
          break
        case 'playlist.update_details':
          trackCollections[taskId] = await updatePlaylistDetailsTask.execute({
            config: taskConfig,
            spotify
          })
          break
      }
    } catch (err) {
      throw new Error(`failed to execute task "${taskId}": ${err.message}`)
    }
  }

  debugApp('all tasks successfully executed')
  logInfo('all tasks successfully executed')
}

/**
 * Initialise the program
 *
 * @returns {object}
 */
async function initProgram () {
  const program = new Command()
  const pkg = JSON.parse(
    await readFile(
      new URL('./package.json', import.meta.url)
    )
  )

  // Initialise program
  program
    .name(pkg.name)
    .description(pkg.description)
    .version(pkg.version)
    .hook('preAction', (thisCommand, actionCommand) => {
      if (actionCommand.opts().debug === true) {
        debug.enable('*')
      }
    })

  // Configure "run" command
  program
    .command('run')
    .argument('[path]', 'path to config file')
    .description('execute the tasks in the provided config')
    .option('-d, --debug', 'enable debug output')
    .option('-t, --token <token>', 'access token to use for authentication')
    .action(async (configPath, opts) => {
      try {
        // Initialise app data
        const appData = new Conf({
          clearInvalidConfig: true,
          // Dont worry, this is safe to be publicly visible :) - https://github.com/sindresorhus/conf#encryptionkey
          encryptionKey: 'e40cbeb4a981bd089cfd149223eb74fbd9e88834',
          projectName: pkg.name
        })

        debugApp(`app data location: ${appData.path}`)

        // Check client ID has been set
        if (appData.has(APP_DATA_SPOTIFY_APP_CLIENT_ID) === false) {
          throw new Error('no Spotify app client ID has been set, please run the "set-client-id" command')
        }

        // Initialise config
        const config = await loadConfig(configPath)

        validateConfig(config)

        // Initialise Spotify
        const spotify = await initSpotify(appData, opts.token)

        // Execute tasks
        await executeTasks(config, spotify)
      } catch (err) {
        logErr(`error: ${err.message}`, err)
      }
    })

  // Configure "reset" command
  program
    .command('reset')
    .option('-d, --debug', 'enable debug output')
    .description('remove all saved data')
    .action(() => {
      const appData = new Conf({
        clearInvalidConfig: true
      })

      debugApp(`clearing app data from: ${appData.path}`)

      appData.clear()

      logInfo('saved data removed')
    })

  // Configure "set-client-id" command
  program
    .command('set-client-id <client-id>')
    .option('-d, --debug', 'enable debug output')
    .description('set the client ID of the Spotify app to use')
    .action((clientId) => {
      const appData = new Conf({
        clearInvalidConfig: true
      })

      debugApp(`persisting Spotify app client ID "${clientId}" to: ${appData.path}`)

      appData.set(APP_DATA_SPOTIFY_APP_CLIENT_ID, clientId)

      logInfo('Spotify app client ID set')
    })

  return {
    run: () => {
      program.parse(process.argv)
    }
  }
}

// Go!
(await initProgram()).run()
