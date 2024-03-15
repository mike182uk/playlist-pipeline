import Joi from "joi"
import { describe, expect, test, vi } from "vitest"

import { UriType, createProviderService, createUri } from "../test/fixtures"
import { findErrorByContextLabel } from "../test/validation"

import UpdatePlaylistDetailsTask from "./UpdatePlaylistDetailsTask"

const task = new UpdatePlaylistDetailsTask()

test("has correct id", () => {
  expect(task.id).toBe("playlist.update_details")
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

  test(".description must be a string in the config schema", () => {
    const result = schema.validate(
      {
        url: createUri(UriType.Playlist),
        description: [],
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "description")

    expect(err?.type).toEqual("string.base")
  })

  test(".name must be a string in the config schema", () => {
    const result = schema.validate(
      {
        url: createUri(UriType.Playlist),
        name: [],
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "name")

    expect(err?.type).toEqual("string.base")
  })
})

describe("execute", () => {
  test("updates the description of a playlist", async () => {
    const url = createUri(UriType.Playlist)
    const description = "foo bar baz"
    const providerService = createProviderService()

    await task.execute({
      config: {
        url,
        description,
      },
      providerService,
    })

    expect(providerService.updatePlaylistDetails).toHaveBeenCalledTimes(1)
    expect(providerService.updatePlaylistDetails).toHaveBeenCalledWith(url, {
      description,
    })
  })

  test("updates the description of a playlist to include a formatted date", async () => {
    vi.useFakeTimers().setSystemTime(new Date("2021-01-12").getTime())

    const url = createUri(UriType.Playlist)
    const description = 'Last updated: {{ date "dd-MM-yyyy" }}'
    const providerService = createProviderService()

    await task.execute({
      config: {
        url,
        description,
      },
      providerService,
    })

    expect(providerService.updatePlaylistDetails).toHaveBeenCalledTimes(1)
    expect(providerService.updatePlaylistDetails).toHaveBeenCalledWith(url, {
      description: "Last updated: 12-01-2021",
    })
  })

  test("updates the name of a playlist", async () => {
    const url = createUri(UriType.Playlist)
    const name = "foo bar baz"
    const providerService = createProviderService()

    await task.execute({
      config: {
        url,
        name,
      },
      providerService,
    })

    expect(providerService.updatePlaylistDetails).toHaveBeenCalledTimes(1)
    expect(providerService.updatePlaylistDetails).toHaveBeenCalledWith(url, {
      name,
    })
  })

  test("throws an error if the playlist details can not be updated", async () => {
    const providerService = createProviderService()
    const err = new Error("failed to update playlist details")

    providerService.updatePlaylistDetails = vi.fn().mockRejectedValue(err)

    await expect(
      task.execute({
        config: {
          url: createUri(UriType.Playlist),
          description: "foo bar baz",
        },
        providerService,
      })
    ).rejects.toThrow(
      "an error occurred updating playlist details: failed to update playlist details"
    )
  })
})
