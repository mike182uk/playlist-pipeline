const Joi = require('joi')
const {
  extractIDFromURL,
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
  normaliseTrack,
  LIMIT_GET_PLAYLISTS_TRACKS
} = require('../spotify/utils')

const id = 'playlist.get_tracks'

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
    const tracks = await getTracksRecursively(
      spotify.getPlaylistTracks.bind(
        spotify,
        extractIDFromURL(config.spotify_url)
      ),
      LIMIT_GET_PLAYLISTS_TRACKS,
      ({ items }) => items,
      (requestBody) => requestBody
    ).then((tracks) => {
      if (ctx.retrieveArtistGenreDetails === true) {
        return decorateTrackArtistsWithGenres(tracks, spotify)
      }

      return tracks
    })

    return tracks.map((track) => normaliseTrack(track))
  } catch (err) {
    throw new Error(`an error occurred retrieving playlist tracks: ${err.message}`)
  }
}

module.exports = {
  id,
  getConfigSchema,
  execute
}
