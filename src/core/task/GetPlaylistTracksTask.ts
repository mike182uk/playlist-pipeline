import Joi from "joi"

import type { ProviderService } from "../provider"
import type {
  ExecuteOptions,
  Task,
  TaskConfig,
  TaskConfigSchema,
} from "../task"
import type { TrackCollection } from "../track"

interface GetPlaylistTracksTaskConfig extends TaskConfig {
  url: string
}

type GetPlaylistTracksTaskExecuteOptions =
  ExecuteOptions<GetPlaylistTracksTaskConfig> & {
    providerService: ProviderService
  }

export default class GetPlaylistTracksTask
  implements
    Task<
      GetPlaylistTracksTaskConfig,
      GetPlaylistTracksTaskExecuteOptions,
      TrackCollection
    >
{
  public readonly id = "playlist.get_tracks"

  public getConfigSchema(): TaskConfigSchema<GetPlaylistTracksTaskConfig> {
    return {
      url: Joi.string().required(),
    }
  }

  public async execute({
    config,
    providerService,
  }: GetPlaylistTracksTaskExecuteOptions): Promise<TrackCollection> {
    return providerService.getPlaylistTracks(config.url).catch((err) => {
      throw new Error(
        `an error occurred retrieving playlist tracks: ${err.message}`
      )
    })
  }
}
