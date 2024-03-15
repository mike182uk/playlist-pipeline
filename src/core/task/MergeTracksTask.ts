import Joi from "joi"
import {
  ExecuteTaskOptions,
  TaskConfig,
  TaskConfigSchema,
  TrackCollectionModifierTask,
} from "../task"
import { TrackCollection } from "../track"

export interface MergeTracksTaskConfig extends TaskConfig {
  tracks: string[]
}

export default class MergeTracksTask
  implements TrackCollectionModifierTask<MergeTracksTaskConfig>
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
  }: ExecuteTaskOptions<MergeTracksTaskConfig>): Promise<TrackCollection> {
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
