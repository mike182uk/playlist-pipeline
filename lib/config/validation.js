import Joi from 'joi'

/**
 * Build config validation schema from the provided tasks
 *
 * @param {object[]} tasks
 *
 * @returns {Joi.ObjectSchema<any>}
 */
export function buildSchema (tasks) {
  const tasksSchema = tasks.reduce((schema, task) => {
    if (task.getConfigSchema === undefined) return schema

    return schema.when('.type', {
      is: task.id,
      then: Joi.object({
        type: Joi.valid(task.id),
        ...task.getConfigSchema()
      }).required()
    })
  }, Joi.object({
    type: Joi.valid(
      ...tasks.map(({ id }) => id)
    ).required()
  }))

  return Joi.object({
    name: Joi.string().required(),
    tasks: Joi.object().pattern(
      Joi.string(),
      tasksSchema
    ).required()
  })
}
