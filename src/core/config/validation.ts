import Joi, { ObjectSchema } from "joi"
import { Task, TaskConfig } from "../task"

export function buildSchema(tasks: Task<TaskConfig, any>[]): ObjectSchema {
  const tasksSchema = tasks.reduce(
    (schema, task) => {
      return schema.when(".type", {
        is: task.id,
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
