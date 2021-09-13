const { chunk, find, uniq } = require('lodash')

const ADD_TRACKS_TO_PLAYLIST_MAX_LIMIT = 100
const GET_ARTISTS_MAX_LIMIT = 50
const GET_PLAYLISTS_TRACKS_MAX_LIMIT = 100
const GET_LIBRARY_TRACKS_MAX_LIMIT = 50
const GET_ALBUM_TRACKS_MAX_LIMIT = 50

function extractIDFromURL (url) {
  return new URL(url).pathname.split('/').pop()
}

async function getTracksRecursively (getTracks, maxLimit, resolveTracks, resolvePaginationMeta) {
  let tracks = []
  let currentOffset = 0
  let fetchNextPage = true

  while (fetchNextPage) {
    fetchNextPage = false

    const { body, statusCode } = await getTracks({
      limit: maxLimit,
      offset: currentOffset
    })

    if (statusCode !== 200) {
      throw new Error(`Invalid status code returned: ${statusCode} whilst executing: ${getTracks.name} with limit: ${maxLimit} and offset: ${currentOffset}`)
    }

    tracks = [
      ...tracks,
      ...resolveTracks(body)
    ]

    if (resolvePaginationMeta(body).next !== null) {
      fetchNextPage = true
      currentOffset += maxLimit
    }
  }

  return tracks
}

async function decorateTracksWithArtistGenres (tracks, spotify, getArtistsMaxLimit = GET_ARTISTS_MAX_LIMIT) {
  if (getArtistsMaxLimit > GET_ARTISTS_MAX_LIMIT) {
    throw new Error(`Only ${GET_ARTISTS_MAX_LIMIT} artists can be retrieved at a time`)
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
  const chunkedArtistIds = chunk(uniqueArtistIds, getArtistsMaxLimit)

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
  decorateTracksWithArtistGenres,
  GET_ARTISTS_MAX_LIMIT,
  GET_PLAYLISTS_TRACKS_MAX_LIMIT,
  GET_LIBRARY_TRACKS_MAX_LIMIT,
  GET_ALBUM_TRACKS_MAX_LIMIT,
  ADD_TRACKS_TO_PLAYLIST_MAX_LIMIT
}
