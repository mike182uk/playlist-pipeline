const { flatMap, groupBy, orderBy } = require('lodash')
const Joi = require('joi')

const SORT_ASCENDING = 'asc'
const SORT_DESCENDING = 'desc'

const id = 'tracks.sort'

/**
 * Get the config schema for this task
 *
 * @returns {object}
 */
function getConfigSchema () {
  return {
    tracks: Joi.string().required(),
    sort: Joi.object().keys({
      album: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      artist: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      name: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      releaseDate: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      trackNumber: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      popularity: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      duration: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      acousticness: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      danceability: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      energy: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      instrumentalness: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      liveness: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      loudness: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      speechiness: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      tempo: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      timeSignature: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      valence: Joi.valid(SORT_ASCENDING, SORT_DESCENDING)
    }).required(),
    group_by: Joi.valid(
      'trackNumber',
      'album',
      'albumId',
      'albumUri',
      'artist',
      'artistId',
      'artistUri',
      'name',
      'trackNumber'
    ),
    sort_group: Joi.object().keys({
      album: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      artist: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      releaseDate: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
    })
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

  // Group together tracks - If config.group_by is not set, use a single group
  // containing all tracks
  let groups = [tracks]

  if (config.group_by !== undefined) {
    groups = Object.values(
      groupBy(tracks, config.group_by)
    )
  }

  // Sort the tracks in each group
  groups = groups.map((group) => {
    return orderBy(
      group,
      Object.keys(config.sort).map((field) => {
        if (['album', 'artist', 'name'].includes(field)) {
          return (track) => track[field].toLowerCase()
        }

        return field
      }),
      Object.values(config.sort)
    )
  })

  // Sort the groups using the first track in each group
  if (config.sort_group !== undefined) {
    groups = orderBy(
      groups,
      Object.keys(config.sort_group).map((field) => {
        if (['album', 'artist', 'name'].includes(field)) {
          return (group) => group[0][field].toLowerCase()
        }

        return (group) => group[0][field]
      }),
      Object.values(config.sort_group)
    )
  }

  // Flatten out the grouped tracks into a single array
  return flatMap(groups)
}

module.exports = {
  id,
  getConfigSchema,
  execute,
  SORT_ASCENDING,
  SORT_DESCENDING
}
