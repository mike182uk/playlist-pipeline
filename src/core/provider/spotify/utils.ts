import type { Track } from "../../track"

interface SpotifyTrack {
  id: string
  name: string
  track_number: number
  album: {
    id: string
    name: string
    release_date: string
    uri: string
  }
  artists: {
    id: string
    name: string
    genres: string[]
    uri: string
  }[]
  uri: string
  popularity: number
  duration_ms: number
  explicit: boolean
}

export function extractIdFromUrl(url: string): string {
  return new URL(url).pathname.split("/").pop() || ""
}

export function normaliseTrack(track: SpotifyTrack): Track {
  const releaseDate = new Date(track.album.release_date)

  return {
    id: track.id,
    name: track.name,
    trackNumber: track.track_number,
    album: track.album.name,
    albumId: track.album.id,
    albumUri: track.album.uri,
    releaseDate,
    releaseYear: releaseDate.getFullYear(),
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
