import Joi from "joi"
import { uniqBy } from "lodash-es"

import type {
  ExecuteOptions,
  Task,
  TaskConfig,
  TaskConfigSchema,
} from "../task"
import type { TrackCollection } from "../track"

interface DedupeTracksTaskConfig extends TaskConfig {
  tracks: string
}

type DedupeTracksTaskExecuteOptions = ExecuteOptions<DedupeTracksTaskConfig> & {
  trackCollections: Record<string, TrackCollection>
}

export default class DedupeTracksTask
  implements
    Task<
      DedupeTracksTaskConfig,
      DedupeTracksTaskExecuteOptions,
      TrackCollection
    >
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
  }: DedupeTracksTaskExecuteOptions): Promise<TrackCollection> {
    const tracks = trackCollections[config.tracks]

    if (tracks === undefined) {
      throw new Error(`"${config.tracks}" is not a valid track source`)
    }

    return uniqBy(tracks, ({ uri }) => uri)
  }
}
