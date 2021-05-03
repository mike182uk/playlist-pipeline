const Joi = require('joi')

const id = 'tracks.merge'

function getConfigSchema () {
  return {
    tracks: Joi.array().items(
      Joi.string()
    ).required()
  }
}

async function execute ({ config, trackCollections }) {
  return config.tracks.reduce((allTracks, trackCollectionName) => {
    const tracks = trackCollections[trackCollectionName]

    if (tracks === undefined) {
      throw new Error(`${trackCollectionName} is not a valid track source`)
    }

    return allTracks.concat(tracks)
  }, [])
}

module.exports = {
  id,
  getConfigSchema,
  execute
}
