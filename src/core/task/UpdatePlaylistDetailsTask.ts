import { format } from "date-fns"
import Handlebars from "handlebars"
import Joi from "joi"

import type { PlaylistDetails } from "../playlist"
import type { ProviderService } from "../provider"
import type {
  ExecuteOptions,
  Task,
  TaskConfig,
  TaskConfigSchema,
} from "../task"

interface UpdatePlaylistDetailsTaskConfig extends TaskConfig {
  url: string
  description: string
  name: string
}

interface UpdatePlaylistDetailsTaskConfigWithOptionals extends TaskConfig {
  url: string
  description?: string
  name?: string
}

type UpdatePlaylistDetailsTaskExecuteOptions =
  ExecuteOptions<UpdatePlaylistDetailsTaskConfigWithOptionals> & {
    providerService: ProviderService
  }

export default class UpdatePlaylistDetailsTask
  implements
    Task<
      UpdatePlaylistDetailsTaskConfig,
      UpdatePlaylistDetailsTaskExecuteOptions
    >
{
  public readonly id = "playlist.update_details"

  public getConfigSchema(): TaskConfigSchema<UpdatePlaylistDetailsTaskConfig> {
    return {
      url: Joi.string().required(),
      description: Joi.string(),
      name: Joi.string(),
    }
  }

  public async execute({
    config,
    providerService,
  }: UpdatePlaylistDetailsTaskExecuteOptions): Promise<void> {
    Handlebars.registerHelper("date", (fmt) => format(new Date(), fmt))

    try {
      const details: Partial<PlaylistDetails> = {}

      if (config.description !== undefined) {
        details.description = Handlebars.compile(config.description)({})
      }

      if (config.name !== undefined) {
        details.name = config.name
      }

      await providerService.updatePlaylistDetails(config.url, details)
    } catch (err) {
      throw new Error(
        `an error occurred updating playlist details: ${err.message}`
      )
    }
  }
}
