import { chunk } from "lodash-es"
import type SpotifyWebApi from "spotify-web-api-node"

import type { PlaylistDetails } from "../../playlist"
import type { ProviderService } from "../../provider"
import type { TrackCollection } from "../../track"
import { extractIdFromUrl } from "./utils"

export const LIMIT_ADD_TRACKS_TO_PLAYLIST = 100

export default class SpotifyService implements ProviderService {
  #client: SpotifyWebApi

  constructor(client: SpotifyWebApi) {
    this.#client = client
  }

  async getAlbumTracks(url: string): Promise<TrackCollection> {
    return [] // TODO
  }

  async getLibraryTracks(): Promise<TrackCollection> {
    return [] // TODO
  }

  async getPlaylistTracks(url: string): Promise<TrackCollection> {
    return [] // TODO
  }

  async replaceTracksInPlaylist(
    url: string,
    tracks: TrackCollection
  ): Promise<void> {
    const playlistId = extractIdFromUrl(url)

    // Clear the playlist - We can't use SpotifyWebApi.replaceTracksInPlaylist
    // due to a limit on the number of tracks that can be replaced at once (100)
    const { statusCode: clearTracksStatusCode } =
      await this.#client.replaceTracksInPlaylist(playlistId, [])

    if (clearTracksStatusCode !== 201) {
      throw new Error(
        `unexpected status code returned (${clearTracksStatusCode}) whilst clearing tracks in playlist`
      )
    }

    // SpotifyWebApi.addTracksToPlaylist only allows a certain amount of uris in
    // a single request so we need to make multiple requests if there are more
    // than LIMIT_ADD_TRACKS_TO_PLAYLIST
    const trackUris = tracks.map(({ uri }) => uri)
    const chunkedTrackUris = chunk(trackUris, LIMIT_ADD_TRACKS_TO_PLAYLIST)

    for (const trackUrisChunk of chunkedTrackUris) {
      const { statusCode } = await this.#client.addTracksToPlaylist(
        playlistId,
        trackUrisChunk
      )

      if (statusCode !== 201) {
        throw new Error(
          `unexpected status code returned (${statusCode}) whilst replacing tracks in playlist`
        )
      }
    }
  }

  async updatePlaylistDetails(
    url: string,
    details: PlaylistDetails
  ): Promise<void> {
    const playlistId = extractIdFromUrl(url)

    await this.#client.changePlaylistDetails(playlistId, details)
  }
}
