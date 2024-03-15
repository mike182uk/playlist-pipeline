import { describe, expect, test } from "vitest"

import { UriType, createUri } from "../../test/fixtures"
import { extractIdFromUrl, normaliseTrack } from "./utils"

describe("extractIdFromUrl", () => {
  test("extracts an ID from the URL", () => {
    const id = "abc123"
    const url = `${createUri(UriType.Playlist, id)}?foo=bar`

    expect(extractIdFromUrl(url)).toEqual(id)
  })
})

describe("normaliseTrack", () => {
  test("normalises track", () => {
    const track = {
      id: "id",
      name: "name",
      track_number: 123,
      album: {
        id: "album id",
        name: "album name",
        release_date: "2003-01-01",
        uri: "album uri",
      },
      artists: [
        {
          id: "artist id",
          name: "artist name",
          genres: ["genre 1", "genre 2", "genre 3"],
          uri: "artist uri",
        },
      ],
      uri: "uri",
      popularity: 456,
      duration_ms: 789,
      explicit: false,
    }
    const normalisedTrack = {
      id: "id",
      name: "name",
      trackNumber: 123,
      album: "album name",
      albumId: "album id",
      albumUri: "album uri",
      releaseDate: new Date(2003, 0, 1),
      releaseYear: 2003,
      artist: "artist name",
      artistId: "artist id",
      artistUri: "artist uri",
      uri: "uri",
      genre: ["genre 1", "genre 2", "genre 3"],
      popularity: 456,
      duration: 789,
      explicit: false,
    }

    expect(normaliseTrack(track)).toEqual(normalisedTrack)
  })
})
