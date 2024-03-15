import type { Schema } from "joi"

export type TaskConfig<T = Record<string, unknown>> = T

export type TaskConfigSchema<T extends TaskConfig> = {
  [P in keyof T]: Schema
}

export interface ExecuteOptions<T extends TaskConfig> {
  config: T
  [key: string]: unknown
}

export interface Task<
  ConfigType extends TaskConfig,
  ExecuteOptionsType = ExecuteOptions<ConfigType>,
  ExecuteReturnType = void,
> {
  readonly id: string
  getConfigSchema: () => TaskConfigSchema<ConfigType>
  execute: (opts: ExecuteOptionsType) => Promise<ExecuteReturnType>
}
