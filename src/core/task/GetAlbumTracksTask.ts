import Joi from "joi"

import type { ProviderService } from "../provider"
import type {
  ExecuteOptions,
  Task,
  TaskConfig,
  TaskConfigSchema,
} from "../task"
import type { TrackCollection } from "../track"

interface GetAlbumTracksTaskConfig extends TaskConfig {
  url: string
}

type GetAlbumTracksTaskExecuteOptions =
  ExecuteOptions<GetAlbumTracksTaskConfig> & {
    providerService: ProviderService
  }

export default class GetAlbumTracksTask
  implements
    Task<
      GetAlbumTracksTaskConfig,
      GetAlbumTracksTaskExecuteOptions,
      TrackCollection
    >
{
  public readonly id = "album.get_tracks"

  public getConfigSchema(): TaskConfigSchema<GetAlbumTracksTaskConfig> {
    return {
      url: Joi.string().required(),
    }
  }

  public async execute({
    config,
    providerService,
  }: GetAlbumTracksTaskExecuteOptions): Promise<TrackCollection> {
    return providerService.getAlbumTracks(config.url).catch((err) => {
      throw new Error(
        `an error occurred retrieving album tracks: ${err.message}`
      )
    })
  }
}
