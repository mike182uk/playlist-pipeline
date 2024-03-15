import Joi from "joi"
import { shuffle } from "lodash-es"

import type {
  ExecuteOptions,
  Task,
  TaskConfig,
  TaskConfigSchema,
} from "../task"
import type { TrackCollection } from "../track"

interface ShuffleTracksTaskConfig extends TaskConfig {
  tracks: string
}

type ShuffleTracksTaskExecuteOptions =
  ExecuteOptions<ShuffleTracksTaskConfig> & {
    trackCollections: Record<string, TrackCollection>
  }

export default class ShuffleTracksTask
  implements
    Task<
      ShuffleTracksTaskConfig,
      ShuffleTracksTaskExecuteOptions,
      TrackCollection
    >
{
  public readonly id = "tracks.shuffle"

  public getConfigSchema(): TaskConfigSchema<ShuffleTracksTaskConfig> {
    return {
      tracks: Joi.string().required(),
    }
  }

  public async execute({
    config,
    trackCollections,
  }: ShuffleTracksTaskExecuteOptions): Promise<TrackCollection> {
    const tracks = trackCollections[config.tracks]

    if (tracks === undefined) {
      throw new Error(`"${config.tracks}" is not a valid track source`)
    }

    return shuffle(tracks)
  }
}
