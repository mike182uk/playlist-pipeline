import Joi, { type ObjectSchema } from "joi"
import type { Task, TaskConfig } from "../task"

export function buildSchema(tasks: Task<TaskConfig, unknown>[]): ObjectSchema {
  const tasksSchema = tasks.reduce(
    (schema, task) => {
      return schema.when(".type", {
        is: task.id,
        // biome-ignore lint/suspicious/noThenProperty: Not suspicious, part of Joi API
        then: Joi.object({
          type: Joi.valid(task.id),
          ...task.getConfigSchema(),
        }).required(),
      })
    },
    Joi.object({
      type: Joi.valid(...tasks.map(({ id }) => id)).required(),
    })
  )

  return Joi.object({
    name: Joi.string().required(),
    tasks: Joi.object().pattern(Joi.string(), tasksSchema).required(),
  })
}
