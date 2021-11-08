const Joi = require('joi')
const { extractIDFromURL } = require('../spotify/utils')

const id = 'playlist.update_description'

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
    await spotify.changePlaylistDetails(playlistId, {
      description: config.description
    })
  } catch (err) {
    throw new Error(`an error occurred updating playlist description: ${err.message}`)
  }
}

module.exports = {
  id,
  getConfigSchema,
  execute
}
