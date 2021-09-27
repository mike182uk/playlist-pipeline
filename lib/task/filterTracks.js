const Joi = require('joi')

const id = 'tracks.filter'

const OPERATOR_EQUALS = 'eq'
const OPERATOR_NOT_EQUALS = 'neq'
const OPERATOR_GREATER_THAN = 'gt'
const OPERATOR_GREATER_THAN_OR_EQUAL_TO = 'gte'
const OPERATOR_LESS_THAN = 'lt'
const OPERATOR_LESS_THAN_OR_EQUAL_TO = 'lte'
const SHORTHAND_OPERATOR_MAP = {
  '': OPERATOR_EQUALS,
  '=': OPERATOR_EQUALS,
  '!': OPERATOR_NOT_EQUALS,
  '!=': OPERATOR_NOT_EQUALS,
  '>': OPERATOR_GREATER_THAN,
  '<': OPERATOR_LESS_THAN,
  '>=': OPERATOR_GREATER_THAN_OR_EQUAL_TO,
  '<=': OPERATOR_LESS_THAN_OR_EQUAL_TO
}
const SHORTHAND_OPERATOR_IN_VALUE_RE = /^([!><]?=?)\s*(.*)/

/**
 * Get the config schema for this task
 *
 * @returns {object}
 */
function getConfigSchema () {
  const stringFieldSchema = Joi.alternatives(
    Joi.object().keys({
      operator: Joi.string().valid(OPERATOR_EQUALS, OPERATOR_NOT_EQUALS),
      value: Joi.string()
    }),
    Joi.string()
  )
  const numberFieldSchema = Joi.alternatives(
    Joi.object().keys({
      operator: Joi.string().valid(
        OPERATOR_EQUALS,
        OPERATOR_NOT_EQUALS,
        OPERATOR_GREATER_THAN,
        OPERATOR_GREATER_THAN_OR_EQUAL_TO,
        OPERATOR_LESS_THAN,
        OPERATOR_LESS_THAN_OR_EQUAL_TO
      ),
      value: Joi.number()
    }),
    Joi.number(),
    Joi.string()
  )
  const booleanFieldSchema = Joi.alternatives(
    Joi.object().keys({
      operator: Joi.string().valid(OPERATOR_EQUALS, OPERATOR_NOT_EQUALS),
      value: Joi.boolean()
    }),
    Joi.boolean()
  )

  const fieldsSchema = Joi.object().keys({
    album: stringFieldSchema,
    artist: stringFieldSchema,
    name: stringFieldSchema,
    trackNumber: numberFieldSchema,
    genre: stringFieldSchema,
    explicit: booleanFieldSchema,
    popularity: numberFieldSchema,
    duration: numberFieldSchema
  }).required()

  return {
    tracks: Joi.string().required(),
    filter: Joi.alternatives(
      fieldsSchema,
      Joi.array().items(fieldsSchema)
    ).required()
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

  const doFilter = (filter, track) => {
    // Assume everything is ok until a filter does not match
    let ok = true

    for (const fieldName of Object.keys(filter)) {
      // If previous filter did not match, return early
      if (ok === false) return false

      let operator
      let filterValue
      let fieldValue = track[fieldName]

      // Check the value to see if it includes a shorthand operator
      if (typeof filter[fieldName] === 'string') {
        const shorthandOperatorInValueResult = filter[fieldName].match(SHORTHAND_OPERATOR_IN_VALUE_RE)

        operator = SHORTHAND_OPERATOR_MAP[
          shorthandOperatorInValueResult[1].trim()
        ]
        filterValue = shorthandOperatorInValueResult[2]

        // If value is numeric, it is likely this operator was being used
        // for a numeric value so cast the value to a number
        if (isNaN(Number(filterValue)) === false) {
          filterValue = Number(filterValue)
        }
      // Check the value to see if it is a boolean or number primitive
      } else if (['boolean', 'number'].includes(typeof filter[fieldName])) {
        operator = OPERATOR_EQUALS
        filterValue = filter[fieldName]
      // Assume the value is a valid object
      } else {
        operator = filter[fieldName].operator
        filterValue = filter[fieldName].value
      }

      // Match string values case insensitively
      if (['album', 'artist', 'name', 'genre'].includes(fieldName)) {
        filterValue = filterValue.toLowerCase()
        fieldValue = Array.isArray(fieldValue)
          ? fieldValue.map((v) => v.toLowerCase())
          : fieldValue.toLowerCase()
      }

      switch (operator) {
        case OPERATOR_EQUALS:
          if (Array.isArray(fieldValue)) {
            ok = fieldValue.includes(filterValue)
          } else {
            ok = fieldValue === filterValue
          }
          break
        case OPERATOR_NOT_EQUALS:
          if (Array.isArray(fieldValue)) {
            ok = fieldValue.includes(filterValue) === false
          } else {
            ok = fieldValue !== filterValue
          }
          break
        case OPERATOR_GREATER_THAN:
          ok = Number(fieldValue) > Number(filterValue)
          break
        case OPERATOR_GREATER_THAN_OR_EQUAL_TO:
          ok = Number(fieldValue) >= Number(filterValue)
          break
        case OPERATOR_LESS_THAN:
          ok = Number(fieldValue) < Number(filterValue)
          break
        case OPERATOR_LESS_THAN_OR_EQUAL_TO:
          ok = Number(fieldValue) <= Number(filterValue)
          break
      }
    }

    return ok
  }

  return tracks.filter((track) => {
    const filters = Array.isArray(config.filter) === false
      ? [config.filter]
      : config.filter

    let ok = false

    for (const filter of filters) {
      // If previous field filter did match, return early
      if (ok === true) return true

      ok = doFilter(filter, track)
    }

    return ok
  })
}

module.exports = {
  id,
  getConfigSchema,
  execute,
  OPERATOR_EQUALS,
  OPERATOR_NOT_EQUALS,
  OPERATOR_GREATER_THAN,
  OPERATOR_GREATER_THAN_OR_EQUAL_TO,
  OPERATOR_LESS_THAN,
  OPERATOR_LESS_THAN_OR_EQUAL_TO
}
