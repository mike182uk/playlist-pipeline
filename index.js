#!/usr/bin/env node

const SPOTIFY_APP_CLIENT_ID = '231c69aaf23c4e9ba6e349c56130f56f'
const SPOTIFY_APP_REQUIRED_SCOPES = [ // https://developer.spotify.com/documentation/general/guides/scopes/
  'playlist-modify-public',
  'playlist-modify-private',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-read-email'
]
const SPOTIFY_APP_REDIRECT_URI_PORT = 8736
const SPOTIFY_APP_REDIRECT_URI = `http://localhost:${SPOTIFY_APP_REDIRECT_URI_PORT}`
const APP_DATA_ENCRYPTION_KEY = 'e40cbeb4a981bd089cfd149223eb74fbd9e88834' // https://github.com/sindresorhus/conf#encryptionkey
const APP_DATA_SPOTIFY_AUTH_KEY = 'spotify.auth'
const SPOTIFY_AUTH_STATE_SIZE = 20
const SPOTIFY_AUTH_CODE_VERIFIER_SIZE = Math.random() * (128 - 43 + 1) + 43 //  43 = min, 128 = max - https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow-with-proof-key-for-code-exchange-pkce

require('dotenv').config()

const Conf = require('conf')
const crypto = require('crypto')
const debug = require('debug')('app')
const debugAuth = require('debug')('auth')
const getStdin = require('get-stdin')
const http = require('http')
const meow = require('meow')
const SpotifyWebApi = require('spotify-web-api-node')

const {
  createAuthorizationURL,
  getAccessToken,
  getRefreshedAccessToken
} = require('./lib/spotify/auth')
const { buildSchema } = require('./lib/config/validation')
const { loadYAMLConfig } = require('./lib/config/yaml')
const dedupeTracksTask = require('./lib/task/dedupeTracks')
const filterTracksTask = require('./lib/task/filterTracks')
const getAlbumTracksTask = require('./lib/task/getAlbumTracks')
const getLibraryTracksTask = require('./lib/task/getLibraryTracks')
const getPlaylistTracksTask = require('./lib/task/getPlaylistTracks')
const mergeTracksTask = require('./lib/task/mergeTracks')
const replacePlaylistTracksTask = require('./lib/task/replacePlaylistTracks')
const shuffleTracksTask = require('./lib/task/shuffleTracks')
const sortTracksTask = require('./lib/task/sortTracks')

