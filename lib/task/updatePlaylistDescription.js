const format = require('date-fns/format')
const Handlebars = require('handlebars')
const Joi = require('joi')
const { extractIDFromURL } = require('../spotify/utils')

const id = 'playlist.update_description'

Handlebars.registerHelper('date', (fmt) => {
  return format(new Date(), fmt)
})

/**
 * Get the config schema for this task
 *
 * @returns {object}
 */
function getConfigSchema () {
  return {
    spotify_url: Joi.string().required(),
    description: Joi.string().required()
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
  const playlistId = extractIDFromURL(config.spotify_url)
  try {
    const descriptionTemplate = Handlebars.compile(config.description)

    await spotify.changePlaylistDetails(playlistId, { description: descriptionTemplate() })
  } catch (err) {
    throw new Error(`an error occurred updating playlist description: ${err.message}`)
  }
}

module.exports = {
  id,
  getConfigSchema,
  execute
}
