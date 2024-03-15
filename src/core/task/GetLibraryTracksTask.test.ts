import { describe, expect, test, vi } from "vitest"

import { createProviderService, createTrack } from "../test/fixtures"

import GetLibraryTracksTask from "./GetLibraryTracksTask"

const task = new GetLibraryTracksTask()

test("has correct id", () => {
  expect(task.id).toBe("library.get_tracks")
})

describe("getConfigSchema", () => {
  test("schema is empty", () => {
    expect(task.getConfigSchema()).toEqual({})
  })
})

describe("execute", () => {
  test("retrieves the library tracks", async () => {
    const providerService = createProviderService()
    const libraryTracks = [createTrack(), createTrack()]

    providerService.getLibraryTracks = vi.fn().mockResolvedValue(libraryTracks)

    const result = await task.execute({ config: {}, providerService })

    expect(providerService.getLibraryTracks).toHaveBeenCalledTimes(1)
    expect(result).toEqual(libraryTracks)
  })

  test("throws an error if the library tracks can not be retrieved", async () => {
    const providerService = createProviderService()
    const err = new Error("failed to retrieve library tracks")

    providerService.getLibraryTracks = vi.fn().mockRejectedValue(err)

    await expect(
      task.execute({
        config: {},
        providerService,
      })
    ).rejects.toThrow(
      "an error occurred retrieving library tracks: failed to retrieve library tracks"
    )
  })
})
