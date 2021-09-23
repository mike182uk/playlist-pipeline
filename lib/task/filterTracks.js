const { flatten } = require('lodash')
const Joi = require('joi')

const id = 'tracks.filter'

function getConfigSchema () {
  const stringFieldSchema = Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  )

  const numberFieldSchema = Joi.alternatives().try(
    Joi.number(),
    Joi.array().items(Joi.number())
  )

  const fieldsSchema = Joi.object().keys({
    album: stringFieldSchema,
    artist: stringFieldSchema,
    name: stringFieldSchema,
    trackNumber: numberFieldSchema,
    genre: stringFieldSchema,
    explicit: Joi.boolean()
  }).required()

  return {
    tracks: Joi.string().required(),
    filter: Joi.alternatives(
      fieldsSchema,
      Joi.array().items(fieldsSchema)
    ).required()
  }
}

async function execute ({ config, trackCollections }) {
  const tracks = trackCollections[config.tracks]

  if (tracks === undefined) {
    throw new Error(`"${config.tracks}" is not a valid track source`)
  }

  const filters = Array.isArray(config.filter) === false
    ? [config.filter]
    : config.filter

  return tracks.filter((track) => {
    let ok = false

    for (const idx in filters) {
      // If a previous filter already matched than exit early as we don't to match on multiple filters
      if (ok === true) return true

      // Assume that this filter matches
      ok = true

      const filter = filters[idx]

      for (const key of Object.keys(filter)) {
        const values = (
          Array.isArray(filter[key])
            ? flatten(filter[key])
            : [filter[key]]
        )
          .map((value) => {
            // Ignore case for string values
            if (typeof value === 'string') {
              return value.toLowerCase()
            }

            return value
          })

        // Check that the track field matches the corresponding filter field
        // TODO: Refactor this - remove duplication
        if (Array.isArray(track[key])) {
          ok = false

          for (const val of track[key]) {
            const fieldValue = (typeof val === 'string')
              ? val.toLowerCase()
              : val

            if (values.includes(fieldValue)) {
              ok = true
            }
          }
        } else {
          const fieldValue = (typeof track[key] === 'string')
            ? track[key].toLowerCase()
            : track[key]

          if (values.includes(fieldValue) === false) {
            ok = false
          }
        }
      }
    }

    return ok
  })
}

module.exports = {
  id,
  getConfigSchema,
  execute
}
