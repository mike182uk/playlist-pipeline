import type { ExportTracksTaskConfig } from "../task/ExportTracksTask"
import type { FilterTracksTaskConfig } from "../task/FilterTracksTask"
import type { SortTracksTaskConfig } from "../task/SortTracksTask"

type TaskConfigWithType<TaskConfig, TaskType> = TaskConfig & {
  type: TaskType
}

type AnyTaskConfig =
  | TaskConfigWithType<FilterTracksTaskConfig, "tracks.filter">
  | TaskConfigWithType<SortTracksTaskConfig, "tracks.sort">
  | TaskConfigWithType<ExportTracksTaskConfig, "tracks.export">

interface Config {
  tasks: {
    [key: string]: AnyTaskConfig
  }
}

const ALBUM_FIELDS = [
  "album",
  "albumId",
  "albumUri",
  "releaseDate",
  "releaseYear",
]
const GENRE_FIELD = "genre"

export function getFieldsUsedInConfig(config: Config): string[] {
  return Object.values(config.tasks).reduce(
    (usedFields: string[], taskConfig) => {
      let fields: string[] = []

      if (taskConfig.type === "tracks.filter") {
        const filters =
          Array.isArray(taskConfig.filter) === false
            ? [taskConfig.filter]
            : taskConfig.filter

        for (const filter of filters) {
          fields = fields.concat(Object.keys(filter))
        }
      }

      if (taskConfig.type === "tracks.sort") {
        fields = fields.concat(Object.keys(taskConfig.sort))

        if (taskConfig.group_by !== undefined) {
          fields = fields.concat(taskConfig.group_by)
        }

        if (taskConfig.sort_group !== undefined) {
          fields = fields.concat(Object.keys(taskConfig.sort_group))
        }
      }

      if (taskConfig.type === "tracks.export") {
        fields = fields.concat(taskConfig.fields)
      }

      return usedFields.concat(fields)
    },
    []
  )
}

export function usesAlbumField(config): boolean {
  const fieldsUsed = getFieldsUsedInConfig(config)

  for (const field of ALBUM_FIELDS) {
    if (fieldsUsed.includes(field)) {
      return true
    }
  }

  return false
}

export function usesGenreField(config): boolean {
  return getFieldsUsedInConfig(config).includes(GENRE_FIELD)
}
