import Joi from "joi"

export const id = "tracks.merge"

/**
 * Get the config schema for this task
 *
 * @returns {object}
 */
export function getConfigSchema() {
  return {
    tracks: Joi.array().items(Joi.string()).required(),
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
export async function execute({ config, trackCollections }) {
  return config.tracks.reduce((allTracks, trackCollectionName) => {
    const tracks = trackCollections[trackCollectionName]

    if (tracks === undefined) {
      throw new Error(`"${trackCollectionName}" is not a valid track source`)
    }

    return allTracks.concat(tracks)
  }, [])
}
