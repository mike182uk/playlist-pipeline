import { verifyAllWhenMocksCalled, when } from "jest-when"
import Joi from "joi"
import { describe, expect, test, vi } from "vitest"
import * as spotifyUtils from "../spotify/utils.js"
import { findErrorByContextLabel } from "../test/validationUtils.js"
import { execute, getConfigSchema, id } from "./getAlbumTracks.js"

vi.mock("../spotify/utils.js", async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    decorateTrackArtistsWithGenres: vi.fn(),
    extractIDFromURL: vi.fn(),
    getTracksRecursively: vi.fn(),
    normaliseTrack: vi.fn(),
  }
})

test("has correct id", () => {
  expect(id).toBe("album.get_tracks")
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

describe("execute", () => {
  test("retrieves the album tracks", async () => {
    const config = {
      spotify_url: "https://open.spotify.com/album/abc123",
    }
    const ctx = {
      retrieveAlbumDetails: true,
      retrieveArtistGenreDetails: true,
    }
    const albumId = "abc123"
    const spotifyGetAlbumResult = {
      body: {
        name: "artist 1 album 1",
        release_date: "2005-01-01",
      },
    }
    const getTracksRecursivelyResult = [
      { id: "foo", artists: [{ name: "artist 1" }] },
      { id: "bar", artists: [{ name: "artist 1" }] },
    ]
    const decorateTracksWithArtistGenresResult = [
      { id: "foo", artists: [{ name: "artist 1", genres: ["punk"] }] },
      { id: "bar", artists: [{ name: "artist 1", genres: ["punk"] }] },
    ]
    const decoratedTracksWithArtistGenresAndAlbum = [
      {
        id: "foo",
        artists: [{ name: "artist 1", genres: ["punk"] }],
        album: spotifyGetAlbumResult.body,
      },
      {
        id: "bar",
        artists: [{ name: "artist 1", genres: ["punk"] }],
        album: spotifyGetAlbumResult.body,
      },
    ]
    const normalisedTracks = [
      {
        id: "foo",
        artist: "artist 1",
        genres: ["punk"],
        album: "artist 1 album 1",
      },
      {
        id: "bar",
        artist: "artist 1",
        genres: ["punk"],
        album: "artist 1 album 1",
      },
    ]
    const spotify = {
      getAlbum: vi.fn(),
      getAlbumTracks: vi.fn(),
    }
    const spotifyGetMySavedTracksBindSpy = vi.spyOn(
      spotify.getAlbumTracks,
      "bind"
    )

    when(spotifyUtils.extractIDFromURL)
      .calledWith(config.spotify_url)
      .mockReturnValue(albumId)

    when(spotify.getAlbum)
      .calledWith(albumId)
      .mockReturnValue(spotifyGetAlbumResult)

    when(spotifyUtils.getTracksRecursively)
      .calledWith(
        expect.any(Function),
        spotifyUtils.LIMIT_GET_ALBUM_TRACKS,
        expect.any(Function),
        expect.any(Function)
      )
      .mockResolvedValue(getTracksRecursivelyResult)

    when(spotifyUtils.decorateTrackArtistsWithGenres)
      .calledWith(getTracksRecursivelyResult, spotify)
      .mockResolvedValue(decorateTracksWithArtistGenresResult)

    when(spotifyUtils.normaliseTrack)
      .calledWith(decoratedTracksWithArtistGenresAndAlbum[0])
      .mockReturnValue(normalisedTracks[0])

    when(spotifyUtils.normaliseTrack)
      .calledWith(decoratedTracksWithArtistGenresAndAlbum[1])
      .mockReturnValue(normalisedTracks[1])

    // Assert result is correct
    await expect(execute({ config, ctx, spotify })).resolves.toEqual(
      normalisedTracks
    )

    // Assert all mocks were called
    verifyAllWhenMocksCalled()

    // Assert spotify.getAlbumTracks.bind is called with the correct arg
    expect(spotifyGetMySavedTracksBindSpy).toHaveBeenCalledWith(
      spotify,
      albumId
    )

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

  test("does not retrieve album details if not required", async () => {
    const config = {
      spotify_url: "https://open.spotify.com/album/abc123",
    }
    const ctx = {
      retrieveAlbumDetails: false,
      retrieveArtistGenreDetails: true,
    }
    const albumId = "abc123"
    const getTracksRecursivelyResult = [
      { id: "foo", artists: [{ name: "artist 1" }] },
      { id: "bar", artists: [{ name: "artist 1" }] },
    ]
    const decorateTracksWithArtistGenresResult = [
      { id: "foo", artists: [{ name: "artist 1", genres: ["punk"] }] },
      { id: "bar", artists: [{ name: "artist 1", genres: ["punk"] }] },
    ]
    const normalisedTracks = [
      { id: "foo", artist: "artist 1", genres: ["punk"] },
      { id: "bar", artist: "artist 1", genres: ["punk"] },
    ]
    const spotify = {
      getAlbum: vi.fn(),
      getAlbumTracks: vi.fn(),
    }
    const spotifyGetMySavedTracksBindSpy = vi.spyOn(
      spotify.getAlbumTracks,
      "bind"
    )

    when(spotifyUtils.extractIDFromURL)
      .calledWith(config.spotify_url)
      .mockReturnValue(albumId)

    when(spotifyUtils.getTracksRecursively)
      .calledWith(
        expect.any(Function),
        spotifyUtils.LIMIT_GET_ALBUM_TRACKS,
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
    await expect(execute({ config, ctx, spotify })).resolves.toEqual(
      normalisedTracks
    )

    // Assert all mocks were called
    verifyAllWhenMocksCalled()

    // Assert spotify.getAlbum was not called
    expect(spotify.getAlbum).toHaveBeenCalledTimes(0)

    // Assert spotify.getAlbumTracks.bind is called with the correct arg
    expect(spotifyGetMySavedTracksBindSpy).toHaveBeenCalledWith(
      spotify,
      albumId
    )

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
    const config = {
      spotify_url: "https://open.spotify.com/album/abc123",
    }
    const ctx = {
      retrieveAlbumDetails: true,
      retrieveArtistGenreDetails: false,
    }
    const albumId = "abc123"
    const spotifyGetAlbumResult = {
      body: {
        name: "artist 1 album 1",
        release_date: "2005-01-01",
      },
    }
    const getTracksRecursivelyResult = [
      { id: "foo", artists: [{ name: "artist 1" }] },
      { id: "bar", artists: [{ name: "artist 1" }] },
    ]
    const decoratedTracksWithAlbum = [
      {
        id: "foo",
        artists: [{ name: "artist 1" }],
        album: spotifyGetAlbumResult.body,
      },
      {
        id: "bar",
        artists: [{ name: "artist 1" }],
        album: spotifyGetAlbumResult.body,
      },
    ]
    const normalisedTracks = [
      { id: "foo", artist: "artist 1", album: "artist 1 album 1" },
      { id: "bar", artist: "artist 1", album: "artist 1 album 1" },
    ]
    const spotify = {
      getAlbum: vi.fn(),
      getAlbumTracks: vi.fn(),
    }
    const spotifyGetMySavedTracksBindSpy = vi.spyOn(
      spotify.getAlbumTracks,
      "bind"
    )

    when(spotifyUtils.extractIDFromURL)
      .calledWith(config.spotify_url)
      .mockReturnValue(albumId)

    when(spotify.getAlbum)
      .calledWith(albumId)
      .mockReturnValue(spotifyGetAlbumResult)

    when(spotifyUtils.getTracksRecursively)
      .calledWith(
        expect.any(Function),
        spotifyUtils.LIMIT_GET_ALBUM_TRACKS,
        expect.any(Function),
        expect.any(Function)
      )
      .mockResolvedValue(getTracksRecursivelyResult)

    when(spotifyUtils.normaliseTrack)
      .calledWith(decoratedTracksWithAlbum[0])
      .mockReturnValue(normalisedTracks[0])

    when(spotifyUtils.normaliseTrack)
      .calledWith(decoratedTracksWithAlbum[1])
      .mockReturnValue(normalisedTracks[1])

    // Assert result is correct
    await expect(execute({ config, ctx, spotify })).resolves.toEqual(
      normalisedTracks
    )

    // Assert all mocks were called
    verifyAllWhenMocksCalled()

    // Assert decorateTrackArtistsWithGenres was not called
    expect(spotifyUtils.decorateTrackArtistsWithGenres).toHaveBeenCalledTimes(0)

    // Assert spotify.getAlbumTracks.bind is called with the correct arg
    expect(spotifyGetMySavedTracksBindSpy).toHaveBeenCalledWith(
      spotify,
      albumId
    )

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

  test("throws an error if the album details can not be retrieved", async () => {
    const config = {
      spotify_url: "https://open.spotify.com/album/abc123",
    }
    const ctx = {
      retrieveAlbumDetails: true,
      retrieveArtistGenreDetails: true,
    }
    const albumId = "abc123"
    const err = new Error("foo bar baz")
    const spotify = {
      getAlbum: vi.fn(),
    }

    when(spotifyUtils.extractIDFromURL)
      .calledWith(config.spotify_url)
      .mockReturnValue(albumId)

    when(spotify.getAlbum).calledWith(albumId).mockRejectedValue(err)

    await expect(execute({ config, ctx, spotify })).rejects.toThrow(
      `an error occurred retrieving album tracks: ${err.message}`
    )

    verifyAllWhenMocksCalled()
  })

  test("throws an error if the album tracks can not be retrieved", async () => {
    const config = {
      spotify_url: "https://open.spotify.com/album/abc123",
    }
    const ctx = {
      retrieveAlbumDetails: true,
      retrieveArtistGenreDetails: true,
    }
    const albumId = "abc123"
    const err = new Error("foo bar baz")
    const spotify = {
      getAlbum: vi.fn(),
      getAlbumTracks: vi.fn(),
    }

    when(spotifyUtils.extractIDFromURL)
      .calledWith(config.spotify_url)
      .mockReturnValue(albumId)

    when(spotify.getAlbum).calledWith(albumId).mockResolvedValue({ body: {} })

    when(spotifyUtils.getTracksRecursively)
      .calledWith(
        expect.any(Function),
        spotifyUtils.LIMIT_GET_ALBUM_TRACKS,
        expect.any(Function),
        expect.any(Function)
      )
      .mockRejectedValue(err)

    await expect(execute({ config, ctx, spotify })).rejects.toThrow(err.message)

    verifyAllWhenMocksCalled()
  })
})
