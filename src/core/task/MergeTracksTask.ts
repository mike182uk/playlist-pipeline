import Joi from "joi"

import type {
  ExecuteOptions,
  Task,
  TaskConfig,
  TaskConfigSchema,
} from "../task"
import type { TrackCollection } from "../track"

interface MergeTracksTaskConfig extends TaskConfig {
  tracks: string[]
}

type MergeTracksTaskExecuteOptions = ExecuteOptions<MergeTracksTaskConfig> & {
  trackCollections: Record<string, TrackCollection>
}

export default class MergeTracksTask
  implements
    Task<MergeTracksTaskConfig, MergeTracksTaskExecuteOptions, TrackCollection>
{
  public readonly id = "tracks.merge"

  public getConfigSchema(): TaskConfigSchema<MergeTracksTaskConfig> {
    return {
      tracks: Joi.array().items(Joi.string()).required(),
    }
  }

  public async execute({
    config,
    trackCollections,
  }: MergeTracksTaskExecuteOptions): Promise<TrackCollection> {
    return config.tracks.reduce(
      (allTracks: TrackCollection, trackCollectionName: string) => {
        const tracks: TrackCollection = trackCollections[trackCollectionName]

        if (tracks === undefined) {
          throw new Error(
            `"${trackCollectionName}" is not a valid track source`
          )
        }

        return allTracks.concat(tracks)
      },
      []
    )
  }
}
