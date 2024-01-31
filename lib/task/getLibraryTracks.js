import {
  LIMIT_GET_LIBRARY_TRACKS,
  decorateTrackArtistsWithGenres,
  getTracksRecursively,
  normaliseTrack,
} from "../spotify/utils.js"

export const id = "library.get_tracks"

/**
 * Execute the task
 *
 * @param {SpotifyWebApi} spotify
 * @param {object} ctx
 *
 * @returns {Promise<object[]>}
 */
export async function execute({ spotify, ctx }) {
  try {
    const tracks = await getTracksRecursively(
      spotify.getMySavedTracks.bind(spotify),
      LIMIT_GET_LIBRARY_TRACKS,
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
    throw new Error(
      `an error occurred retrieving library tracks: ${err.message}`
    )
  }
}
