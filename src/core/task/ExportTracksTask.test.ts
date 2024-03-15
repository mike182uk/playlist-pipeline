import { writeFile } from "node:fs/promises"
import Joi from "joi"
import { type Mock, describe, expect, test, vi } from "vitest"

import { createTrack } from "../test/fixtures"
import { findErrorByContextLabel } from "../test/validation"

import ExportTracksTask, { FORMAT_JSON } from "./ExportTracksTask"

const task = new ExportTracksTask()

vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn(),
}))

test("has correct id", () => {
  expect(task.id).toBe("tracks.export")
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

  test(".format is required in the config schema", () => {
    const result = schema.validate(
      {
        tracks: "foo",
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "format")

    expect(err?.type).toEqual("any.required")
  })

  test(".format is a valid string in the config schema", () => {
    const result = schema.validate(
      {
        tracks: "foo",
        format: "csv",
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "format")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([FORMAT_JSON])
  })

  test(".fields is required in the config schema", () => {
    const result = schema.validate(
      {
        tracks: "foo",
        format: FORMAT_JSON,
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "fields")

    expect(err?.type).toEqual("any.required")
  })

  test(".fields contains a valid string in the config schema", () => {
    const result = schema.validate(
      {
        tracks: "foo",
        format: FORMAT_JSON,
        fields: ["foo"],
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "fields[0]")

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual([
      "id",
      "name",
      "trackNumber",
      "album",
      "albumId",
      "albumUri",
      "releaseDate",
      "releaseYear",
      "artist",
      "artistId",
      "artistUri",
      "uri",
      "genre",
      "popularity",
      "duration",
      "explicit",
    ])
  })

  test(".filename is required in the config schema", () => {
    const result = schema.validate(
      {
        tracks: "foo",
        format: FORMAT_JSON,
        fields: ["artist", "name"],
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "filename")

    expect(err?.type).toEqual("any.required")
  })

  test(".filename must be a string in the config schema", () => {
    const result = schema.validate(
      {
        tracks: "foo",
        format: FORMAT_JSON,
        fields: ["artist", "name"],
        filename: [],
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "filename")

    expect(err?.type).toEqual("string.base")
  })
})

describe("execute", () => {
  test("exports tracks to file", async () => {
    const trackCollections = {
      foo: [
        createTrack({
          id: "foo",
          artist: "artist 1",
          name: "artist 1 album 1 track 1",
        }),
        createTrack({
          id: "bar",
          artist: "artist 1",
          name: "artist 1 album 1 track 2",
        }),
      ],
    }
    const filename = "foo"
    const expectedFilename = `${filename}.json`
    const expectedFileContents = `[
  {
    "artist": "artist 1",
    "name": "artist 1 album 1 track 1"
  },
  {
    "artist": "artist 1",
    "name": "artist 1 album 1 track 2"
  }
]`

    await task.execute({
      config: {
        tracks: "foo",
        format: FORMAT_JSON,
        fields: ["artist", "name"],
        filename,
      },
      trackCollections,
    })

    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenLastCalledWith(
      expectedFilename,
      expectedFileContents
    )
  })

  test("throws an error if an invalid track source is provided in the config", async () => {
    const trackCollectionName = "foo"

    await expect(
      task.execute({
        config: {
          tracks: trackCollectionName,
          format: FORMAT_JSON,
          fields: ["artist", "name"],
          filename: "bar",
        },
        trackCollections: {},
      })
    ).rejects.toThrow(`"${trackCollectionName}" is not a valid track source`)
  })

  test("throws an error if an error occurred whilst exporting to file", async () => {
    const trackCollectionName = "foo"
    const err = new Error("foo bar baz")
    ;(writeFile as Mock).mockRejectedValue(err)

    await expect(
      task.execute({
        config: {
          tracks: trackCollectionName,
          format: FORMAT_JSON,
          fields: ["artist", "name"],
          filename: "bar",
        },
        trackCollections: {
          [trackCollectionName]: [],
        },
      })
    ).rejects.toThrow(err.message)
  })
})
