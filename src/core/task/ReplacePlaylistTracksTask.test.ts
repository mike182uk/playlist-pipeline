import Joi from "joi"
import { describe, expect, test, vi } from "vitest"

import {
  UriType,
  createProviderService,
  createTrack,
  createUri,
} from "../test/fixtures"
import { findErrorByContextLabel } from "../test/validation"

import ReplacePlaylistTracksTask from "./ReplacePlaylistTracksTask"

const task = new ReplacePlaylistTracksTask()

test("has correct id", () => {
  expect(task.id).toBe("playlist.replace_tracks")
})

describe("getConfigSchema", () => {
  const schema = Joi.object(task.getConfigSchema())

  test(".url is required in config schema", () => {
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "url")

    expect(err?.type).toEqual("any.required")
  })

  test(".url must be a string in config schema", () => {
    const result = schema.validate(
      {
        url: {},
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "url")

    expect(err?.type).toEqual("string.base")
  })

  test(".tracks is required in config schema", () => {
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "tracks")

    expect(err?.type).toEqual("any.required")
  })

  test(".tracks must be a string in config schema", () => {
    const result = schema.validate(
      {
        tracks: {},
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "tracks")

    expect(err?.type).toEqual("string.base")
  })
})

describe("execute", () => {
  it("replaces the tracks in a playlist", async () => {
    const url = createUri(UriType.Playlist)
    const trackCollections = {
      foo: [createTrack(), createTrack()],
    }
    const providerService = createProviderService()

    await task.execute({
      config: {
        url,
        tracks: Object.keys(trackCollections)[0],
      },
      trackCollections,
      providerService,
    })

    expect(providerService.replaceTracksInPlaylist).toHaveBeenCalledTimes(1)
    expect(providerService.replaceTracksInPlaylist).toHaveBeenCalledWith(
      url,
      trackCollections.foo
    )
  })

  test("throws an error if an invalid track source is provided in the config", async () => {
    const trackCollectionName = "foo"

    await expect(
      task.execute({
        config: {
          url: createUri(UriType.Playlist),
          tracks: trackCollectionName,
        },
        providerService: createProviderService(),
        trackCollections: {},
      })
    ).rejects.toThrow(`"${trackCollectionName}" is not a valid track source`)
  })

  it("throws an error if the tracks can not be replaced in the playlist", async () => {
    const trackCollections = {
      foo: [createTrack(), createTrack()],
    }
    const providerService = createProviderService()
    const err = new Error("failed to replace tracks in playlist")

    providerService.replaceTracksInPlaylist = vi.fn().mockRejectedValue(err)

    await expect(
      task.execute({
        config: {
          url: createUri(UriType.Playlist),
          tracks: Object.keys(trackCollections)[0],
        },
        trackCollections,
        providerService,
      })
    ).rejects.toThrow(
      "an error occurred replacing playlist tracks: failed to replace tracks in playlist"
    )
  })
})
