const Joi = require('joi')

function buildSchema (tasks) {
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

module.exports = {
  buildSchema
}