async function run (configPath) {
  // Initialise app data
  const appData = new Conf({
    clearInvalidConfig: true,
    encryptionKey: APP_DATA_ENCRYPTION_KEY
  })

  debug(`App data location: ${appData.path}`)

  // Load config
  let config

  const input = await getStdin()

  if (input !== '') {
    debug('Loading config from stdin')

    if (configPath !== undefined) {
      throw new Error('Can not load config from stdin and config file at the same time')
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
    throw new Error('No config provided')
  }

  // Validate config
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
    throw new Error(`Invalid config: ${error.message}`)
  }

  // Initialise Spotify
  const spotify = new SpotifyWebApi({
    clientId: SPOTIFY_APP_CLIENT_ID
  })

  // If an access token was provided in the environment use it, otherwise
  // perform authentication flow
  if (process.env.ACCESS_TOKEN !== undefined) {
    debugAuth('Using access token provided in environment for authentication')

    spotify.setAccessToken(process.env.ACCESS_TOKEN)
  } else {
    debugAuth('Attempting authentication flow')

    if (appData.get(APP_DATA_SPOTIFY_AUTH_KEY) === undefined) {
      debugAuth('Authentication data not present in app data')

      // Attempt to authenticate using: Authorization Code Flow with Proof Key for Code Exchange (PKCE)
      // https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow-with-proof-key-for-code-exchange-pkce
      spotify.setRedirectURI(SPOTIFY_APP_REDIRECT_URI)

      let server
      const codeVerifier = crypto.randomBytes(SPOTIFY_AUTH_CODE_VERIFIER_SIZE)
        .toString('hex')
        .slice(0, SPOTIFY_AUTH_CODE_VERIFIER_SIZE)

      const state = crypto.randomBytes(SPOTIFY_AUTH_STATE_SIZE).toString('hex')
      const codeChallenge = crypto.createHash('sha256')
        .update(codeVerifier)
        .digest()
        .toString('base64url')

      console.log(`
  Authorization required. Please visit the following URL in a browser on this machine:

  ${createAuthorizationURL({
    redirectUri: spotify.getRedirectURI(),
    clientId: spotify.getClientId(),
    scopes: SPOTIFY_APP_REQUIRED_SCOPES,
    state,
    codeChallenge
  })}
`)

      await new Promise((resolve, reject) => {
        server = http.createServer(async (req, res) => {
          debugAuth('HTTP request received to authentication handler')

          const queryParams = new URL(req.url, SPOTIFY_APP_REDIRECT_URI).searchParams

          if (queryParams.get('state') !== state) {
            res.writeHead(500)
            res.end('Authentication unsuccessful')

            return reject(new Error('Authentication failed due to: Invalid state'))
          } else {
            const { body, statusCode } = await getAccessToken({
              redirectUri: spotify.getRedirectURI(),
              clientId: spotify.getClientId(),
              code: queryParams.get('code'),
              codeVerifier
            })

            if (statusCode !== 200) {
              res.writeHead(500)
              res.end('Authentication unsuccessful :(')

              return reject(new Error(`Authentication failed due to: Invalid status code [${statusCode}] received whilst requesting access token`))
            }

            appData.set(`${APP_DATA_SPOTIFY_AUTH_KEY}.access_token`, body.access_token)
            appData.set(`${APP_DATA_SPOTIFY_AUTH_KEY}.token_type`, body.token_type)
            appData.set(`${APP_DATA_SPOTIFY_AUTH_KEY}.expires_in`, body.expires_in)
            appData.set(`${APP_DATA_SPOTIFY_AUTH_KEY}.expires_at`, new Date(new Date().getTime() + (1000 * body.expires_in)))
            appData.set(`${APP_DATA_SPOTIFY_AUTH_KEY}.refresh_token`, body.refresh_token)
            appData.set(`${APP_DATA_SPOTIFY_AUTH_KEY}.scope`, body.scope)

            spotify.setAccessToken(body.access_token)

            res.writeHead(200)
            res.end('Authentication successful! You can now close this page')

            return resolve()
          }
        })

        debugAuth('Starting HTTP authentication handler')

        server.listen(SPOTIFY_APP_REDIRECT_URI_PORT)
      })

      server.close()
    } else {
      debugAuth('Authentication data present in app data, skipping authentication flow')

      // Check that the existing access token does not expire within the next minute. If
      // it does, refresh it
      if (
        new Date(
          appData.get(`${APP_DATA_SPOTIFY_AUTH_KEY}.expires_at`)
        ) <=
        new Date(
          new Date().getTime() - (1000 * 60)
        )
      ) {
        try {
          debugAuth('Access token expired, requesting refresh token')

          spotify.setRefreshToken(appData.get(`${APP_DATA_SPOTIFY_AUTH_KEY}.refresh_token`))

          const { body } = await getRefreshedAccessToken({
            refreshToken: spotify.getRefreshToken(),
            clientId: spotify.getClientId()
          })

          appData.set(`${APP_DATA_SPOTIFY_AUTH_KEY}.access_token`, body.access_token)
          appData.set(`${APP_DATA_SPOTIFY_AUTH_KEY}.token_type`, body.token_type)
          appData.set(`${APP_DATA_SPOTIFY_AUTH_KEY}.expires_in`, body.expires_in)
          appData.set(`${APP_DATA_SPOTIFY_AUTH_KEY}.expires_at`, new Date(new Date().getTime() + (1000 * body.expires_in)))
          appData.set(`${APP_DATA_SPOTIFY_AUTH_KEY}.refresh_token`, body.refresh_token)
          appData.set(`${APP_DATA_SPOTIFY_AUTH_KEY}.scope`, body.scope)

          spotify.setAccessToken(body.access_token)
        } catch (err) {
          appData.delete(APP_DATA_SPOTIFY_AUTH_KEY)

          throw new Error('An authentication error has occurred. Re-authentication is needed, please try running the command again.')
        }
      } else {
        debugAuth('Access token has not yet expired')

        spotify.setAccessToken(
          appData.get(`${APP_DATA_SPOTIFY_AUTH_KEY}.access_token`)
        )
      }
    }
  }

  debugAuth('Authentication successful!')

  // Execute tasks
  const taskIds = Object.keys(config.tasks)
  const trackCollections = {}

  debug(`${taskIds.length} tasks to execute`)

  for (const taskId of taskIds) {
    const taskConfig = config.tasks[taskId]

    debug(`Executing task: ${taskConfig.type}`)

    switch (taskConfig.type) {
      case 'album.get_tracks':
        trackCollections[taskId] = await getAlbumTracksTask.execute({ config: taskConfig, spotify })
        break
      case 'library.get_tracks':
        trackCollections[taskId] = await getLibraryTracksTask.execute({ config: taskConfig, spotify })
        break
      case 'playlist.get_tracks':
        trackCollections[taskId] = await getPlaylistTracksTask.execute({ config: taskConfig, spotify })
        break
      case 'playlist.replace_tracks':
        await replacePlaylistTracksTask.execute({ config: taskConfig, trackCollections, spotify })
        break
      case 'tracks.dedupe':
        trackCollections[taskId] = await dedupeTracksTask.execute({ config: taskConfig, trackCollections })
        break
      case 'tracks.filter':
        trackCollections[taskId] = await filterTracksTask.execute({ config: taskConfig, trackCollections })
        break
      case 'tracks.merge':
        trackCollections[taskId] = await mergeTracksTask.execute({ config: taskConfig, trackCollections })
        break
      case 'tracks.shuffle':
        trackCollections[taskId] = await shuffleTracksTask.execute({ config: taskConfig, trackCollections })
        break
      case 'tracks.sort':
        trackCollections[taskId] = await sortTracksTask.execute({ config: taskConfig, trackCollections })
        break
    }
  }
}

const cli = meow(`
  Usage

    $ playlist-pipeline <path-to-config>

      or

    $ echo 'CONFIG AS JSON' | playlist-pipeline
`)

run(cli.input[0])
