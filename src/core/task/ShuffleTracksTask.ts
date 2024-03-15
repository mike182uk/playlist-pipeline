import Joi from "joi"
import { shuffle } from "lodash-es"
import {
  ExecuteTaskOptions,
  TaskConfig,
  TaskConfigSchema,
  TrackCollectionModifierTask,
} from "../task"
import { TrackCollection } from "../track"

export interface ShuffleTracksTaskConfig extends TaskConfig {
  tracks: string
}

export default class ShuffleTracksTask
  implements TrackCollectionModifierTask<ShuffleTracksTaskConfig>
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
  }: ExecuteTaskOptions<ShuffleTracksTaskConfig>): Promise<TrackCollection> {
    const tracks = trackCollections[config.tracks]

    if (tracks === undefined) {
      throw new Error(`"${config.tracks}" is not a valid track source`)
    }

    return shuffle(tracks)
  }
}
