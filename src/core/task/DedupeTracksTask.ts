import Joi from "joi"
import { uniqBy } from "lodash-es"
import {
  ExecuteTaskOptions,
  TaskConfig,
  TaskConfigSchema,
  TrackCollectionModifierTask,
} from "../task"
import { TrackCollection } from "../track"

export interface DedupeTracksTaskConfig extends TaskConfig {
  tracks: string
}

export default class DedupeTracksTask
  implements TrackCollectionModifierTask<DedupeTracksTaskConfig>
{
  public readonly id = "tracks.dedupe"

  public getConfigSchema(): TaskConfigSchema<DedupeTracksTaskConfig> {
    return {
      tracks: Joi.string().required(),
    }
  }

  public async execute({
    config,
    trackCollections,
  }: ExecuteTaskOptions<DedupeTracksTaskConfig>): Promise<TrackCollection> {
    const tracks = trackCollections[config.tracks]

    if (tracks === undefined) {
      throw new Error(`"${config.tracks}" is not a valid track source`)
    }

    return uniqBy(tracks, ({ uri }) => uri)
  }
}
