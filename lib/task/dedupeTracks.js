const { uniqBy } = require('lodash')
const Joi = require('joi')

const id = 'tracks.dedupe'

/**
 * Get the config schema for this task
 *
 * @returns {object}
 */
function getConfigSchema () {
  return {
    tracks: Joi.string().required()
  }
}

/**
 * Execute the task
 *
 * @param {object} config
 * @param {object} trackCollections
 *
 * @returns {Promise<object[]>}
 */
async function execute ({ config, trackCollections }) {
  const tracks = trackCollections[config.tracks]

  if (tracks === undefined) {
    throw new Error(`"${config.tracks}" is not a valid track source`)
  }

  return uniqBy(tracks, ({ uri }) => uri)
}

module.exports = {
  id,
  getConfigSchema,
  execute
}
