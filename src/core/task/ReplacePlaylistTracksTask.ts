import Joi from "joi"

import type { ProviderService } from "../provider"
import type {
  ExecuteOptions,
  Task,
  TaskConfig,
  TaskConfigSchema,
} from "../task"
import type { TrackCollection } from "../track"

interface ReplacePlaylistTracksTaskConfig extends TaskConfig {
  url: string
  tracks: string
}

type ReplacePlaylistTracksTaskExecuteOptions =
  ExecuteOptions<ReplacePlaylistTracksTaskConfig> & {
    trackCollections: Record<string, TrackCollection>
    providerService: ProviderService
  }

export default class ReplacePlaylistTracksTask
  implements
    Task<
      ReplacePlaylistTracksTaskConfig,
      ReplacePlaylistTracksTaskExecuteOptions
    >
{
  public readonly id = "playlist.replace_tracks"

  public getConfigSchema(): TaskConfigSchema<ReplacePlaylistTracksTaskConfig> {
    return {
      url: Joi.string().required(),
      tracks: Joi.string().required(),
    }
  }

  public async execute({
    config,
    trackCollections,
    providerService,
  }: ReplacePlaylistTracksTaskExecuteOptions): Promise<void> {
    const tracks = trackCollections[config.tracks]

    if (tracks === undefined) {
      throw new Error(`"${config.tracks}" is not a valid track source`)
    }

    try {
      await providerService.replaceTracksInPlaylist(config.url, tracks)
    } catch (err) {
      throw new Error(
        `an error occurred replacing playlist tracks: ${err.message}`
      )
    }
  }
}
