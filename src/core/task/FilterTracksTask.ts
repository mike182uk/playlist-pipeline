import Joi from "joi"

import type {
  ExecuteOptions,
  Task,
  TaskConfig,
  TaskConfigSchema,
} from "../task"
import type { Track, TrackCollection } from "../track"

interface FilterDefinition {
  operator: string
  value: string | number | boolean
}

type ShorthandFilterDefinition = string | number | boolean

type AnyFilterDefinition = FilterDefinition | ShorthandFilterDefinition

type FilterTracksTaskConfigFilter = Record<
  string,
  AnyFilterDefinition | Array<AnyFilterDefinition>
>

export interface FilterTracksTaskConfig extends TaskConfig {
  tracks: string
  filter: FilterTracksTaskConfigFilter[] | FilterTracksTaskConfigFilter
}

type FilterTracksTaskExecuteOptions = ExecuteOptions<FilterTracksTaskConfig> & {
  trackCollections: Record<string, TrackCollection>
}

export const OPERATOR_EQUALS = "eq"
export const OPERATOR_NOT_EQUALS = "neq"
export const OPERATOR_GREATER_THAN = "gt"
export const OPERATOR_GREATER_THAN_OR_EQUAL_TO = "gte"
export const OPERATOR_LESS_THAN = "lt"
export const OPERATOR_LESS_THAN_OR_EQUAL_TO = "lte"
const SHORTHAND_OPERATOR_MAP = {
  "": OPERATOR_EQUALS,
  "=": OPERATOR_EQUALS,
  "!": OPERATOR_NOT_EQUALS,
  "!=": OPERATOR_NOT_EQUALS,
  ">": OPERATOR_GREATER_THAN,
  "<": OPERATOR_LESS_THAN,
  ">=": OPERATOR_GREATER_THAN_OR_EQUAL_TO,
  "<=": OPERATOR_LESS_THAN_OR_EQUAL_TO,
}
const SHORTHAND_OPERATOR_IN_VALUE_RE = /^([!><]?=?)\s*(.*)/

