#!/usr/bin/env node

const SPOTIFY_APP_CLIENT_ID = '231c69aaf23c4e9ba6e349c56130f56f'
const SPOTIFY_APP_REDIRECT_URI_PORT = 8736
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

require('dotenv').config()

const chalk = require('chalk')
const Conf = require('conf')
const crypto = require('crypto')
const debug = require('debug')('app')
const debugAuth = require('debug')('auth')
const getStdin = require('get-stdin')
const http = require('http')
const meow = require('meow')
const SpotifyWebApi = require('spotify-web-api-node')

const { buildSchema } = require('./lib/config/validation')
const { loadYAMLConfig } = require('./lib/config/yaml')
const {
  createAuthorizationURL,
  getAccessToken,
  getRefreshedAccessToken
} = require('./lib/spotify/auth')
const dedupeTracksTask = require('./lib/task/dedupeTracks')
const filterTracksTask = require('./lib/task/filterTracks')
const getAlbumTracksTask = require('./lib/task/getAlbumTracks')
const getLibraryTracksTask = require('./lib/task/getLibraryTracks')
const getPlaylistTracksTask = require('./lib/task/getPlaylistTracks')
const mergeTracksTask = require('./lib/task/mergeTracks')
const replacePlaylistTracksTask = require('./lib/task/replacePlaylistTracks')
const shuffleTracksTask = require('./lib/task/shuffleTracks')
const sortTracksTask = require('./lib/task/sortTracks')

/**
 * Log an error message to the console. Also log the original error to the console
 * if the APP_ENV environment variable is set to "dev"
 *
 * @param {string} message
 * @param {Error} error
 *
 * @returns {void}
 */
function logErr (message, error) {
  console.error(chalk.red(message))

  if (error !== undefined && process.env.APP_ENV === 'dev') {
    console.error('\n', error)
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
  console.warn(chalk.yellow(message))
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
  if (process.env.DEBUG !== undefined) return

  console.info(chalk.blue(message))
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
    debug('Loading config from stdin')

    if (configPath !== undefined) {
      throw new Error('Cannot load config from stdin and a config file at the same time')
    }

    try {
      config = JSON.parse(input)
    } catch (err) {
      throw new Error(`Failed to load config from stdin due to: ${err.message}`)
    }
  } else if (configPath !== undefined) {
    debug(`Loading config from: ${configPath}`)

    config = await loadYAMLConfig(configPath)
  } else {
    throw new Error('No config was provided')
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
    filterTracksTask,
    getAlbumTracksTask,
    getLibraryTracksTask,
    getPlaylistTracksTask,
    mergeTracksTask,
    replacePlaylistTracksTask,
    shuffleTracksTask,
    sortTracksTask
  ])
  const { error } = schema.validate(config)

  if (error) {
    throw new Error(`Config validation failed due to: ${error.message}`)
  }
}

/**
 * Attempt to authenticate with Spotify using: Authorization Code Flow with Proof Key for Code Exchange (PKCE)
 *
 * @returns {Promise<object>}
 *
 * @see https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow-with-proof-key-for-code-exchange-pkce
 */
async function authenticate () {
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
    clientId: SPOTIFY_APP_CLIENT_ID,
    scopes: SPOTIFY_APP_REQUIRED_SCOPES,
    state,
    codeChallenge
  })

  // Prompt user to visit authentication URL
  logWarn(`\nAuthorization required. Please visit the following URL in a browser on this machine:\n\n${url}\n`)

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
          res.end('Authentication unsuccessful')

          return reject(
            new Error('Authentication failed due to: Invalid state received to authentication HTTP handler')
          )
        } else if (queryParams.get('error') !== null) {
          res.writeHead(500)
          res.end('Authentication unsuccessful')

          return reject(
            new Error(`Authentication failed due to: ${queryParams.get('error')}`)
          )
        } else {
          const { body, statusCode } = await getAccessToken({
            redirectUri: SPOTIFY_APP_REDIRECT_URI,
            clientId: SPOTIFY_APP_CLIENT_ID,
            code: queryParams.get('code'),
            codeVerifier
          })

          if (statusCode !== 200) {
            res.writeHead(500)
            res.end('Authentication unsuccessful')

            return reject(
              new Error(`Authentication failed due to: Invalid status code [${statusCode}] received whilst requesting access token`)
            )
          }

          res.writeHead(200)
          res.end('Authentication successful! You can now close this page')

          return resolve({
            accessToken: body.access_token,
            refreshToken: body.refresh_token,
            expiresAt: new Date(new Date().getTime() + (1000 * body.expires_in))
          })
        }
      })

      debugAuth('Starting HTTP authentication handler')

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
 *
 * @returns {Promise<SpotifyWebApi>}
 */
