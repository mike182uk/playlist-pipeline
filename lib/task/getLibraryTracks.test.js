import { verifyAllWhenMocksCalled, when } from "jest-when"
import { describe, expect, test, vi } from "vitest"
import * as spotifyUtils from "../spotify/utils.js"
import { execute, id } from "./getLibraryTracks.js"

vi.mock("../spotify/utils.js", async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    decorateTrackArtistsWithGenres: vi.fn(),
    getTracksRecursively: vi.fn(),
    normaliseTrack: vi.fn(),
  }
})

test("has correct id", () => {
  expect(id).toBe("library.get_tracks")
})

describe("execute", () => {
  test("retrieves the library tracks", async () => {
    const getTracksRecursivelyResult = [
      { id: "foo", artists: [{ name: "baz" }] },
      { id: "bar", artists: [{ name: "qux" }] },
    ]
    const decorateTracksWithArtistGenresResult = [
      { id: "foo", artists: [{ name: "artist 1", genres: ["punk"] }] },
      { id: "bar", artists: [{ name: "artist 1", genres: ["punk"] }] },
    ]
    const normalisedTracks = [
      { id: "foo", artist: "baz", genres: ["punk"] },
      { id: "bar", artist: "qux", genres: ["punk"] },
    ]
    const spotify = {
      getMySavedTracks: vi.fn(),
    }
    const ctx = {
      retrieveArtistGenreDetails: true,
    }
    const spotifyGetMySavedTracksBindSpy = vi.spyOn(
      spotify.getMySavedTracks,
      "bind"
    )

    when(spotifyUtils.getTracksRecursively)
      .calledWith(
        expect.any(Function),
        spotifyUtils.LIMIT_GET_LIBRARY_TRACKS,
        expect.any(Function),
        expect.any(Function)
      )
      .mockResolvedValue(getTracksRecursivelyResult)

    when(spotifyUtils.decorateTrackArtistsWithGenres)
      .calledWith(getTracksRecursivelyResult, spotify)
      .mockResolvedValue(decorateTracksWithArtistGenresResult)

    when(spotifyUtils.normaliseTrack)
      .calledWith(decorateTracksWithArtistGenresResult[0])
      .mockReturnValue(normalisedTracks[0])

    when(spotifyUtils.normaliseTrack)
      .calledWith(decorateTracksWithArtistGenresResult[1])
      .mockReturnValue(normalisedTracks[1])

    // Assert result is correct
    await expect(execute({ spotify, ctx })).resolves.toEqual(normalisedTracks)

    // Assert all mocks were called
    verifyAllWhenMocksCalled()

    // Assert spotify.getMySavedTracks.bind is called with the correct arg
    expect(spotifyGetMySavedTracksBindSpy).toHaveBeenCalledWith(spotify)

    // Assert the getTracksRecursively resolveTracks arg is valid
    const data = { items: [] }
    expect(spotifyUtils.getTracksRecursively.mock.calls[0][2](data)).toEqual(
      data.items
    )

    // Assert the getTracksRecursively resolvePaginationMeta arg is valid
    const paginationMeta = { next: "https://next.page" }
    expect(
      spotifyUtils.getTracksRecursively.mock.calls[0][3](paginationMeta)
    ).toEqual(paginationMeta)
  })

  test("does not retrieve artist genre details if not required", async () => {
    const getTracksRecursivelyResult = [
      { id: "foo", artists: [{ name: "baz" }] },
      { id: "bar", artists: [{ name: "qux" }] },
    ]
    const normalisedTracks = [
      { id: "foo", artist: "baz" },
      { id: "bar", artist: "qux" },
    ]
    const spotify = {
      getMySavedTracks: vi.fn(),
    }
    const ctx = {
      retrieveArtistGenreDetails: false,
    }
    const spotifyGetMySavedTracksBindSpy = vi.spyOn(
      spotify.getMySavedTracks,
      "bind"
    )

    when(spotifyUtils.getTracksRecursively)
      .calledWith(
        expect.any(Function),
        spotifyUtils.LIMIT_GET_LIBRARY_TRACKS,
        expect.any(Function),
        expect.any(Function)
      )
      .mockResolvedValue(getTracksRecursivelyResult)

    when(spotifyUtils.normaliseTrack)
      .calledWith(getTracksRecursivelyResult[0])
      .mockReturnValue(normalisedTracks[0])

    when(spotifyUtils.normaliseTrack)
      .calledWith(getTracksRecursivelyResult[1])
      .mockReturnValue(normalisedTracks[1])

    // Assert result is correct
    await expect(execute({ spotify, ctx })).resolves.toEqual(normalisedTracks)

    // Assert all mocks were called
    verifyAllWhenMocksCalled()

    // Assert decorateTrackArtistsWithGenres was not called
    expect(spotifyUtils.decorateTrackArtistsWithGenres).toHaveBeenCalledTimes(0)

    // Assert spotify.getMySavedTracks.bind is called with the correct arg
    expect(spotifyGetMySavedTracksBindSpy).toHaveBeenCalledWith(spotify)

    // Assert the getTracksRecursively resolveTracks arg is valid
    const data = { items: [] }
    expect(spotifyUtils.getTracksRecursively.mock.calls[0][2](data)).toEqual(
      data.items
    )

    // Assert the getTracksRecursively resolvePaginationMeta arg is valid
    const paginationMeta = { next: "https://next.page" }
    expect(
      spotifyUtils.getTracksRecursively.mock.calls[0][3](paginationMeta)
    ).toEqual(paginationMeta)
  })

  test("throws an error if the library tracks can not be retrieved", async () => {
    const err = new Error("foo bar baz")
    const spotify = {
      getMySavedTracks: vi.fn(),
    }
    const ctx = {
      retrieveArtistGenreDetails: true,
    }

    when(spotifyUtils.getTracksRecursively)
      .calledWith(
        expect.any(Function),
        spotifyUtils.LIMIT_GET_LIBRARY_TRACKS,
        expect.any(Function),
        expect.any(Function)
      )
      .mockRejectedValue(err)

    await expect(execute({ spotify, ctx })).rejects.toThrow(err.message)

    verifyAllWhenMocksCalled()
  })
})
