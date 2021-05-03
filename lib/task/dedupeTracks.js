const _ = require('lodash')
const Joi = require('joi')

const id = 'tracks.dedupe'

function getConfigSchema () {
  return {
    tracks: Joi.string().required()
  }
}

async function execute ({ config, trackCollections }) {
  const tracks = trackCollections[config.tracks]

  if (tracks === undefined) {
    throw new Error(`${config.tracks} is not a valid track source`)
  }

  return _.uniqBy(tracks, ({ uri }) => uri)
}

module.exports = {
  id,
  getConfigSchema,
  execute
}
