import Joi from "joi"
import { flatMap, groupBy, orderBy } from "lodash-es"

export const SORT_ASCENDING = "asc"
export const SORT_DESCENDING = "desc"

export const id = "tracks.sort"

/**
 * Get the config schema for this task
 *
 * @returns {object}
 */
export function getConfigSchema() {
  return {
    tracks: Joi.string().required(),
    sort: Joi.object()
      .keys({
        album: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
        artist: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
        name: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
        releaseDate: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
        releaseYear: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
        trackNumber: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
        popularity: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
        duration: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      })
      .required(),
    group_by: Joi.valid(
      "trackNumber",
      "album",
      "albumId",
      "albumUri",
      "releaseDate",
      "releaseYear",
      "artist",
      "artistId",
      "artistUri",
      "popularity",
      "duration",
      "explicit",
      "name"
    ),
    sort_group: Joi.object().keys({
      trackNumber: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      album: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      albumId: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      albumUri: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      releaseDate: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      releaseYear: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      artist: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      artistId: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      artistUri: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      popularity: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      duration: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      explicit: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
      name: Joi.valid(SORT_ASCENDING, SORT_DESCENDING),
    }),
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
  const tracks = trackCollections[config.tracks]

  if (tracks === undefined) {
    throw new Error(`"${config.tracks}" is not a valid track source`)
  }

  // Group together tracks - If config.group_by is not set, use a single group
  // containing all tracks
  let groups = [tracks]

  if (config.group_by !== undefined) {
    groups = Object.values(groupBy(tracks, config.group_by))
  }

  // Sort the tracks in each group
  groups = groups.map((group) => {
    return orderBy(
      group,
      Object.keys(config.sort).map((field) => {
        if (["album", "artist", "name"].includes(field)) {
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
        if (["album", "artist", "name"].includes(field)) {
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
