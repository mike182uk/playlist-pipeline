export interface Track {
  id: string
  name: string
  trackNumber: number
  album: string
  albumId: string
  albumUri: string
  releaseDate: Date
  releaseYear: number
  artist: string
  artistId: string
  artistUri: string
  uri: string
  genre: string[]
  popularity: number
  duration: number
  explicit: boolean
}

export type TrackCollection = Track[]
