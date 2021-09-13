#!/usr/bin/env node

require('dotenv').config()

const debug = require('debug')('app')
const meow = require('meow')
const SpotifyWebApi = require('spotify-web-api-node')

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
  debug(`Loading config from: ${configPath}`)

  // Load config
  const config = await loadYAMLConfig(configPath)
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
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  })
  spotify.setRefreshToken(process.env.REFRESH_TOKEN)

  const { body } = await spotify.refreshAccessToken()

  spotify.setAccessToken(body.access_token)

  // Execute tasks
  const trackCollections = {}

  for (const taskId of Object.keys(config.tasks)) {
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
    $ playlist-pipeline --config <path-to-config>
`)

run(cli.input[0])
