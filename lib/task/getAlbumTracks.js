const Joi = require('joi')
const {
  extractIDFromURL,
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
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
 * @param {object} ctx
 * @param {SpotifyWebApi} spotify
 *
 * @returns {Promise<object[]>}
 */
async function execute ({ config, ctx, spotify }) {
  try {
    const albumId = extractIDFromURL(config.spotify_url)

    // Get album details if required - We need to do this as the retrieved tracks from
    // spotify.getAlbumTracks do not contain album details
    let albumDetails

    if (ctx.retrieveAlbumDetails === true) {
      const { body } = await spotify.getAlbum(albumId)

      albumDetails = body
    }

    const tracks = await getTracksRecursively(
      spotify.getAlbumTracks.bind(spotify, albumId),
      LIMIT_GET_ALBUM_TRACKS,
      ({ items }) => items,
      (requestBody) => requestBody
    ).then((tracks) => {
      if (ctx.retrieveArtistGenreDetails === true) {
        return decorateTrackArtistsWithGenres(tracks, spotify)
      }

      return tracks
    })

    return tracks.map((track) => {
      if (albumDetails !== undefined) {
        track.album = albumDetails
      }

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
