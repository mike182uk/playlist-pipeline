import Joi from "joi"
import { describe, expect, test } from "vitest"

import { createTrack } from "../test/fixtures"
import { findErrorByContextLabel } from "../test/validation"

import SortTracksTask, {
  SORT_ASCENDING,
  SORT_DESCENDING,
} from "./SortTracksTask"

const task = new SortTracksTask()

test("has correct id", () => {
  expect(task.id).toBe("tracks.sort")
})

describe("getConfigSchema", () => {
  const schema = Joi.object(task.getConfigSchema())

  test(".tracks is required in the config schema", () => {
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "tracks")

    expect(err?.type).toEqual("any.required")
  })

  test(".tracks must be a string in the config schema", () => {
    const result = schema.validate(
      {
        tracks: [],
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "tracks")

    expect(err?.type).toEqual("string.base")
  })

  test(".sort is required in the config schema", () => {
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort")

    expect(err?.type).toEqual("any.required")
  })

  test(".sort is an object in the config schema", () => {
    const result = schema.validate(
      {
        sort: "foo",
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort")

    expect(err?.type).toEqual("object.base")
  })

  test(".sort.album is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          album: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort.album")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort.artist is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort.artist")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort.name is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          name: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort.name")

    expect(err).toBeDefined()
    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort.releaseDate is a string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          releaseDate: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort.releaseDate")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort.releaseYear is a string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          releaseYear: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort.releaseYear")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort.trackNumber is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          trackNumber: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort.trackNumber")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort.popularity is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          popularity: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort.popularity")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort.duration is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          duration: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort.duration")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".group_by is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: SORT_ASCENDING,
        },
        group_by: "foo",
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "group_by")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([
      "trackNumber",
      "album",
      "albumId",
      "albumUri",
      "releaseDate",
      "releaseYear",
      "artist",
      "artistId",
      "artistUri",
      "popularity",
      "duration",
      "explicit",
      "name",
    ])
  })

  test(".sort_group is an object in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: SORT_ASCENDING,
        },
        sort_group: "foo",
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort_group")

    expect(err?.type).toEqual("object.base")
  })

  test(".sort_group.trackNumber is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: SORT_ASCENDING,
        },
        sort_group: {
          trackNumber: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort_group.trackNumber")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort_group.album is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: SORT_ASCENDING,
        },
        sort_group: {
          album: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort_group.album")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort_group.albumId is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: SORT_ASCENDING,
        },
        sort_group: {
          albumId: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort_group.albumId")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort_group.albumUri is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: SORT_ASCENDING,
        },
        sort_group: {
          albumUri: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort_group.albumUri")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort_group.releaseDate is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: SORT_ASCENDING,
        },
        sort_group: {
          releaseDate: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort_group.releaseDate")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort_group.releaseYear is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: SORT_ASCENDING,
        },
        sort_group: {
          releaseYear: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort_group.releaseYear")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort_group.artist is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: SORT_ASCENDING,
        },
        sort_group: {
          artist: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort_group.artist")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort_group.artistId is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: SORT_ASCENDING,
        },
        sort_group: {
          artistId: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort_group.artistId")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort_group.artistUri is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: SORT_ASCENDING,
        },
        sort_group: {
          artistUri: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort_group.artistUri")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort_group.popularity is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: SORT_ASCENDING,
        },
        sort_group: {
          popularity: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort_group.popularity")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort_group.duration is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: SORT_ASCENDING,
        },
        sort_group: {
          duration: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort_group.duration")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort_group.explicit is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: SORT_ASCENDING,
        },
        sort_group: {
          explicit: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort_group.explicit")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test(".sort_group.name is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        sort: {
          artist: SORT_ASCENDING,
        },
        sort_group: {
          name: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort_group.name")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })
})

