import { faker } from "@faker-js/faker"
import { vi } from "vitest"

import type { ProviderService } from "../provider"
import type { Track } from "../track"

export enum UriType {
  Album = "album",
  Artist = "artist",
  Playlist = "playlist",
  Track = "track",
}

export function createUri(
  type: UriType,
  id: string = faker.string.uuid()
): string {
  return `https://abc.xyz/${type}/${id}`
}

export function createTrack(props: Partial<Track> = {}): Track {
  const {
    id = faker.string.uuid(),
    name = faker.music.songName(),
    trackNumber = faker.number.int({ max: 20 }),
    album = faker.music.songName(),
    artist = faker.music.songName(),
    releaseDate = faker.date.anytime(),
    genre = Array(3)
      .fill(null)
      .map(() => faker.music.genre()),
    popularity = faker.number.int({ min: 50, max: 100 }),
    duration = faker.number.int({ min: 1000, max: 1000 * 300 }),
    explicit = faker.datatype.boolean(),
    albumId = faker.string.uuid(),
    artistId = faker.string.uuid(),
  } = props

  const releaseYear = props.releaseYear || new Date(releaseDate).getFullYear()
  const uri = createUri(UriType.Track, id)
  const albumUri = createUri(UriType.Album, albumId)
  const artistUri = createUri(UriType.Artist, artistId)

  return {
    id,
    name,
    trackNumber,
    album,
    albumId,
    albumUri,
    releaseDate,
    releaseYear,
    artist,
    artistId,
    artistUri,
    uri,
    genre,
    popularity,
    duration,
    explicit,
  }
}

export function createProviderService(): ProviderService {
  return {
    getAlbumTracks: vi.fn(),
    getLibraryTracks: vi.fn(),
    getPlaylistTracks: vi.fn(),
    replaceTracksInPlaylist: vi.fn(),
    updatePlaylistDetails: vi.fn(),
  }
}
