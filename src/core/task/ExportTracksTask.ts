import { writeFile } from "node:fs/promises"
import Joi from "joi"
import { pick } from "lodash-es"
import { ExecuteTaskOptions, Task, TaskConfig, TaskConfigSchema } from "../task"

export const FORMAT_JSON = "json"

const EXPORTABLE_FIELDS = [
  "id",
  "name",
  "trackNumber",
  "album",
  "albumId",
  "albumUri",
  "releaseDate",
  "releaseYear",
  "artist",
  "artistId",
  "artistUri",
  "uri",
  "genre",
  "popularity",
  "duration",
  "explicit",
] as const

const ExportFormat = [FORMAT_JSON] as const

type ExportableField = (typeof EXPORTABLE_FIELDS)[number]

export interface ExportTracksTaskConfig extends TaskConfig {
  tracks: string
  format: (typeof ExportFormat)[number]
  fields: Array<ExportableField>
  filename: string
}

export default class ExportTracksTask
  implements Task<ExportTracksTaskConfig, void>
{
  public readonly id = "tracks.export"

  public getConfigSchema(): TaskConfigSchema<ExportTracksTaskConfig> {
    return {
      tracks: Joi.string().required(),
      fields: Joi.array()
        .items(Joi.string().valid(...EXPORTABLE_FIELDS))
        .required(),
      format: Joi.string().valid(FORMAT_JSON).required(),
      filename: Joi.string().required(),
    }
  }

  public async execute({
    config,
    trackCollections,
  }: ExecuteTaskOptions<ExportTracksTaskConfig>): Promise<void> {
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
      throw new Error(
        `an error occurred exporting tracks to file: ${err.message}`
      )
    }
  }
}
