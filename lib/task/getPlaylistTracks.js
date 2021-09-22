const Joi = require('joi')
const {
  extractIDFromURL,
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
  LIMIT_GET_PLAYLISTS_TRACKS
} = require('../spotify/utils')

const id = 'playlist.get_tracks'

function getConfigSchema () {
  return {
    spotify_url: Joi.string().required()
  }
}

async function execute ({ config, spotify }) {
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
      return decorateTrackArtistsWithGenres(tracks, spotify)
    })

    return tracks.map((track) => {
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
    throw new Error(`An error occurred retrieving playlist tracks: ${err.message}`)
  }
}

module.exports = {
  id,
  getConfigSchema,
  execute
}
