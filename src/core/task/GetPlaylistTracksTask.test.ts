import Joi from "joi"
import { describe, expect, test, vi } from "vitest"

import {
  UriType,
  createProviderService,
  createTrack,
  createUri,
} from "../test/fixtures"
import { findErrorByContextLabel } from "../test/validation"

import GetPlaylistTracksTask from "./GetPlaylistTracksTask"

const task = new GetPlaylistTracksTask()

test("has correct id", () => {
  expect(task.id).toBe("playlist.get_tracks")
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
})

describe("execute", () => {
  test("retrieves the playlist tracks", async () => {
    const providerService = createProviderService()
    const url = createUri(UriType.Playlist)
    const playlistTracks = [createTrack(), createTrack()]

    providerService.getPlaylistTracks = vi
      .fn()
      .mockResolvedValue(playlistTracks)

    const result = await task.execute({
      config: {
        url,
      },
      providerService,
    })

    expect(providerService.getPlaylistTracks).toHaveBeenCalledTimes(1)
    expect(providerService.getPlaylistTracks).toHaveBeenCalledWith(url)
    expect(result).toEqual(playlistTracks)
  })

  test("throws an error if the playlist tracks can not be retrieved", async () => {
    const providerService = createProviderService()
    const err = new Error("failed to retrieve playlist tracks")

    providerService.getPlaylistTracks = vi.fn().mockRejectedValue(err)

    await expect(
      task.execute({
        config: {
          url: createUri(UriType.Playlist),
        },
        providerService,
      })
    ).rejects.toThrow(
      "an error occurred retrieving playlist tracks: failed to retrieve playlist tracks"
    )
  })
})
