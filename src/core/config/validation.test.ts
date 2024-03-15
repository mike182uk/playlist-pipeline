import Joi from "joi"
import { describe, expect, test } from "vitest"
import { findErrorByContextLabel } from "../test/validation"
import { buildSchema } from "./validation"

import type { Task } from "../task"

describe("buildSchema", () => {
  test(".name is required in built schema", () => {
    const schema = buildSchema([])
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "name")

    expect(err?.type).toEqual("any.required")
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

    expect(err?.type).toEqual("string.base")
  })

  test(".tasks is required in built schema", () => {
    const schema = buildSchema([])
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, "tasks")

    expect(err?.type).toEqual("any.required")
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

    expect(err?.type).toEqual("object.base")
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

    expect(err?.type).toEqual("object.base")
  })

  test("only known task types are allowed in built schema", () => {
    class ValidTask implements Task<Record<string, unknown>, void> {
      id = "valid"
      getConfigSchema() {
        return {}
      }
      execute() {
        return Promise.resolve()
      }
    }

    const schema = buildSchema([new ValidTask()])
    const result = schema.validate(
      {
        tasks: {
          execute_valid_task: {
            type: "valid",
          },
          execute_invalid_task: {
            type: "invalid",
          },
        },
      },
      { abortEarly: false }
    )

    const err = findErrorByContextLabel(
      result.error,
      "tasks.execute_invalid_task.type"
    )

    expect(err?.type).toEqual("any.only")
    expect(err?.context?.valids).toEqual(["valid"])
  })

  test("correct task config schema is used for correct task type in built schema", () => {
    class FooTask implements Task<Record<string, unknown>, void> {
      id = "foo"
      getConfigSchema() {
        return {
          bar: Joi.string().required(),
        }
      }
      execute() {
        return Promise.resolve()
      }
    }

    class BarTask implements Task<Record<string, unknown>, void> {
      id = "bar"
      getConfigSchema() {
        return {
          baz: Joi.string().required(),
        }
      }
      execute() {
        return Promise.resolve()
      }
    }

    const schema = buildSchema([new FooTask(), new BarTask()])
    const result = schema.validate(
      {
        name: "test config",
        tasks: {
          execute_foo_task: {
            type: "foo",
          },
          execute_bar_task: {
            type: "bar",
          },
        },
      },
      { abortEarly: false }
    )

    const fooTaskErr = findErrorByContextLabel(
      result.error,
      "tasks.execute_foo_task.bar"
    )
    expect(fooTaskErr?.type).toEqual("any.required")

    const barTaskErr = findErrorByContextLabel(
      result.error,
      "tasks.execute_bar_task.baz"
    )
    expect(barTaskErr?.type).toEqual("any.required")
  })
})
