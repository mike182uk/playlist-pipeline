import Joi from "joi"
import { shuffle } from "lodash-es"
import { findErrorByContextLabel } from "../test/validationUtils.js"
import { execute, getConfigSchema, id } from "./shuffleTracks.js"

// jest.mock('lodash')

test("has correct id", () => {
  expect(id).toBe("tracks.shuffle")
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
})

xdescribe("execute", () => {
  test("shuffles the tracks in the collection", async () => {
    const trackCollectionName = "foo"
    const tracks = [
      { name: "aaa" },
      { name: "bbb" },
      { name: "ccc" },
      { name: "ddd" },
    ]
    const shuffledTracks = [
      { name: "ddd" },
      { name: "bbb" },
      { name: "aaa" },
      { name: "ccc" },
    ]

    shuffle.mockReturnValue(shuffledTracks)

    const result = await execute({
      config: {
        tracks: trackCollectionName,
      },
      trackCollections: {
        [trackCollectionName]: tracks,
      },
    })

    expect(result).toEqual(shuffledTracks)
    expect(shuffle).toHaveBeenCalledTimes(1)
    expect(shuffle).toHaveBeenCalledWith(tracks)
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
