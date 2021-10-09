const {
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
  normaliseTrack,
  LIMIT_GET_LIBRARY_TRACKS
} = require('../spotify/utils')

const id = 'library.get_tracks'

/**
 * Execute the task
 *
 * @param {SpotifyWebApi} spotify
 *
 * @returns {Promise<object[]>}
 */
async function execute ({ spotify }) {
  try {
    const tracks = await getTracksRecursively(
      spotify.getMySavedTracks.bind(spotify),
      LIMIT_GET_LIBRARY_TRACKS,
      ({ items }) => items,
      (requestBody) => requestBody
    ).then((tracks) => {
      return decorateTrackArtistsWithGenres(tracks, spotify)
    })

    return tracks.map((track) => normaliseTrack(track))
  } catch (err) {
    throw new Error(`an error occurred retrieving library tracks: ${err.message}`)
  }
}

module.exports = {
  id,
  execute
}
