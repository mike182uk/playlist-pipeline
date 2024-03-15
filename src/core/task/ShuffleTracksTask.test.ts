import Joi from "joi"
import { shuffle } from "lodash-es"
import { type Mock, describe, expect, test, vi } from "vitest"

import { createTrack } from "../test/fixtures"
import { findErrorByContextLabel } from "../test/validation"

import ShuffleTracksTask from "./ShuffleTracksTask"

const task = new ShuffleTracksTask()

vi.mock("lodash-es", () => ({
  shuffle: vi.fn() as Mock,
}))

test("has correct id", () => {
  expect(task.id).toBe("tracks.shuffle")
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
  test("shuffles the tracks in the collection", async () => {
    const trackCollectionName = "foo"
    const track1 = createTrack({ name: "track 1" })
    const track2 = createTrack({ name: "track 2" })
    const track3 = createTrack({ name: "track 3" })
    const track4 = createTrack({ name: "track 4" })
    const tracks = [track1, track2, track3, track4]
    const shuffledTracks = [track4, track2, track1, track3]
    ;(shuffle as Mock).mockReturnValue(shuffledTracks)

    const result = await task.execute({
      config: {
        tracks: trackCollectionName,
      },
      trackCollections: {
        [trackCollectionName]: tracks,
      },
    })

    expect(result.map((track) => track.name)).toEqual(
      shuffledTracks.map((track) => track.name)
    )
    expect(shuffle).toHaveBeenCalledTimes(1)
    expect(shuffle).toHaveBeenCalledWith(tracks)
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
