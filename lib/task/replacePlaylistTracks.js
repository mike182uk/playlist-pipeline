const _ = require('lodash')
const Joi = require('joi')
const {
  extractIDFromURL,
  ADD_TRACKS_TO_PLAYLIST_MAX_LIMIT
} = require('../util/spotify')

const id = 'playlist.replace_tracks'

function getConfigSchema () {
  return {
    spotify_url: Joi.string().required(),
    tracks: Joi.string().required()
  }
}

async function execute ({ config, spotify, trackCollections }) {
  const tracks = trackCollections[config.tracks]

  if (tracks === undefined) {
    throw new Error(`${config.tracks} is not a valid track source`)
  }

  const playlistId = extractIDFromURL(config.spotify_url)

  try {
    // Clear the playlist - We can't use spotify.replaceTracksInPlaylist to actually
    // replace all of the tracks as it has a 100 track limit
    const { statusCode: clearTracksStatusCode } = await spotify.replaceTracksInPlaylist(
      playlistId,
      []
    )

    if (clearTracksStatusCode !== 201) {
      throw new Error(`Invalid status code returned: ${clearTracksStatusCode} whilst clearing tracks in playlist`)
    }

    // spotify.addTracksToPlaylist only allows a certain amount of uris in a single request so we need to
    // make multiple requests if there are more than ADD_TRACKS_TO_PLAYLIST_MAX_LIMIT uris
    const trackUris = tracks.map(({ uri }) => uri)
    const chunkedTrackUris = _.chunk(trackUris, ADD_TRACKS_TO_PLAYLIST_MAX_LIMIT)

    for (const trackUrisChunk of chunkedTrackUris) {
      const { statusCode } = await spotify.addTracksToPlaylist(playlistId, trackUrisChunk)

      if (statusCode !== 201) {
        throw new Error(`Invalid status code returned: ${statusCode} whilst replacing tracks in playlist`)
      }
    }
  } catch (err) {
    throw new Error(`An error occurred replacing playlist tracks: ${err.message}`)
  }
}

module.exports = {
  id,
  getConfigSchema,
  execute
}
