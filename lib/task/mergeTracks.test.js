const Joi = require('joi')
const { findErrorByContextLabel } = require('../test/validationUtils')
const { id, getConfigSchema, execute } = require('./mergeTracks')

test('has correct id', () => {
  expect(id).toBe('tracks.merge')
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

  test('.tracks must be an array of strings in the config schema', () => {
    const result = schema.validate({
      tracks: ['foo', 123]
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'tracks[1]')

    expect(err).toBeDefined()
    expect(err.type).toEqual('string.base')
  })
})

describe('execute', () => {
  test('returns an array containing tracks from all of the provided track sources', async () => {
    const trackCollection1Name = 'foo'
    const trackCollection2Name = 'bar'

    const mergedTracks = await execute({
      config: {
        tracks: [
          trackCollection1Name,
          trackCollection2Name
        ]
      },
      trackCollections: {
        [trackCollection1Name]: [
          { name: 'foo' },
          { name: 'bar' }
        ],
        [trackCollection2Name]: [
          { name: 'baz' },
          { name: 'qux' }
        ]
      }
    })

    expect(mergedTracks).toEqual([
      { name: 'foo' },
      { name: 'bar' },
      { name: 'baz' },
      { name: 'qux' }
    ])
  })

  test('throws an error if an invalid track source is provided in the config', async () => {
    const trackCollectionName = 'foo'

    await expect(
      execute({
        config: {
          tracks: [
            trackCollectionName
          ]
        },
        trackCollections: {}
      })
    ).rejects.toThrow(`"${trackCollectionName}" is not a valid track source`)
  })
})