export default class FilterTracksTask
  implements
    Task<
      FilterTracksTaskConfig,
      FilterTracksTaskExecuteOptions,
      TrackCollection
    >
{
  public readonly id = "tracks.filter"

  public getConfigSchema(): TaskConfigSchema<FilterTracksTaskConfig> {
    const stringFieldSchema = Joi.alternatives(
      Joi.array().items(
        Joi.alternatives(
          Joi.object().keys({
            operator: Joi.string().valid(OPERATOR_EQUALS, OPERATOR_NOT_EQUALS),
            value: Joi.string(),
          }),
          Joi.string()
        )
      ),
      Joi.object().keys({
        operator: Joi.string().valid(OPERATOR_EQUALS, OPERATOR_NOT_EQUALS),
        value: Joi.string(),
      }),
      Joi.string()
    )

    const numberFieldSchema = Joi.alternatives(
      Joi.array().items(
        Joi.alternatives(
          Joi.object().keys({
            operator: Joi.string().valid(
              OPERATOR_EQUALS,
              OPERATOR_NOT_EQUALS,
              OPERATOR_GREATER_THAN,
              OPERATOR_GREATER_THAN_OR_EQUAL_TO,
              OPERATOR_LESS_THAN,
              OPERATOR_LESS_THAN_OR_EQUAL_TO
            ),
            value: Joi.number(),
          }),
          Joi.number(),
          Joi.string()
        )
      ),
      Joi.object().keys({
        operator: Joi.string().valid(
          OPERATOR_EQUALS,
          OPERATOR_NOT_EQUALS,
          OPERATOR_GREATER_THAN,
          OPERATOR_GREATER_THAN_OR_EQUAL_TO,
          OPERATOR_LESS_THAN,
          OPERATOR_LESS_THAN_OR_EQUAL_TO
        ),
        value: Joi.number(),
      }),
      Joi.number(),
      Joi.string()
    )

    const booleanFieldSchema = Joi.alternatives(
      Joi.object().keys({
        operator: Joi.string().valid(OPERATOR_EQUALS, OPERATOR_NOT_EQUALS),
        value: Joi.boolean(),
      }),
      Joi.boolean()
    )

    const dateFieldSchema = Joi.alternatives(
      Joi.array().items(
        Joi.alternatives(
          Joi.object().keys({
            operator: Joi.string().valid(
              OPERATOR_GREATER_THAN,
              OPERATOR_LESS_THAN
            ),
            value: Joi.number(),
          }),
          Joi.string()
        )
      ),
      Joi.object().keys({
        operator: Joi.string().valid(OPERATOR_GREATER_THAN, OPERATOR_LESS_THAN),
        value: Joi.number(),
      }),
      Joi.string()
    )

    const fieldsSchema = Joi.object()
      .keys({
        album: stringFieldSchema,
        artist: stringFieldSchema,
        name: stringFieldSchema,
        trackNumber: numberFieldSchema,
        genre: stringFieldSchema,
        explicit: booleanFieldSchema,
        popularity: numberFieldSchema,
        duration: numberFieldSchema,
        releaseDate: dateFieldSchema,
        releaseYear: numberFieldSchema,
      })
      .required()

    return {
      tracks: Joi.string().required(),
      filter: Joi.alternatives(
        fieldsSchema,
        Joi.array().items(fieldsSchema)
      ).required(),
    }
  }

  public async execute({
    config,
    trackCollections,
  }: FilterTracksTaskExecuteOptions): Promise<TrackCollection> {
    const tracks = trackCollections[config.tracks]

    if (tracks === undefined) {
      throw new Error(`"${config.tracks}" is not a valid track source`)
    }

    const doFilter = (filter, track: Track) => {
      // Assume everything is ok until a filter does not match
      let ok = true

      // Flatten the filter definitions
      const filterDefs: [string, AnyFilterDefinition][] = []

      for (const fieldName of Object.keys(filter)) {
        const filterDef = filter[fieldName]

        if (Array.isArray(filterDef)) {
          for (const def of filterDef) {
            filterDefs.push([fieldName, def])
          }
        } else {
          filterDefs.push([fieldName, filterDef])
        }
      }

      for (const [fieldName, filterDef] of filterDefs) {
        // If previous filter did not match, return early
        if (ok === false) return false

        let operator: string
        let filterValue: string | number | boolean | Date | FilterDefinition
        let fieldValue = track[fieldName]

        // Check the value to see if it includes a shorthand operator
        if (typeof filterDef === "string") {
          const shorthandOperatorInValueResult = filterDef.match(
            SHORTHAND_OPERATOR_IN_VALUE_RE
          )

          // @TODO: Do something with this null
          if (shorthandOperatorInValueResult === null) {
            return false
          }

          operator =
            SHORTHAND_OPERATOR_MAP[shorthandOperatorInValueResult[1].trim()]
          filterValue = shorthandOperatorInValueResult[2]

          // If value is numeric, it is likely this operator was being used
          // for a numeric value so cast the value to a number
          if (/\D/.test(filterValue) === false) {
            filterValue = Number(filterValue)
          }
          // Check the value to see if it is a boolean or number primitive
        } else if (["boolean", "number"].includes(typeof filterDef)) {
          operator = OPERATOR_EQUALS
          filterValue = filterDef
          // Assume the value is a valid object
        } else {
          operator = (filterDef as FilterDefinition).operator
          filterValue = (filterDef as FilterDefinition).value
        }

        // Match string values case insensitively
        if (["album", "artist", "name", "genre"].includes(fieldName)) {
          filterValue = String(filterValue).toLowerCase()
          fieldValue = Array.isArray(fieldValue)
            ? fieldValue.map((v) => v.toLowerCase())
            : fieldValue.toLowerCase()
        }

        if (fieldName === "releaseDate") {
          filterValue = new Date(String(filterValue))
        }

        switch (operator) {
          case OPERATOR_EQUALS:
            if (Array.isArray(fieldValue)) {
              ok = fieldValue.includes(filterValue)
            } else {
              ok = fieldValue === filterValue
            }
            break
          case OPERATOR_NOT_EQUALS:
            if (Array.isArray(fieldValue)) {
              ok = fieldValue.includes(filterValue) === false
            } else {
              ok = fieldValue !== filterValue
            }
            break
          case OPERATOR_GREATER_THAN:
            ok = Number(fieldValue) > Number(filterValue)
            break
          case OPERATOR_GREATER_THAN_OR_EQUAL_TO:
            ok = Number(fieldValue) >= Number(filterValue)
            break
          case OPERATOR_LESS_THAN:
            ok = Number(fieldValue) < Number(filterValue)
            break
          case OPERATOR_LESS_THAN_OR_EQUAL_TO:
            ok = Number(fieldValue) <= Number(filterValue)
            break
        }
      }

      return ok
    }

    return tracks.filter((track) => {
      const filters =
        Array.isArray(config.filter) === false ? [config.filter] : config.filter

      let ok = false

      for (const filter of filters) {
        // If previous field filter did match, return early
        if (ok === true) return true

        ok = doFilter(filter, track)
      }

      return ok
    })
  }
}
