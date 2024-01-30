// jest.mock('fs')

import Joi from 'joi'
import { findErrorByContextLabel } from '../test/validationUtils.js'
import {
  id,
  getConfigSchema,
  execute,
  FORMAT_JSON
} from './exportTracks.js'
import { writeFile } from 'node:fs'

test('has correct id', () => {
  expect(id).toBe('tracks.export')
})

describe('getConfigSchema', () => {
  const schema = Joi.object(getConfigSchema())

  test('.tracks is required in the config schema', () => {
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'tracks')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.required')
  })

  test('.tracks must be a string in the config schema', () => {
    const result = schema.validate({
      tracks: []
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'tracks')

    expect(err).toBeDefined()
    expect(err.type).toEqual('string.base')
  })

  test('.format is required in the config schema', () => {
    const result = schema.validate({
      tracks: 'foo'
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'format')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.required')
  })

  test('.format is a valid string in the config schema', () => {
    const result = schema.validate({
      tracks: 'foo',
      format: 'csv'
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'format')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.only')
    expect(err.context.valids).toEqual([FORMAT_JSON])
  })

  test('.fields is required in the config schema', () => {
    const result = schema.validate({
      tracks: 'foo',
      format: FORMAT_JSON
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'fields')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.required')
  })

  test('.fields contains a valid string in the config schema', () => {
    const result = schema.validate({
      tracks: 'foo',
      format: FORMAT_JSON,
      fields: ['foo']
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'fields[0]')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.only')
    expect(err.context.valids).toEqual([
      'id',
      'name',
      'trackNumber',
      'album',
      'albumId',
      'albumUri',
      'releaseDate',
      'releaseYear',
      'artist',
      'artistId',
      'artistUri',
      'uri',
      'genre',
      'popularity',
      'duration',
      'explicit'
    ])
  })

  test('.filename is required in the config schema', () => {
    const result = schema.validate({
      tracks: 'foo',
      format: FORMAT_JSON,
      fields: ['artist', 'name']
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'filename')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.required')
  })

  test('.filename must be a string in the config schema', () => {
    const result = schema.validate({
      tracks: 'foo',
      format: FORMAT_JSON,
      fields: ['artist', 'name'],
      filename: []
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'filename')

    expect(err).toBeDefined()
    expect(err.type).toEqual('string.base')
  })
})

xdescribe('execute', () => {
  test('exports tracks to file', async () => {
    const trackCollectionName = 'foo'
    const tracks = [
      { id: 'foo', artist: 'artist 1', name: 'artist 1 album 1 track 1' },
      { id: 'bar', artist: 'artist 1', name: 'artist 1 album 1 track 2' }
    ]
    const trackCollections = {
      [trackCollectionName]: tracks
    }
    const filename = 'foo'
    const config = {
      tracks: trackCollectionName,
      format: FORMAT_JSON,
      fields: ['artist', 'name'],
      filename
    }
    const expectedFilename = `${filename}.json`
    const expectedFileContents = `[
  {
    "artist": "artist 1",
    "name": "artist 1 album 1 track 1"
  },
  {
    "artist": "artist 1",
    "name": "artist 1 album 1 track 2"
  }
]`

    writeFile.mockImplementation((filename, fileContents, cb) => cb())

    await execute({ config, trackCollections })

    expect(writeFile).toHaveBeenCalledTimes(1)
    expect(writeFile).toHaveBeenLastCalledWith(expectedFilename, expectedFileContents, expect.any(Function))
  })

  test('throws an error if an invalid track source is provided in the config', async () => {
    const trackCollectionName = 'foo'

    await expect(
      execute({
        config: {
          tracks: trackCollectionName
        },
        trackCollections: {}
      })
    ).rejects.toThrow(`"${trackCollectionName}" is not a valid track source`)
  })

  test('throws an error if an error occurred whilst exporting to file', async () => {
    const trackCollectionName = 'foo'
    const err = new Error('foo bar baz')

    writeFile.mockImplementation((filename, fileContents, cb) => cb(err))

    await expect(
      execute({
        config: {
          tracks: trackCollectionName,
          format: FORMAT_JSON,
          fields: ['artist', 'name'],
          filename: 'bar'
        },
        trackCollections: {
          [trackCollectionName]: []
        }
      })
    ).rejects.toThrow(err.message)
  })
})
