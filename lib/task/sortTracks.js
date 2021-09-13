const { orderBy } = require('lodash')
const Joi = require('joi')

const id = 'tracks.sort'

const SORT_ASCENDING = 'asc'
const SORT_DESCENDING = 'desc'

function getConfigSchema () {
  return {
    tracks: Joi.string().required(),
    sort: Joi.object().keys({
      album: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      artist: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      name: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      releaseDate: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      trackNumber: Joi.valid(SORT_ASCENDING, SORT_DESCENDING)
    }).required()
  }
}

async function execute ({ config, trackCollections }) {
  const tracks = trackCollections[config.tracks]

  if (tracks === undefined) {
    throw new Error(`${config.tracks} is not a valid track source`)
  }

  return orderBy(
    tracks,
    Object.keys(config.sort).map((field) => {
      if (['album', 'artist', 'name'].includes(field)) {
        return (track) => track[field].toLowerCase()
      }

      return field
    }),
    Object.values(config.sort)
  )
}

module.exports = {
  id,
  getConfigSchema,
  execute,
  SORT_ASCENDING,
  SORT_DESCENDING
}
