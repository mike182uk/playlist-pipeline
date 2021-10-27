const { pick } = require('lodash')
const { promisify } = require('util')
const fs = require('fs')
const Joi = require('joi')

const writeFile = promisify(fs.writeFile)

const FORMAT_JSON = 'json'

const id = 'tracks.write_to_file'

/**
 * Get the config schema for this task
 *
 * @returns {object}
 */
function getConfigSchema () {
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
 * @returns {Promise<object[]>}
 */
async function execute ({ config, trackCollections }) {
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
    throw new Error(`an error occurred writing tracks to file: ${err.message}`)
  }
}

module.exports = {
  id,
  getConfigSchema,
  execute,
  FORMAT_JSON
}
