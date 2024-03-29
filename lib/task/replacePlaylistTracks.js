import Joi from "joi"
import { chunk } from "lodash-es"
import {
  LIMIT_ADD_TRACKS_TO_PLAYLIST,
  extractIDFromURL,
} from "../spotify/utils.js"

export const id = "playlist.replace_tracks"

/**
 * Get the config schema for this task
 *
 * @returns {object}
 */
export function getConfigSchema() {
  return {
    spotify_url: Joi.string().required(),
    tracks: Joi.string().required(),
  }
}

/**
 * Execute the task
 *
 * @param {object} config
 * @param {SpotifyWebApi} spotify
 * @param {object} trackCollections
 *
 * @returns {Promise<void>}
 */
export async function execute({ config, spotify, trackCollections }) {
  const tracks = trackCollections[config.tracks]

  if (tracks === undefined) {
    throw new Error(`"${config.tracks}" is not a valid track source`)
  }

  const playlistId = extractIDFromURL(config.spotify_url)

  try {
    // Clear the playlist - We can't use spotify.replaceTracksInPlaylist to actually
    // replace all of the tracks as it has a 100 track limit
    const { statusCode: clearTracksStatusCode } =
      await spotify.replaceTracksInPlaylist(playlistId, [])

    if (clearTracksStatusCode !== 201) {
      throw new Error(
        `unexpected status code returned (${clearTracksStatusCode}) whilst clearing tracks in playlist`
      )
    }

    // spotify.addTracksToPlaylist only allows a certain amount of uris in a single request so we need to
    // make multiple requests if there are more than LIMIT_ADD_TRACKS_TO_PLAYLIST uris
    const trackUris = tracks.map(({ uri }) => uri)
    const chunkedTrackUris = chunk(trackUris, LIMIT_ADD_TRACKS_TO_PLAYLIST)

    for (const trackUrisChunk of chunkedTrackUris) {
      const { statusCode } = await spotify.addTracksToPlaylist(
        playlistId,
        trackUrisChunk
      )

      if (statusCode !== 201) {
        throw new Error(
          `unexpected status code returned (${statusCode}) whilst replacing tracks in playlist`
        )
      }
    }
  } catch (err) {
    throw new Error(
      `an error occurred replacing playlist tracks: ${err.message}`
    )
  }
}
