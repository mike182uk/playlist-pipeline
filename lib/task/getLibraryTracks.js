const {
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
  GET_LIBRARY_TRACKS_MAX_LIMIT
} = require('../util/spotify')

const id = 'library.get_tracks'

async function execute ({ spotify }) {
  try {
    const tracks = await getTracksRecursively(
      spotify.getMySavedTracks.bind(spotify),
      GET_LIBRARY_TRACKS_MAX_LIMIT,
      ({ items }) => items,
      (requestBody) => requestBody
    ).then((tracks) => {
      return decorateTrackArtistsWithGenres(tracks, spotify)
    })

    return tracks.map(({ track }) => {
      return {
        id: track.id,
        name: track.name,
        trackNumber: track.track_number,
        album: track.album.name,
        releaseDate: track.album.release_date,
        artist: track.artists[0].name,
        uri: track.uri,
        genre: track.artists[0].genres
      }
    })
  } catch (err) {
    throw new Error(`An error occurred retrieving library tracks: ${err.message}`)
  }
}

module.exports = {
  id,
  execute
}
