import { pick } from 'lodash-es'
import { writeFile } from 'node:fs/promises'
import Joi from 'joi'

export const FORMAT_JSON = 'json'

export const id = 'tracks.export'

/**
 * Get the config schema for this task
 *
 * @returns {object}
 */
export function getConfigSchema () {
  return {
    tracks: Joi.string().required(),
    fields: Joi.array().items(
      Joi.string().valid(
        'id',
        'name',
        'trackNumber',
        'album',
        'albumId',
        'albumUri',
        'releaseDate',
        'releaseYear',
        'artist',
        'artistId',
        'artistUri',
        'uri',
        'genre',
        'popularity',
        'duration',
        'explicit'
      )
    ).required(),
    format: Joi.string().valid(FORMAT_JSON).required(),
    filename: Joi.string().required()
  }
}

/**
 * Execute the task
 *
 * @param {object} config
 * @param {object} trackCollections
 *
 * @returns {Promise<void>}
 */
export async function execute ({ config, trackCollections }) {
  const tracks = trackCollections[config.tracks]

  if (tracks === undefined) {
    throw new Error(`"${config.tracks}" is not a valid track source`)
  }

  try {
    const data = JSON.stringify(
      tracks.map((track) => {
        return pick(track, config.fields)
      }),
      null,
      2
    )
    const filename = `${config.filename}.json`

    await writeFile(filename, data)
  } catch (err) {
    throw new Error(`an error occurred exporting tracks to file: ${err.message}`)
  }
}
