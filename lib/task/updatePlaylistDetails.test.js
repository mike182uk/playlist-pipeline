import { jest } from "@jest/globals"
import Joi from "joi"
import { findErrorByContextLabel } from "../test/validationUtils.js"
import { execute, getConfigSchema, id } from "./updatePlaylistDetails.js"

test("has correct id", () => {
  expect(id).toBe("playlist.update_details")
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

  test(".description must be a string in the config schema", () => {
    const result = schema.validate(
      {
        spotify_url: "https://open.spotify.com/playlist/abc123",
        description: [],
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "description")

    expect(err).toBeDefined()
    expect(err.type).toEqual("string.base")
  })

  test(".name must be a string in the config schema", () => {
    const result = schema.validate(
      {
        spotify_url: "https://open.spotify.com/playlist/abc123",
        name: [],
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "name")

    expect(err).toBeDefined()
    expect(err.type).toEqual("string.base")
  })
})

describe("execute", () => {
  test("updates the description of a playlist", async () => {
    const playlistId = "abc123"
    const description = "foo bar baz"
    const spotifyChangePlaylistDetailsStub = jest.fn().mockResolvedValue()

    await execute({
      config: {
        spotify_url: "https://open.spotify.com/playlist/abc123",
        description,
      },
      spotify: {
        changePlaylistDetails: spotifyChangePlaylistDetailsStub,
      },
    })

    expect(spotifyChangePlaylistDetailsStub).toHaveBeenCalledTimes(1)
    expect(spotifyChangePlaylistDetailsStub).toHaveBeenCalledWith(playlistId, {
      description,
    })
  })

  test("updates the description of a playlist to include a formatted date", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2021-01-12").getTime())

    const playlistId = "abc123"
    const description = 'Last updated: {{ date "dd-MM-yyyy" }}'
    const spotifyChangePlaylistDetailsStub = jest.fn().mockResolvedValue()

    await execute({
      config: {
        spotify_url: "https://open.spotify.com/playlist/abc123",
        description,
      },
      spotify: {
        changePlaylistDetails: spotifyChangePlaylistDetailsStub,
      },
    })

    expect(spotifyChangePlaylistDetailsStub).toHaveBeenCalledTimes(1)
    expect(spotifyChangePlaylistDetailsStub).toHaveBeenCalledWith(playlistId, {
      description: "Last updated: 12-01-2021",
    })
  })

  test("updates the name of a playlist", async () => {
    const playlistId = "abc123"
    const name = "foo bar baz"
    const spotifyChangePlaylistDetailsStub = jest.fn().mockResolvedValue()

    await execute({
      config: {
        spotify_url: "https://open.spotify.com/playlist/abc123",
        name,
      },
      spotify: {
        changePlaylistDetails: spotifyChangePlaylistDetailsStub,
      },
    })

    expect(spotifyChangePlaylistDetailsStub).toHaveBeenCalledTimes(1)
    expect(spotifyChangePlaylistDetailsStub).toHaveBeenCalledWith(playlistId, {
      name,
    })
  })

  test("throws an error if the playlist details can not be updated", async () => {
    const description = "foo bar baz"
    const err = new Error("failed to update playlist details")
    const spotifyChangePlaylistDetailsStub = jest.fn().mockRejectedValue(err)

    await expect(
      execute({
        config: {
          spotify_url: "https://open.spotify.com/playlist/abc123",
          description,
        },
        spotify: {
          changePlaylistDetails: spotifyChangePlaylistDetailsStub,
        },
      })
    ).rejects.toThrow(
      "an error occurred updating playlist details: failed to update playlist details"
    )
  })
})
