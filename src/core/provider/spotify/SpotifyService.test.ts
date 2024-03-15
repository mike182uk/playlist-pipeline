import SpotifyWebApi from "spotify-web-api-node"
import { type Mock, beforeEach, describe, expect, test, vi } from "vitest"

import type { ProviderService } from "../../provider"
import { UriType, createTrack, createUri } from "../../test/fixtures"
import SpotifyService, { LIMIT_ADD_TRACKS_TO_PLAYLIST } from "./SpotifyService"

describe("SpotifyService", () => {
  let service: ProviderService
  let client: SpotifyWebApi

  beforeEach(() => {
    client = new SpotifyWebApi()
    service = new SpotifyService(client)
  })

  describe("getAlbumTracks", () => {
    // TODO
  })

  describe("getLibraryTracks", () => {
    // TODO
  })

  describe("getPlaylistTracks", () => {
    // TODO
  })

  describe("replaceTracksInPlaylist", () => {
    test("replaces tracks in playlist", async () => {
      const id = "foo123"
      const url = createUri(UriType.Playlist, id)
      const tracks = [createTrack(), createTrack()]

      client.replaceTracksInPlaylist = vi.fn().mockResolvedValue({
        statusCode: 201,
      })
      client.addTracksToPlaylist = vi.fn().mockResolvedValue({
        statusCode: 201,
      })

      await service.replaceTracksInPlaylist(url, tracks)

      expect(client.replaceTracksInPlaylist).toHaveBeenCalledTimes(1)
      expect(client.replaceTracksInPlaylist).toHaveBeenCalledWith(id, [])
      expect(client.addTracksToPlaylist).toHaveBeenCalledTimes(1)
      expect(client.addTracksToPlaylist).toHaveBeenCalledWith(
        id,
        tracks.map(({ uri }) => uri)
      )
    })

    test("throws an error if playlist can not be cleared", async () => {
      client.replaceTracksInPlaylist = vi.fn().mockResolvedValue({
        statusCode: 500,
      })

      await expect(
        service.replaceTracksInPlaylist(createUri(UriType.Playlist), [
          createTrack(),
          createTrack(),
        ])
      ).rejects.toThrow(
        "unexpected status code returned (500) whilst clearing tracks in playlist"
      )
    })

    test("throws an error if the tracks can not be added to playlist", async () => {
      client.replaceTracksInPlaylist = vi.fn().mockResolvedValue({
        statusCode: 201,
      })
      client.addTracksToPlaylist = vi.fn().mockResolvedValue({
        statusCode: 500,
      })

      await expect(
        service.replaceTracksInPlaylist(createUri(UriType.Playlist), [
          createTrack(),
          createTrack(),
        ])
      ).rejects.toThrow(
        "unexpected status code returned (500) whilst replacing tracks in playlist"
      )
    })

    test("replaces lots of tracks in playlist", async () => {
      const id = "foo123"
      const url = createUri(UriType.Playlist, id)
      const numTracksOverLimit = 20
      const tracks = new Array(
        LIMIT_ADD_TRACKS_TO_PLAYLIST + numTracksOverLimit
      ).fill(createTrack())

      client.replaceTracksInPlaylist = vi.fn().mockResolvedValue({
        statusCode: 201,
      })
      client.addTracksToPlaylist = vi.fn().mockResolvedValue({
        statusCode: 201,
      })

      await service.replaceTracksInPlaylist(url, tracks)

      expect(client.replaceTracksInPlaylist).toHaveBeenCalledTimes(1)
      expect(client.replaceTracksInPlaylist).toHaveBeenCalledWith(id, [])
      expect(client.addTracksToPlaylist).toHaveBeenCalledTimes(2)
      expect((client.addTracksToPlaylist as Mock).mock.calls[0][1]).toEqual(
        tracks.slice(0, LIMIT_ADD_TRACKS_TO_PLAYLIST).map(({ uri }) => uri)
      )
      expect((client.addTracksToPlaylist as Mock).mock.calls[1][1]).toEqual(
        tracks
          .slice(
            LIMIT_ADD_TRACKS_TO_PLAYLIST,
            LIMIT_ADD_TRACKS_TO_PLAYLIST + numTracksOverLimit
          )
          .map(({ uri }) => uri)
      )
    })
  })

  describe("updatePlaylistDetails", () => {
    test("updates playlist details", async () => {
      const id = "foo123"
      const url = createUri(UriType.Playlist, id)
      const details = {
        name: "foo bar baz",
      }

      client.changePlaylistDetails = vi.fn()

      await service.updatePlaylistDetails(url, details)

      expect(client.changePlaylistDetails).toHaveBeenCalledTimes(1)
      expect(client.changePlaylistDetails).toHaveBeenCalledWith(id, details)
    })
  })
})