describe("execute", () => {
  test("sorts case insensitively by album ascending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ album: "aaa" }),
        createTrack({ album: "AAA" }),
        createTrack({ album: "ccc" }),
        createTrack({ album: "CCC" }),
        createTrack({ album: "bbb" }),
        createTrack({ album: "bbb" }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          album: SORT_ASCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.album)).toEqual(
      [
        trackCollections.foo[0],
        trackCollections.foo[1],
        trackCollections.foo[4],
        trackCollections.foo[5],
        trackCollections.foo[2],
        trackCollections.foo[3],
      ].map((track) => track.album)
    )
  })

  test("sorts case insensitively by album descending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ album: "aaa" }),
        createTrack({ album: "AAA" }),
        createTrack({ album: "ccc" }),
        createTrack({ album: "CCC" }),
        createTrack({ album: "bbb" }),
        createTrack({ album: "BBB" }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          album: SORT_DESCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.album)).toEqual([
      "ccc",
      "CCC",
      "bbb",
      "BBB",
      "aaa",
      "AAA",
    ])
  })

  test("sorts case insensitively by artist ascending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ artist: "aaa" }),
        createTrack({ artist: "AAA" }),
        createTrack({ artist: "ccc" }),
        createTrack({ artist: "CCC" }),
        createTrack({ artist: "bbb" }),
        createTrack({ artist: "BBB" }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          artist: SORT_ASCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.artist)).toEqual([
      "aaa",
      "AAA",
      "bbb",
      "BBB",
      "ccc",
      "CCC",
    ])
  })

  test("sorts case insensitively by artist descending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ artist: "aaa" }),
        createTrack({ artist: "AAA" }),
        createTrack({ artist: "ccc" }),
        createTrack({ artist: "CCC" }),
        createTrack({ artist: "bbb" }),
        createTrack({ artist: "BBB" }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          artist: SORT_DESCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.artist)).toEqual([
      "ccc",
      "CCC",
      "bbb",
      "BBB",
      "aaa",
      "AAA",
    ])
  })

  test("sorts case insensitively by name ascending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ name: "aaa" }),
        createTrack({ name: "AAA" }),
        createTrack({ name: "ccc" }),
        createTrack({ name: "CCC" }),
        createTrack({ name: "bbb" }),
        createTrack({ name: "BBB" }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          name: SORT_ASCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.name)).toEqual([
      "aaa",
      "AAA",
      "bbb",
      "BBB",
      "ccc",
      "CCC",
    ])
  })

  test("sorts case insensitively by name descending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ name: "aaa" }),
        createTrack({ name: "AAA" }),
        createTrack({ name: "ccc" }),
        createTrack({ name: "CCC" }),
        createTrack({ name: "bbb" }),
        createTrack({ name: "BBB" }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          name: SORT_DESCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.name)).toEqual([
      "ccc",
      "CCC",
      "bbb",
      "BBB",
      "aaa",
      "AAA",
    ])
  })

  test("sorts by release date ascending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ releaseDate: new Date("2003-01-10") }),
        createTrack({ releaseDate: new Date("2001-11-15") }),
        createTrack({ releaseDate: new Date("2004-09-13") }),
        createTrack({ releaseDate: new Date("2003-01-28") }),
        createTrack({ releaseDate: new Date("2001-02-05") }),
        createTrack({ releaseDate: new Date("2004-02-06") }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          releaseDate: SORT_ASCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.releaseDate)).toEqual([
      new Date("2001-02-05"),
      new Date("2001-11-15"),
      new Date("2003-01-10"),
      new Date("2003-01-28"),
      new Date("2004-02-06"),
      new Date("2004-09-13"),
    ])
  })

  test("sorts by release date descending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ releaseDate: new Date("2003-01-10") }),
        createTrack({ releaseDate: new Date("2001-11-15") }),
        createTrack({ releaseDate: new Date("2004-09-13") }),
        createTrack({ releaseDate: new Date("2003-01-28") }),
        createTrack({ releaseDate: new Date("2001-02-05") }),
        createTrack({ releaseDate: new Date("2004-02-06") }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          releaseDate: SORT_DESCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.releaseDate)).toEqual([
      new Date("2004-09-13"),
      new Date("2004-02-06"),
      new Date("2003-01-28"),
      new Date("2003-01-10"),
      new Date("2001-11-15"),
      new Date("2001-02-05"),
    ])
  })

  test("sorts by release year ascending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ releaseYear: 2003 }),
        createTrack({ releaseYear: 2001 }),
        createTrack({ releaseYear: 2004 }),
        createTrack({ releaseYear: 2003 }),
        createTrack({ releaseYear: 2001 }),
        createTrack({ releaseYear: 2004 }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          releaseYear: SORT_ASCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.releaseYear)).toEqual([
      2001, 2001, 2003, 2003, 2004, 2004,
    ])
  })

  test("sorts by release year descending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ releaseYear: 2003 }),
        createTrack({ releaseYear: 2001 }),
        createTrack({ releaseYear: 2004 }),
        createTrack({ releaseYear: 2003 }),
        createTrack({ releaseYear: 2001 }),
        createTrack({ releaseYear: 2004 }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          releaseYear: SORT_DESCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.releaseYear)).toEqual([
      2004, 2004, 2003, 2003, 2001, 2001,
    ])
  })

  test("sorts by track number ascending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ artist: "aaa", trackNumber: 2 }),
        createTrack({ artist: "aaa", trackNumber: 1 }),
        createTrack({ artist: "ccc", trackNumber: 3 }),
        createTrack({ artist: "ccc", trackNumber: 4 }),
        createTrack({ artist: "bbb", trackNumber: 1 }),
        createTrack({ artist: "bbb", trackNumber: 7 }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          trackNumber: SORT_ASCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.trackNumber)).toEqual([
      1, 1, 2, 3, 4, 7,
    ])
  })

  test("sorts by track number descending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ artist: "aaa", trackNumber: 2 }),
        createTrack({ artist: "aaa", trackNumber: 1 }),
        createTrack({ artist: "ccc", trackNumber: 3 }),
        createTrack({ artist: "ccc", trackNumber: 4 }),
        createTrack({ artist: "bbb", trackNumber: 1 }),
        createTrack({ artist: "bbb", trackNumber: 7 }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          trackNumber: SORT_DESCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.trackNumber)).toEqual([
      7, 4, 3, 2, 1, 1,
    ])
  })

  test("sorts by popularity ascending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ popularity: 21 }),
        createTrack({ popularity: 17 }),
        createTrack({ popularity: 55 }),
        createTrack({ popularity: 41 }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          popularity: SORT_ASCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.popularity)).toEqual([
      17, 21, 41, 55,
    ])
  })

  test("sorts by popularity descending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ popularity: 21 }),
        createTrack({ popularity: 17 }),
        createTrack({ popularity: 55 }),
        createTrack({ popularity: 41 }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          popularity: SORT_DESCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.popularity)).toEqual([
      55, 41, 21, 17,
    ])
  })

  test("sorts by duration ascending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ duration: 200100 }),
        createTrack({ duration: 115000 }),
        createTrack({ duration: 215123 }),
        createTrack({ duration: 200301 }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          duration: SORT_ASCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.duration)).toEqual([
      115000, 200100, 200301, 215123,
    ])
  })

  test("sorts by duration descending", async () => {
    const trackCollections = {
      foo: [
        createTrack({ duration: 200100 }),
        createTrack({ duration: 115000 }),
        createTrack({ duration: 215123 }),
        createTrack({ duration: 200301 }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          duration: SORT_DESCENDING,
        },
      },
      trackCollections,
    })

    expect(sortedTracks.map((track) => track.duration)).toEqual([
      215123, 200301, 200100, 115000,
    ])
  })

  test("sorts by multiple fields", async () => {
    const trackCollections = {
      foo: [
        createTrack({ artist: "aaa", releaseDate: new Date("2003-01-01") }),
        createTrack({ artist: "aaa", releaseDate: new Date("2001-01-01") }),
        createTrack({ artist: "ccc", releaseDate: new Date("2004-01-01") }),
        createTrack({ artist: "ccc", releaseDate: new Date("2003-01-01") }),
        createTrack({ artist: "bbb", releaseDate: new Date("2001-01-01") }),
        createTrack({ artist: "bbb", releaseDate: new Date("2004-01-01") }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        sort: {
          artist: SORT_ASCENDING,
          releaseDate: SORT_ASCENDING,
        },
      },
      trackCollections,
    })

    expect(
      sortedTracks.map((track) => ({
        artist: track.artist,
        releaseDate: track.releaseDate,
      }))
    ).toEqual([
      { artist: "aaa", releaseDate: new Date("2001-01-01") },
      { artist: "aaa", releaseDate: new Date("2003-01-01") },
      { artist: "bbb", releaseDate: new Date("2001-01-01") },
      { artist: "bbb", releaseDate: new Date("2004-01-01") },
      { artist: "ccc", releaseDate: new Date("2003-01-01") },
      { artist: "ccc", releaseDate: new Date("2004-01-01") },
    ])
  })

  test("groups and sorts", async () => {
    const trackCollections = {
      foo: [
        createTrack({ album: "bbb", trackNumber: 2 }),
        createTrack({ album: "aaa", trackNumber: 1 }),
        createTrack({ album: "aaa", trackNumber: 3 }),
        createTrack({ album: "bbb", trackNumber: 1 }),
        createTrack({ album: "bbb", trackNumber: 3 }),
        createTrack({ album: "aaa", trackNumber: 2 }),
      ],
    }

    const sortedTracks = await task.execute({
      config: {
        tracks: "foo",
        group_by: "album",
        sort: {
          trackNumber: SORT_ASCENDING,
        },
        sort_group: {
          album: SORT_DESCENDING,
        },
      },
      trackCollections,
    })

    expect(
      sortedTracks.map((track) => ({
        album: track.album,
        trackNumber: track.trackNumber,
      }))
    ).toEqual([
      { album: "bbb", trackNumber: 1 },
      { album: "bbb", trackNumber: 2 },
      { album: "bbb", trackNumber: 3 },
      { album: "aaa", trackNumber: 1 },
      { album: "aaa", trackNumber: 2 },
      { album: "aaa", trackNumber: 3 },
    ])
  })

  test("throws an error if an invalid track source is provided in the config", async () => {
    const trackCollectionName = "foo"

    await expect(
      task.execute({
        config: {
          tracks: trackCollectionName,
          sort: {
            album: SORT_ASCENDING,
          },
        },
        trackCollections: {},
      })
    ).rejects.toThrow(`"${trackCollectionName}" is not a valid track source`)
  })
})
