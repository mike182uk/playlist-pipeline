const {
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
  LIMIT_GET_LIBRARY_TRACKS
} = require('../spotify/utils')

const id = 'library.get_tracks'

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

    return tracks.map((track) => {
      return {
        id: track.id,
        name: track.name,
        trackNumber: track.track_number,
        album: track.album.name,
        releaseDate: new Date(track.album.release_date),
        artist: track.artists[0].name,
        uri: track.uri,
        genre: track.artists[0].genres,
        popularity: track.popularity,
        duration: track.duration_ms
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
