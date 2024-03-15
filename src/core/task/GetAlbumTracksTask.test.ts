import Joi from "joi"
import { describe, expect, test, vi } from "vitest"

import {
  UriType,
  createProviderService,
  createTrack,
  createUri,
} from "../test/fixtures"
import { findErrorByContextLabel } from "../test/validation"

import GetAlbumTracksTask from "./GetAlbumTracksTask"

const task = new GetAlbumTracksTask()

test("has correct id", () => {
  expect(task.id).toBe("album.get_tracks")
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
  test("retrieves the album tracks", async () => {
    const providerService = createProviderService()
    const url = createUri(UriType.Album)
    const albumTracks = [createTrack(), createTrack()]

    providerService.getAlbumTracks = vi.fn().mockResolvedValue(albumTracks)

    const result = await task.execute({
      config: {
        url,
      },
      providerService,
    })

    expect(providerService.getAlbumTracks).toHaveBeenCalledTimes(1)
    expect(providerService.getAlbumTracks).toHaveBeenCalledWith(url)
    expect(result).toEqual(albumTracks)
  })

  test("throws an error if the album tracks can not be retrieved", async () => {
    const providerService = createProviderService()
    const err = new Error("failed to retrieve album tracks")

    providerService.getAlbumTracks = vi.fn().mockRejectedValue(err)

    await expect(
      task.execute({
        config: {
          url: createUri(UriType.Playlist),
        },
        providerService,
      })
    ).rejects.toThrow(
      "an error occurred retrieving album tracks: failed to retrieve album tracks"
    )
  })
})
