import { chunk, find, uniq } from "lodash-es"

export const LIMIT_ADD_TRACKS_TO_PLAYLIST = 100
export const LIMIT_GET_ARTISTS = 50
export const LIMIT_GET_ALBUM_TRACKS = 50
export const LIMIT_GET_LIBRARY_TRACKS = 50
export const LIMIT_GET_PLAYLISTS_TRACKS = 100

/**
 * Extract a resource ID from a Spotify URL
 *
 * @param {string} url
 *
 * @returns {string}
 */
export function extractIDFromURL(url) {
  return new URL(url).pathname.split("/").pop()
}

/**
 * Retrieve tracks recursively using the provided parameters
 *
 * @param {Function} getTracks
 * @param {number} limit
 * @param {Function} resolveTracks
 * @param {Function} resolvePaginationMeta
 *
 * @returns {Promise<object[]>}
 */
export async function getTracksRecursively(
  getTracks,
  limit,
  resolveTracks,
  resolvePaginationMeta
) {
  let tracks = []
  let currentOffset = 0
  let fetchNextPage = true

  while (fetchNextPage) {
    fetchNextPage = false

    const { body } = await getTracks({
      limit,
      offset: currentOffset,
    })

    tracks = [...tracks, ...resolveTracks(body)]

    if (resolvePaginationMeta(body).next !== null) {
      fetchNextPage = true
      currentOffset += limit
    }
  }

  return tracks.map((track) => {
    if (track.track) return track.track

    return track
  })
}

/**
 * Decorate the provided tracks with their artists
 *
 * @param {object[]} tracks
 * @param {SpotifyWebApi} spotify
 * @param {number} limit
 *
 * @returns {Promise<object[]>}
 */
export async function decorateTrackArtistsWithGenres(
  tracks,
  spotify,
  limit = LIMIT_GET_ARTISTS
) {
  if (limit > LIMIT_GET_ARTISTS) {
    throw new Error(
      `only ${LIMIT_GET_ARTISTS} artists can be retrieved at a time`
    )
  }

  let artists = []

  const uniqueArtistIds = uniq(
    tracks
      .map((track) => track.artists)
      // track.artists is an array so need to extract the id from each item
      .reduce((artistIds, trackArtists) => {
        for (const trackArtist of trackArtists) {
          artistIds.push(trackArtist.id)
        }

        return artistIds
      }, [])
  )

  // spotify.getArtists only allows a certain amount of ids in a single request so we need to
  // make multiple requests if there are more than GET_ARTISTS_MAX_LIMIT ids
  const chunkedArtistIds = chunk(uniqueArtistIds, limit)

  for (const artistIdsChunk of chunkedArtistIds) {
    const { body } = await spotify.getArtists(artistIdsChunk)

    artists = [...artists, ...body.artists]
  }

  return tracks.map((track) => {
    for (const idx in track.artists) {
      track.artists[idx].genres = find(artists, {
        id: track.artists[idx].id,
      }).genres
    }

    return track
  })
}

/**
 * Normalise a track
 *
 * @param {object} track
 *
 * @returns {object}
 */
export function normaliseTrack(track) {
  return {
    id: track.id,
    name: track.name,
    trackNumber: track.track_number,
    album: track.album.name,
    albumId: track.album.id,
    albumUri: track.album.uri,
    releaseDate: new Date(track.album.release_date),
    releaseYear: new Date(track.album.release_date).getFullYear(),
    artist: track.artists[0].name,
    artistId: track.artists[0].id,
    artistUri: track.artists[0].uri,
    uri: track.uri,
    genre: track.artists[0].genres,
    popularity: track.popularity,
    duration: track.duration_ms,
    explicit: track.explicit,
  }
}
