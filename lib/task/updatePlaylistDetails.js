const format = require('date-fns/format')
const Handlebars = require('handlebars')
const Joi = require('joi')
const { extractIDFromURL } = require('../spotify/utils')

const id = 'playlist.update_details'

/**
 * Get the config schema for this task
 *
 * @returns {object}
 */
function getConfigSchema () {
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
async function execute ({ config, spotify }) {
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

module.exports = {
  id,
  getConfigSchema,
  execute
}
