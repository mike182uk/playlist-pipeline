const { chunk, find, uniq } = require('lodash')

const LIMIT_ADD_TRACKS_TO_PLAYLIST = 100
const LIMIT_GET_ARTISTS = 50
const LIMIT_GET_ALBUM_TRACKS = 50
const LIMIT_GET_LIBRARY_TRACKS = 50
const LIMIT_GET_PLAYLISTS_TRACKS = 100

function extractIDFromURL (url) {
  return new URL(url).pathname.split('/').pop()
}

async function getTracksRecursively (getTracks, limit, resolveTracks, resolvePaginationMeta) {
  let tracks = []
  let currentOffset = 0
  let fetchNextPage = true

  while (fetchNextPage) {
    fetchNextPage = false

    const { body, statusCode } = await getTracks({
      limit: limit,
      offset: currentOffset
    })

    if (statusCode !== 200) {
      throw new Error(`Invalid status code returned: ${statusCode} whilst executing: ${getTracks.name} with limit: ${limit} and offset: ${currentOffset}`)
    }

    tracks = [
      ...tracks,
      ...resolveTracks(body)
    ]

    if (resolvePaginationMeta(body).next !== null) {
      fetchNextPage = true
      currentOffset += limit
    }
  }

  return tracks
}

async function decorateTrackArtistsWithGenres (tracks, spotify, limit = LIMIT_GET_ARTISTS) {
  if (limit > LIMIT_GET_ARTISTS) {
    throw new Error(`Only ${LIMIT_GET_ARTISTS} artists can be retrieved at a time`)
  }

  let artists = []

  const uniqueArtistIds = uniq(
    tracks
      .map(({ track }) => track.artists)
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
    const { body, statusCode } = await spotify.getArtists(artistIdsChunk)

    if (statusCode !== 200) {
      throw new Error(`Invalid status code returned: ${statusCode} whilst retrieving artist data`)
    }

    artists = [
      ...artists,
      ...body.artists
    ]
  }

  return tracks.map((track) => {
    const trackArtists = track.track.artists

    for (const idx in trackArtists) {
      trackArtists[idx].genres = find(
        artists,
        {
          id: trackArtists[idx].id
        }
      ).genres
    }

    return track
  })
}

module.exports = {
  extractIDFromURL,
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
  LIMIT_ADD_TRACKS_TO_PLAYLIST,
  LIMIT_GET_ARTISTS,
  LIMIT_GET_ALBUM_TRACKS,
  LIMIT_GET_LIBRARY_TRACKS,
  LIMIT_GET_PLAYLISTS_TRACKS
}
