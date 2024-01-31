const ALBUM_FIELDS = [
  "album",
  "albumId",
  "albumUri",
  "releaseDate",
  "releaseYear",
]
const GENRE_FIELD = "genre"

/**
 * Retrieve the fields used in the provided config
 *
 * @param {object} config
 *
 * @returns {string[]}
 */
export function getFieldsUsedInConfig(config) {
  return Object.values(config.tasks).reduce((usedFields, task) => {
    let fields = []

    if (task.type === "tracks.filter") {
      const filters =
        Array.isArray(task.filter) === false ? [task.filter] : task.filter

      for (const filter of filters) {
        fields = fields.concat(Object.keys(filter))
      }
    }

    if (task.type === "tracks.sort") {
      fields = fields.concat(Object.keys(task.sort))

      if (task.group_by !== undefined) {
        fields = fields.concat(task.group_by)
      }

      if (task.sort_group !== undefined) {
        fields = fields.concat(Object.keys(task.sort_group))
      }
    }

    if (task.type === "tracks.export") {
      fields = fields.concat(task.fields)
    }

    return usedFields.concat(fields)
  }, [])
}

/**
 * Check if an album field is used by the provided config
 *
 * @param {object} config
 *
 * @returns {boolean}
 */
export function usesAlbumField(config) {
  const fieldsUsed = getFieldsUsedInConfig(config)

  for (const field of ALBUM_FIELDS) {
    if (fieldsUsed.includes(field)) {
      return true
    }
  }

  return false
}

/**
 * Check if the genre field is used by the provided config
 *
 * @param {object} config
 *
 * @returns {boolean}
 */
export function usesGenreField(config) {
  return getFieldsUsedInConfig(config).includes(GENRE_FIELD)
}
