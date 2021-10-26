const Joi = require('joi')
const {
  extractIDFromURL,
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
  decorateTracksWithAudioFeatures,
  normaliseTrack,
  LIMIT_GET_ALBUM_TRACKS
} = require('../spotify/utils')

const id = 'album.get_tracks'

/**
 * Get the config schema for this task
 *
 * @returns {object}
 */
function getConfigSchema () {
  return {
    spotify_url: Joi.string().required()
  }
}

/**
 * Execute the task
 *
 * @param {object} config
 * @param {SpotifyWebApi} spotify
 *
 * @returns {Promise<object[]>}
 */
async function execute ({ config, spotify }) {
  try {
    const albumId = extractIDFromURL(config.spotify_url)

    // Get album details - We need these as the retrieved tracks from
    // spotify.getAlbumTracks do not contain album details
    const { body: albumDetails } = await spotify.getAlbum(albumId)

    const tracks = await getTracksRecursively(
      spotify.getAlbumTracks.bind(spotify, albumId),
      LIMIT_GET_ALBUM_TRACKS,
      ({ items }) => items,
      (requestBody) => requestBody
    ).then((tracks) => {
      return decorateTrackArtistsWithGenres(tracks, spotify)
    }).then((tracks) => {
      return decorateTracksWithAudioFeatures(tracks, spotify)
    })

    return tracks.map((track) => {
      track.album = albumDetails

      return normaliseTrack(track)
    })
  } catch (err) {
    throw new Error(`an error occurred retrieving album tracks: ${err.message}`)
  }
}

module.exports = {
  id,
  getConfigSchema,
  execute
}
