import Joi from "joi"
import { describe, expect, test } from "vitest"

import { createTrack } from "../test/fixtures"
import { findErrorByContextLabel } from "../test/validation"

import DedupeTracksTask from "./DedupeTracksTask"

const task = new DedupeTracksTask()

test("has correct id", () => {
  expect(task.id).toBe("tracks.dedupe")
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
})

describe("execute", () => {
  test("returns a deduped track collection", async () => {
    const track1 = createTrack({ name: "track 1" })
    const track2 = createTrack({ name: "track 2" })
    const track3 = createTrack({ name: "track 3" })
    const trackCollections = {
      foo: [track1, track1, track2, track2, track3],
    }

    const dedupedTracks = await task.execute({
      config: {
        tracks: "foo",
      },
      trackCollections,
    })

    expect(dedupedTracks.map((track) => track.name)).toEqual(
      [track1, track2, track3].map((track) => track.name)
    )
  })

  test("throws an error if an invalid track source is provided in the config", async () => {
    const trackCollectionName = "foo"

    await expect(
      task.execute({
        config: {
          tracks: trackCollectionName,
        },
        trackCollections: {},
      })
    ).rejects.toThrow(`"${trackCollectionName}" is not a valid track source`)
  })
})
