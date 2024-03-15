import Joi from "joi"
import { describe, expect, test } from "vitest"

import { createTrack } from "../test/fixtures"
import { findErrorByContextLabel } from "../test/validation"

import MergeTracksTask from "./MergeTracksTask"

const task = new MergeTracksTask()

test("has correct id", () => {
  expect(task.id).toBe("tracks.merge")
})

describe("getConfigSchema", () => {
  const schema = Joi.object(task.getConfigSchema())

  test(".tracks is required in the config schema", () => {
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "tracks")

    expect(err?.type).toEqual("any.required")
  })

  test(".tracks must be an array of strings in the config schema", () => {
    const result = schema.validate(
      {
        tracks: ["foo", 123],
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "tracks[1]")

    expect(err?.type).toEqual("string.base")
  })
})

describe("execute", () => {
  test("returns a merged track collection from the provided track sources", async () => {
    const trackCollections = {
      foo: [
        createTrack({ name: "foo track 1" }),
        createTrack({ name: "foo track 2" }),
      ],
      bar: [
        createTrack({ name: "bar track 1" }),
        createTrack({ name: "bar track 2" }),
      ],
    }

    const mergedTracks = await task.execute({
      config: {
        tracks: Object.keys(trackCollections),
      },
      trackCollections,
    })

    expect(mergedTracks.map((track) => track.name)).toEqual([
      trackCollections.foo[0].name,
      trackCollections.foo[1].name,
      trackCollections.bar[0].name,
      trackCollections.bar[1].name,
    ])
  })

  test("throws an error if an invalid track source is provided in the config", async () => {
    const trackCollectionName = "foo"

    await expect(
      task.execute({
        config: {
          tracks: [trackCollectionName],
        },
        trackCollections: {},
      })
    ).rejects.toThrow(`"${trackCollectionName}" is not a valid track source`)
  })
})