async function initSpotify (appData) {
  const spotify = new SpotifyWebApi({
    clientId: SPOTIFY_APP_CLIENT_ID,
    redirectUri: SPOTIFY_APP_REDIRECT_URI
  })

  // If an access token is present in environment use it for authenticating requests
  // otherwise attempt authentication flow
  if (process.env.ACCESS_TOKEN !== undefined) {
    debugAuth('Using access token provided in environment for authentication')

    spotify.setAccessToken(process.env.ACCESS_TOKEN)
  } else {
    debugAuth('Attempting authentication flow')

    const existingSpotifyAuthData = appData.get(APP_DATA_SPOTIFY_AUTH_KEY)

    // If user has not previously authenticated, attempt authentication
    if (existingSpotifyAuthData === undefined) {
      debugAuth('Authentication data not present in app data')

      const { accessToken, refreshToken, expiresAt } = await authenticate()

      appData.set(APP_DATA_SPOTIFY_AUTH_KEY, { accessToken, refreshToken, expiresAt })

      spotify.setAccessToken(accessToken)
      spotify.setRefreshToken(refreshToken)
    } else {
      // If user has previously authenticated, check that authentication credentials
      // are still valid
      debugAuth('Authentication data present in app data, skipping authentication flow')

      spotify.setAccessToken(existingSpotifyAuthData.accessToken)
      spotify.setRefreshToken(existingSpotifyAuthData.refreshToken)

      // If the existing authentication credentials have expired, or are due to
      // expire within the next minute, request refreshed credentials
      if (
        new Date(existingSpotifyAuthData.expiresAt) <=
        new Date(new Date().getTime() - (1000 * 60))
      ) {
        try {
          debugAuth('Access token expired, refreshing access token')

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

          throw new Error('An authentication error has occurred. Re-authentication is needed, please try running the command again')
        }
      } else {
        debugAuth('Access token has not yet expired, refresh not required')
      }
    }
  }

  debugAuth('Authentication successful')

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

  debug(`${taskIds.length} tasks to execute`)
  logInfo(`${taskIds.length} tasks to execute...`)

  for (const taskId of taskIds) {
    const taskConfig = config.tasks[taskId]

    debug(`Executing task: ${taskConfig.type}`)
    logInfo(`Executing task: ${taskId}`)

    try {
      switch (taskConfig.type) {
        case 'album.get_tracks':
          trackCollections[taskId] = await getAlbumTracksTask.execute({
            config: taskConfig,
            spotify
          })
          break
        case 'library.get_tracks':
          trackCollections[taskId] = await getLibraryTracksTask.execute({
            config: taskConfig,
            spotify
          })
          break
        case 'playlist.get_tracks':
          trackCollections[taskId] = await getPlaylistTracksTask.execute({
            config: taskConfig,
            spotify
          })
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
      }
    } catch (err) {
      throw new Error(`Failed to execute task [${taskId}] due to: ${err.message}`)
    }
  }

  logInfo('All tasks executed!')
}

/**
 * Run the application
 *
 * @param {string} configPath
 *
 * @returns {Promise<void>}
 */
async function run (configPath) {
  try {
    // Initialise app data
    const appData = new Conf({
      clearInvalidConfig: true,
      // Dont worry, this is safe to be publicly visible :) - https://github.com/sindresorhus/conf#encryptionkey
      encryptionKey: 'e40cbeb4a981bd089cfd149223eb74fbd9e88834'
    })

    debug(`App data location: ${appData.path}`)

    // Initialise config
    const config = await loadConfig(configPath)

    validateConfig(config)

    // Initialise Spotify
    const spotify = await initSpotify(appData)

    // Execute tasks
    await executeTasks(config, spotify)
  } catch (err) {
    logErr(`\nAn error occurred:\n\n  ${err.message}`, err)
  }
}

const cli = meow(`
  Usage

    $ playlist-pipeline <path-to-config>

      or

    $ echo 'CONFIG AS JSON' | playlist-pipeline
`)

run(cli.input[0])
