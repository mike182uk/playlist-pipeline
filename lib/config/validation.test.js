import Joi from "joi"
import { describe, expect, test } from "vitest"
import { findErrorByContextLabel } from "../test/validationUtils.js"
import { buildSchema } from "./validation.js"

describe("buildSchema", () => {
  test(".name is required in built schema", () => {
    const schema = buildSchema([])
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "name")

    expect(err.type).toEqual("any.required")
  })

  test(".name must be a string in built schema", () => {
    const schema = buildSchema([])
    const result = schema.validate(
      {
        name: {},
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "name")

    expect(err.type).toEqual("string.base")
  })

  test(".tasks is required in built schema", () => {
    const schema = buildSchema([])
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "tasks")

    expect(err.type).toEqual("any.required")
  })

  test(".tasks must be an object in built schema", () => {
    const schema = buildSchema([])
    const result = schema.validate(
      {
        tasks: [],
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "tasks")

    expect(err.type).toEqual("object.base")
  })

  test("tasks.<task> must be an object in built schema", () => {
    const schema = buildSchema([])
    const result = schema.validate(
      {
        tasks: {
          foo: [],
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "tasks.foo")

    expect(err.type).toEqual("object.base")
  })

  test("only known task types are allowed in built schema", () => {
    const schema = buildSchema([
      {
        id: "valid",
        getConfigSchema: () => {},
      },
    ])
    const result = schema.validate(
      {
        tasks: {
          valid: {
            type: "valid",
          },
          invalid: {
            type: "invalid",
          },
        },
      },
      { abortEarly: false }
    )

    const err = findErrorByContextLabel(result.error, "tasks.invalid.type")

    expect(err.type).toEqual("any.only")
    expect(err.context.valids).toEqual(["valid"])
  })

  test("correct task config schema is used for correct task type in built schema", () => {
    const tasks = [
      {
        id: "foo",
        getConfigSchema: () => ({
          bar: Joi.string().required(),
        }),
      },
      {
        id: "bar",
        getConfigSchema: () => ({
          baz: Joi.string().required(),
        }),
      },
    ]
    const schema = buildSchema(tasks)
    const result = schema.validate(
      {
        name: "test config",
        tasks: {
          foo: {
            type: "foo",
          },
          bar: {
            type: "bar",
          },
        },
      },
      { abortEarly: false }
    )

    const fooTaskErr = findErrorByContextLabel(result.error, "tasks.foo.bar")
    expect(fooTaskErr.type).toEqual("any.required")

    const barTaskErr = findErrorByContextLabel(result.error, "tasks.bar.baz")
    expect(barTaskErr.type).toEqual("any.required")
  })

  test("task does not have to provide config schema if not needed", () => {
    const tasks = [
      {
        id: "foo",
      },
    ]
    const schema = buildSchema(tasks)
    const result = schema.validate(
      {
        name: "test config",
        tasks: {
          foo: {
            type: "foo",
          },
        },
      },
      { abortEarly: false }
    )

    expect(result.error).toBeUndefined()
  })
})
