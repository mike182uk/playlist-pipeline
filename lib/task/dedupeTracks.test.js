import Joi from "joi"
import { describe, expect, test } from "vitest"
import { findErrorByContextLabel } from "../test/validationUtils.js"
import { execute, getConfigSchema, id } from "./dedupeTracks.js"

test("has correct id", () => {
  expect(id).toBe("tracks.dedupe")
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

    expect(err.type).toEqual("string.base")
  })
})

describe("execute", () => {
  test("returns an array of deduped tracks", async () => {
    const trackCollectionName = "foo"

    const dedupedTracks = await execute({
      config: {
        tracks: trackCollectionName,
      },
      trackCollections: {
        [trackCollectionName]: [
          { uri: "foo" },
          { uri: "foo" },
          { uri: "bar" },
          { uri: "bar" },
          { uri: "baz" },
        ],
      },
    })

    expect(dedupedTracks).toEqual([
      { uri: "foo" },
      { uri: "bar" },
      { uri: "baz" },
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
