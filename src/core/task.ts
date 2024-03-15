import type { Schema } from "joi"
import type { TrackCollection } from "./track"

export type TaskConfig<T = Record<string, unknown>> = T

export type TaskConfigSchema<T extends TaskConfig> = {
  [P in keyof T]: Schema
}

export interface ExecuteTaskOptions<
  ExecuteTaskOptionsConfigType extends TaskConfig,
> {
  config: ExecuteTaskOptionsConfigType
  trackCollections: Record<string, TrackCollection>
}

export interface Task<
  ExecuteTaskOptionsConfigType extends TaskConfig,
  ExecuteTaskReturnType,
> {
  readonly id: string
  getConfigSchema: () => TaskConfigSchema<ExecuteTaskOptionsConfigType>
  execute: (
    opts: ExecuteTaskOptions<ExecuteTaskOptionsConfigType>
  ) => Promise<ExecuteTaskReturnType>
}

export type TrackCollectionModifierTask<
  ExecuteTaskOptionsConfigType extends TaskConfig = TaskConfig,
> = Task<ExecuteTaskOptionsConfigType, TrackCollection>
