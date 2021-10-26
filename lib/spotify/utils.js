const { chunk, find, uniq } = require('lodash')

const LIMIT_ADD_TRACKS_TO_PLAYLIST = 100
const LIMIT_GET_ARTISTS = 50
const LIMIT_GET_ALBUM_TRACKS = 50
const LIMIT_GET_LIBRARY_TRACKS = 50
const LIMIT_GET_PLAYLISTS_TRACKS = 100
const LIMIT_GET_TRACKS_AUDIO_FEATURES = 100

/**
 * Extract a resource ID from a Spotify URL
 *
 * @param {string} url
 *
 * @returns {string}
 */
function extractIDFromURL (url) {
  return new URL(url).pathname.split('/').pop()
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
async function getTracksRecursively (getTracks, limit, resolveTracks, resolvePaginationMeta) {
  let tracks = []
  let currentOffset = 0
  let fetchNextPage = true

  while (fetchNextPage) {
    fetchNextPage = false

    const { body } = await getTracks({
      limit,
      offset: currentOffset
    })

    tracks = [
      ...tracks,
      ...resolveTracks(body)
    ]

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
async function decorateTrackArtistsWithGenres (tracks, spotify, limit = LIMIT_GET_ARTISTS) {
  if (limit > LIMIT_GET_ARTISTS) {
    throw new Error(`only ${LIMIT_GET_ARTISTS} artists can be retrieved at a time`)
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

    artists = [
      ...artists,
      ...body.artists
    ]
  }

  return tracks.map((track) => {
    for (const idx in track.artists) {
      track.artists[idx].genres = find(
        artists,
        {
          id: track.artists[idx].id
        }
      ).genres
    }

    return track
  })
}

/**
 * Decorate the provided tracks with their audio features
 *
 * @param {object[]} tracks
 * @param {SpotifyWebApi} spotify
 * @param {number} limit
 *
 * @returns {Promise<object[]>}
 */
async function decorateTracksWithAudioFeatures (tracks, spotify, limit = LIMIT_GET_TRACKS_AUDIO_FEATURES) {
  if (limit > LIMIT_GET_TRACKS_AUDIO_FEATURES) {
    throw new Error(`only ${LIMIT_GET_TRACKS_AUDIO_FEATURES} track audio features can be retrieved at a time`)
  }

  const trackAudioFeatures = {}
  const trackIds = tracks.map(({ id }) => id)

  // spotify.getAudioFeaturesForTracks only allows a certain amount of ids in a single request so we need to
  // make multiple requests if there are more than LIMIT_GET_TRACKS_AUDIO_FEATURES ids
  const chunkedTrackIds = chunk(trackIds, limit)

  for (const trackIdsChunk of chunkedTrackIds) {
    const { body } = await spotify.getAudioFeaturesForTracks(trackIdsChunk)

    body.audio_features.forEach((features) => {
      trackAudioFeatures[features.id] = features
    })
  }

  return tracks.map((track) => {
    const audioFeatures = trackAudioFeatures[track.id]

    track.audio_features = {
      acousticness: audioFeatures.acousticness,
      danceability: audioFeatures.danceability,
      energy: audioFeatures.energy,
      instrumentalness: audioFeatures.instrumentalness,
      key: audioFeatures.key,
      liveness: audioFeatures.liveness,
      loudness: audioFeatures.loudness,
      mode: audioFeatures.mode,
      speechiness: audioFeatures.speechiness,
      tempo: audioFeatures.tempo,
      time_signature: audioFeatures.time_signature,
      valence: audioFeatures.valence
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
function normaliseTrack (track) {
  return {
    id: track.id,
    name: track.name,
    trackNumber: track.track_number,
    album: track.album.name,
    albumId: track.album.id,
    albumUri: track.album.uri,
    releaseDate: new Date(track.album.release_date),
    artist: track.artists[0].name,
    artistId: track.artists[0].id,
    artistUri: track.artists[0].uri,
    uri: track.uri,
    genre: track.artists[0].genres,
    popularity: track.popularity,
    duration: track.duration_ms,
    explicit: track.explicit,
    acousticness: track.audio_features.acousticness,
    danceability: track.audio_features.danceability,
    energy: track.audio_features.energy,
    instrumentalness: track.audio_features.instrumentalness,
    key: track.audio_features.key,
    liveness: track.audio_features.liveness,
    loudness: track.audio_features.loudness,
    mode: track.audio_features.mode,
    speechiness: track.audio_features.speechiness,
    tempo: track.audio_features.tempo,
    timeSignature: track.audio_features.time_signature,
    valence: track.audio_features.valence
  }
}

module.exports = {
  extractIDFromURL,
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
  decorateTracksWithAudioFeatures,
  normaliseTrack,
  LIMIT_ADD_TRACKS_TO_PLAYLIST,
  LIMIT_GET_ARTISTS,
  LIMIT_GET_ALBUM_TRACKS,
  LIMIT_GET_LIBRARY_TRACKS,
  LIMIT_GET_PLAYLISTS_TRACKS,
  LIMIT_GET_TRACKS_AUDIO_FEATURES
}
