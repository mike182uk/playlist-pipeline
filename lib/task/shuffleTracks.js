import { shuffle } from 'lodash-es'
import Joi from 'joi'

export const id = 'tracks.shuffle'

/**
 * Get the config schema for this task
 *
 * @returns {object}
 */
export function getConfigSchema () {
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
export async function execute ({ config, trackCollections }) {
  const tracks = trackCollections[config.tracks]

  if (tracks === undefined) {
    throw new Error(`"${config.tracks}" is not a valid track source`)
  }

  return shuffle(tracks)
}
