const Joi = require('joi')
const {
  extractIDFromURL,
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
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

    // Get album details - We need these as the retrieved tracks below do not contain album details
    const { body: albumDetails, statusCode } = await spotify.getAlbum(albumId)

    if (statusCode !== 200) {
      throw new Error(`Invalid status code returned [${statusCode}] whilst retrieving album details`)
    }

    // Get album tracks - We get these independently from the album details above
    // as the tracks contained in the retrieved album are paginated and we would not
    // be able to use spotify.getAlbum as a track retriever (because we need other
    // data in the response, not just the tracks, which getTracksRecursively will
    // assume we want)
    const tracks = await getTracksRecursively(
      spotify.getAlbumTracks.bind(spotify, albumId),
      LIMIT_GET_ALBUM_TRACKS,
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
        album: albumDetails.name,
        releaseDate: new Date(albumDetails.release_date),
        artist: track.artists[0].name,
        uri: track.uri,
        genre: track.artists[0].genres,
        popularity: track.popularity,
        duration: track.duration_ms,
        explicit: track.explicit
      }
    })
  } catch (err) {
    throw new Error(`An error occurred retrieving album tracks: ${err.message}`)
  }
}

module.exports = {
  id,
  getConfigSchema,
  execute
}
