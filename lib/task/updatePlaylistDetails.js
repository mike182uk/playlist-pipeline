import { format } from 'date-fns'
import Handlebars from 'handlebars'
import Joi from 'joi'
import { extractIDFromURL } from '../spotify/utils.js'

export const id = 'playlist.update_details'

/**
 * Get the config schema for this task
 *
 * @returns {object}
 */
export function getConfigSchema () {
  return {
    spotify_url: Joi.string().required(),
    description: Joi.string(),
    name: Joi.string()
  }
}

/**
 * Execute the task
 *
 * @param {object} config
 * @param {object} spotify
 *
 * @returns {Promise<void>}
 */
export async function execute ({ config, spotify }) {
  Handlebars.registerHelper('date', (fmt) => format(new Date(), fmt))

  const playlistId = extractIDFromURL(config.spotify_url)

  try {
    const details = {}

    if (config.description !== undefined) {
      details.description = Handlebars.compile(config.description)()
    }

    if (config.name !== undefined) {
      details.name = config.name
    }

    await spotify.changePlaylistDetails(playlistId, details)
  } catch (err) {
    throw new Error(`an error occurred updating playlist details: ${err.message}`)
  }
}
