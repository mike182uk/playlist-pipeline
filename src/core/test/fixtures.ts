import { faker } from "@faker-js/faker"
import { Track } from "../track"

function generateUri(type: "track" | "album" | "artist", id: string): string {
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
  const uri = generateUri("track", id)
  const albumUri = generateUri("album", albumId)
  const artistUri = generateUri("artist", artistId)

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
