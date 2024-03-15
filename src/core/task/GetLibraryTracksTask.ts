import type { ProviderService } from "../provider"
import type {
  ExecuteOptions,
  Task,
  TaskConfig,
  TaskConfigSchema,
} from "../task"
import type { TrackCollection } from "../track"

type GetLibraryTracksTaskExecuteOptions = ExecuteOptions<TaskConfig> & {
  providerService: ProviderService
}

export default class GetLibraryTracksTask
  implements
    Task<TaskConfig, GetLibraryTracksTaskExecuteOptions, TrackCollection>
{
  public readonly id = "library.get_tracks"

  public getConfigSchema(): TaskConfigSchema<TaskConfig> {
    return {}
  }

  public async execute({
    providerService,
  }: GetLibraryTracksTaskExecuteOptions): Promise<TrackCollection> {
    return providerService.getLibraryTracks().catch((err) => {
      throw new Error(
        `an error occurred retrieving library tracks: ${err.message}`
      )
    })
  }
}
