import Joi from "joi"
import { findErrorByContextLabel } from "../test/validationUtils.js"
import {
  SORT_ASCENDING,
  SORT_DESCENDING,
  execute,
  getConfigSchema,
  id,
} from "./sortTracks.js"

test("has correct id", () => {
  expect(id).toBe("tracks.sort")
})

describe("getConfigSchema", () => {
  const schema = Joi.object(getConfigSchema())

  test(".tracks is required in the config schema", () => {
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "tracks")

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.required")
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("string.base")
  })

  test(".sort is required in the config schema", () => {
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "sort")

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.required")
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("object.base")
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("object.base")
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
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

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })
})

describe("execute", () => {
  test("sorts case insensitively by album ascending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          album: SORT_ASCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { album: "aaa" },
          { album: "AAA" },
          { album: "ccc" },
          { album: "CCC" },
          { album: "bbb" },
          { album: "bbb" },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { album: "aaa" },
      { album: "AAA" },
      { album: "bbb" },
      { album: "bbb" },
      { album: "ccc" },
      { album: "CCC" },
    ])
  })

  test("sorts case insensitively by album descending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          album: SORT_DESCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { album: "aaa" },
          { album: "AAA" },
          { album: "ccc" },
          { album: "CCC" },
          { album: "bbb" },
          { album: "bbb" },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { album: "ccc" },
      { album: "CCC" },
      { album: "bbb" },
      { album: "bbb" },
      { album: "aaa" },
      { album: "AAA" },
    ])
  })

  test("sorts case insensitively by artist ascending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          artist: SORT_ASCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { artist: "aaa" },
          { artist: "AAA" },
          { artist: "ccc" },
          { artist: "CCC" },
          { artist: "bbb" },
          { artist: "bbb" },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { artist: "aaa" },
      { artist: "AAA" },
      { artist: "bbb" },
      { artist: "bbb" },
      { artist: "ccc" },
      { artist: "CCC" },
    ])
  })

  test("sorts case insensitively by artist descending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          artist: SORT_DESCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { artist: "aaa" },
          { artist: "AAA" },
          { artist: "ccc" },
          { artist: "CCC" },
          { artist: "bbb" },
          { artist: "bbb" },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { artist: "ccc" },
      { artist: "CCC" },
      { artist: "bbb" },
      { artist: "bbb" },
      { artist: "aaa" },
      { artist: "AAA" },
    ])
  })

  test("sorts case insensitively by name ascending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          name: SORT_ASCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { name: "aaa" },
          { name: "AAA" },
          { name: "ccc" },
          { name: "CCC" },
          { name: "bbb" },
          { name: "bbb" },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { name: "aaa" },
      { name: "AAA" },
      { name: "bbb" },
      { name: "bbb" },
      { name: "ccc" },
      { name: "CCC" },
    ])
  })

  test("sorts case insensitively by name descending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          name: SORT_DESCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { name: "aaa" },
          { name: "AAA" },
          { name: "ccc" },
          { name: "CCC" },
          { name: "bbb" },
          { name: "bbb" },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { name: "ccc" },
      { name: "CCC" },
      { name: "bbb" },
      { name: "bbb" },
      { name: "aaa" },
      { name: "AAA" },
    ])
  })

  test("sorts by release date ascending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          releaseDate: SORT_ASCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { releaseDate: new Date("2003-01-10") },
          { releaseDate: new Date("2001-11-15") },
          { releaseDate: new Date("2004-09-13") },
          { releaseDate: new Date("2003-01-28") },
          { releaseDate: new Date("2001-02-05") },
          { releaseDate: new Date("2004-02-06") },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { releaseDate: new Date("2001-02-05") },
      { releaseDate: new Date("2001-11-15") },
      { releaseDate: new Date("2003-01-10") },
      { releaseDate: new Date("2003-01-28") },
      { releaseDate: new Date("2004-02-06") },
      { releaseDate: new Date("2004-09-13") },
    ])
  })

  test("sorts by release date descending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          releaseDate: SORT_DESCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { releaseDate: new Date("2003-01-10") },
          { releaseDate: new Date("2001-11-15") },
          { releaseDate: new Date("2004-09-13") },
          { releaseDate: new Date("2003-01-28") },
          { releaseDate: new Date("2001-02-05") },
          { releaseDate: new Date("2004-02-06") },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { releaseDate: new Date("2004-09-13") },
      { releaseDate: new Date("2004-02-06") },
      { releaseDate: new Date("2003-01-28") },
      { releaseDate: new Date("2003-01-10") },
      { releaseDate: new Date("2001-11-15") },
      { releaseDate: new Date("2001-02-05") },
    ])
  })

  test("sorts by release year ascending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          releaseYear: SORT_ASCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { releaseYear: 2003 },
          { releaseYear: 2001 },
          { releaseYear: 2004 },
          { releaseYear: 2003 },
          { releaseYear: 2001 },
          { releaseYear: 2004 },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { releaseYear: 2001 },
      { releaseYear: 2001 },
      { releaseYear: 2003 },
      { releaseYear: 2003 },
      { releaseYear: 2004 },
      { releaseYear: 2004 },
    ])
  })

  test("sorts by release year descending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          releaseYear: SORT_DESCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { releaseYear: 2003 },
          { releaseYear: 2001 },
          { releaseYear: 2004 },
          { releaseYear: 2003 },
          { releaseYear: 2001 },
          { releaseYear: 2004 },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { releaseYear: 2004 },
      { releaseYear: 2004 },
      { releaseYear: 2003 },
      { releaseYear: 2003 },
      { releaseYear: 2001 },
      { releaseYear: 2001 },
    ])
  })

  test("sorts by track number ascending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          trackNumber: SORT_ASCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { artist: "aaa", trackNumber: 2 },
          { artist: "aaa", trackNumber: 1 },
          { artist: "ccc", trackNumber: 3 },
          { artist: "ccc", trackNumber: 4 },
          { artist: "bbb", trackNumber: 1 },
          { artist: "bbb", trackNumber: 7 },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { artist: "aaa", trackNumber: 1 },
      { artist: "bbb", trackNumber: 1 },
      { artist: "aaa", trackNumber: 2 },
      { artist: "ccc", trackNumber: 3 },
      { artist: "ccc", trackNumber: 4 },
      { artist: "bbb", trackNumber: 7 },
    ])
  })

  test("sorts by track number descending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          trackNumber: SORT_DESCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { artist: "aaa", trackNumber: 2 },
          { artist: "aaa", trackNumber: 1 },
          { artist: "ccc", trackNumber: 3 },
          { artist: "ccc", trackNumber: 4 },
          { artist: "bbb", trackNumber: 1 },
          { artist: "bbb", trackNumber: 7 },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { artist: "bbb", trackNumber: 7 },
      { artist: "ccc", trackNumber: 4 },
      { artist: "ccc", trackNumber: 3 },
      { artist: "aaa", trackNumber: 2 },
      { artist: "aaa", trackNumber: 1 },
      { artist: "bbb", trackNumber: 1 },
    ])
  })

  test("sorts by popularity ascending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          popularity: SORT_ASCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { popularity: 21 },
          { popularity: 17 },
          { popularity: 55 },
          { popularity: 41 },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { popularity: 17 },
      { popularity: 21 },
      { popularity: 41 },
      { popularity: 55 },
    ])
  })

  test("sorts by popularity descending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          popularity: SORT_DESCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { popularity: 21 },
          { popularity: 17 },
          { popularity: 55 },
          { popularity: 41 },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { popularity: 55 },
      { popularity: 41 },
      { popularity: 21 },
      { popularity: 17 },
    ])
  })

  test("sorts by duration ascending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          duration: SORT_ASCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { duration: 200100 },
          { duration: 115000 },
          { duration: 215123 },
          { duration: 200301 },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { duration: 115000 },
      { duration: 200100 },
      { duration: 200301 },
      { duration: 215123 },
    ])
  })

  test("sorts by duration descending", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          duration: SORT_DESCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { duration: 200100 },
          { duration: 115000 },
          { duration: 215123 },
          { duration: 200301 },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { duration: 215123 },
      { duration: 200301 },
      { duration: 200100 },
      { duration: 115000 },
    ])
  })

  test("sorts by multiple fields", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          artist: SORT_ASCENDING,
          releaseDate: SORT_ASCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { artist: "aaa", releaseDate: new Date("2003-01-01") },
          { artist: "aaa", releaseDate: new Date("2001-01-01") },
          { artist: "ccc", releaseDate: new Date("2004-01-01") },
          { artist: "ccc", releaseDate: new Date("2003-01-01") },
          { artist: "bbb", releaseDate: new Date("2001-01-01") },
          { artist: "bbb", releaseDate: new Date("2004-01-01") },
        ],
      },
    })

    expect(sortedTracks).toEqual([
      { artist: "aaa", releaseDate: new Date("2001-01-01") },
      { artist: "aaa", releaseDate: new Date("2003-01-01") },
      { artist: "bbb", releaseDate: new Date("2001-01-01") },
      { artist: "bbb", releaseDate: new Date("2004-01-01") },
      { artist: "ccc", releaseDate: new Date("2003-01-01") },
      { artist: "ccc", releaseDate: new Date("2004-01-01") },
    ])
  })

  test("groups and sorts", async () => {
    const trackCollectionName = "foo"

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        group_by: "album",
        sort: {
          trackNumber: SORT_ASCENDING,
        },
        sort_group: {
          album: SORT_DESCENDING,
        },
      },
      trackCollections: {
        [trackCollectionName]: [
          { album: "bbb", trackNumber: 2 },
          { album: "aaa", trackNumber: 1 },
          { album: "aaa", trackNumber: 3 },
          { album: "bbb", trackNumber: 1 },
          { album: "bbb", trackNumber: 3 },
          { album: "aaa", trackNumber: 2 },
        ],
      },
    })

    expect(sortedTracks).toEqual([
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
      execute({
        config: {
          tracks: trackCollectionName,
        },
        trackCollections: {},
      })
    ).rejects.toThrow(`"${trackCollectionName}" is not a valid track source`)
  })
})
