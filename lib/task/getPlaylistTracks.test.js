// jest.mock('../spotify/utils')
import { jest } from "@jest/globals"
import { verifyAllWhenMocksCalled, when } from "jest-when"
import Joi from "joi"
import {
  LIMIT_GET_PLAYLISTS_TRACKS,
  decorateTrackArtistsWithGenres,
  extractIDFromURL,
  getTracksRecursively,
  normaliseTrack,
} from "../spotify/utils.js"
import { findErrorByContextLabel } from "../test/validationUtils.js"
import { execute, getConfigSchema, id } from "./getPlaylistTracks.js"

test("has correct id", () => {
  expect(id).toBe("playlist.get_tracks")
})

describe("getConfigSchema", () => {
  const schema = Joi.object(getConfigSchema())

  test(".spotify_url is required in config schema", () => {
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "spotify_url")

    expect(err).toBeDefined()
    expect(err.type).toEqual("any.required")
  })

  test(".spotify_url must be a string in config schema", () => {
    const result = schema.validate(
      {
        spotify_url: {},
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "spotify_url")

    expect(err).toBeDefined()
    expect(err.type).toEqual("string.base")
  })
})

xdescribe("execute", () => {
  test("retrieves the playlist tracks", async () => {
    const config = {
      spotify_url: "https://open.spotify.com/playlist/abc123",
    }
    const ctx = {
      retrieveArtistGenreDetails: true,
    }
    const playlistId = "abc123"
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
      getPlaylistTracks: jest.fn(),
    }
    const spotifyGetPlaylistBindSpy = jest.spyOn(
      spotify.getPlaylistTracks,
      "bind"
    )

    when(extractIDFromURL)
      .calledWith(config.spotify_url)
      .mockReturnValue(playlistId)

    when(getTracksRecursively)
      .calledWith(
        expect.any(Function),
        LIMIT_GET_PLAYLISTS_TRACKS,
        expect.any(Function),
        expect.any(Function)
      )
      .mockResolvedValue(getTracksRecursivelyResult)

    when(decorateTrackArtistsWithGenres)
      .calledWith(getTracksRecursivelyResult, spotify)
      .mockResolvedValue(decorateTracksWithArtistGenresResult)

    when(normaliseTrack)
      .calledWith(decorateTracksWithArtistGenresResult[0])
      .mockReturnValue(normalisedTracks[0])

    when(normaliseTrack)
      .calledWith(decorateTracksWithArtistGenresResult[1])
      .mockReturnValue(normalisedTracks[1])

    // Assert result is correct
    await expect(execute({ config, ctx, spotify })).resolves.toEqual(
      normalisedTracks
    )

    // Assert all mocks were called
    verifyAllWhenMocksCalled()

    // Assert spotify.getPlaylist.bind is called with the correct args
    expect(spotifyGetPlaylistBindSpy).toHaveBeenCalledWith(spotify, playlistId)

    // Assert the getTracksRecursively resolveTracks arg is valid
    const data = { items: [] }
    expect(getTracksRecursively.mock.calls[0][2](data)).toEqual(data.items)

    // Assert the getTracksRecursively resolvePaginationMeta arg is valid
    const paginationMeta = { next: "https://next.page" }
    expect(getTracksRecursively.mock.calls[0][3](paginationMeta)).toEqual(
      paginationMeta
    )
  })

  test("does not retrieve artist genre details if not required", async () => {
    const config = {
      spotify_url: "https://open.spotify.com/playlist/abc123",
    }
    const ctx = {
      retrieveArtistGenreDetails: false,
    }
    const playlistId = "abc123"
    const getTracksRecursivelyResult = [
      { id: "foo", artists: [{ name: "baz" }] },
      { id: "bar", artists: [{ name: "qux" }] },
    ]
    const normalisedTracks = [
      { id: "foo", artist: "baz" },
      { id: "bar", artist: "qux" },
    ]
    const spotify = {
      getPlaylistTracks: jest.fn(),
    }
    const spotifyGetPlaylistBindSpy = jest.spyOn(
      spotify.getPlaylistTracks,
      "bind"
    )

    when(extractIDFromURL)
      .calledWith(config.spotify_url)
      .mockReturnValue(playlistId)

    when(getTracksRecursively)
      .calledWith(
        expect.any(Function),
        LIMIT_GET_PLAYLISTS_TRACKS,
        expect.any(Function),
        expect.any(Function)
      )
      .mockResolvedValue(getTracksRecursivelyResult)

    when(normaliseTrack)
      .calledWith(getTracksRecursivelyResult[0])
      .mockReturnValue(normalisedTracks[0])

    when(normaliseTrack)
      .calledWith(getTracksRecursivelyResult[1])
      .mockReturnValue(normalisedTracks[1])

    // Assert result is correct
    await expect(execute({ config, ctx, spotify })).resolves.toEqual(
      normalisedTracks
    )

    // Assert all mocks were called
    verifyAllWhenMocksCalled()

    // Assert decorateTrackArtistsWithGenres was not called
    expect(decorateTrackArtistsWithGenres).toHaveBeenCalledTimes(0)

    // Assert spotify.getPlaylist.bind is called with the correct args
    expect(spotifyGetPlaylistBindSpy).toHaveBeenCalledWith(spotify, playlistId)

    // Assert the getTracksRecursively resolveTracks arg is valid
    const data = { items: [] }
    expect(getTracksRecursively.mock.calls[0][2](data)).toEqual(data.items)

    // Assert the getTracksRecursively resolvePaginationMeta arg is valid
    const paginationMeta = { next: "https://next.page" }
    expect(getTracksRecursively.mock.calls[0][3](paginationMeta)).toEqual(
      paginationMeta
    )
  })

  test("throws an error if the playlist tracks can not be retrieved", async () => {
    const config = {
      spotify_url: "https://open.spotify.com/playlist/abc123",
    }
    const ctx = {
      retrieveArtistGenreDetails: true,
    }
    const spotify = {
      getPlaylistTracks: jest.fn(),
    }
    const playlistId = "abc123"
    const err = new Error("foo bar baz")

    when(extractIDFromURL)
      .calledWith(config.spotify_url)
      .mockReturnValue(playlistId)

    when(getTracksRecursively)
      .calledWith(
        expect.any(Function),
        LIMIT_GET_PLAYLISTS_TRACKS,
        expect.any(Function),
        expect.any(Function)
      )
      .mockRejectedValue(err)

    await expect(execute({ config, ctx, spotify })).rejects.toThrow(err.message)

    verifyAllWhenMocksCalled()
  })
})
