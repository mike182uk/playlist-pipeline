const Joi = require('joi')
const { findErrorByContextLabel } = require('../test/validationUtils')
const { id, getConfigSchema, execute } = require('./updatePlaylistDescription')

test('has correct id', () => {
  expect(id).toBe('playlist.update_description')
})

describe('getConfigSchema', () => {
  const schema = Joi.object(getConfigSchema())

  test('.spotify_url is required in config schema', () => {
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'spotify_url')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.required')
  })

  test('.spotify_url must be a string in config schema', () => {
    const result = schema.validate({
      spotify_url: {}
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'spotify_url')

    expect(err).toBeDefined()
    expect(err.type).toEqual('string.base')
  })

  test('.description is required in the config schema', () => {
    const result = schema.validate({
      spotify_url: 'https://open.spotify.com/playlist/abc123'
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'description')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.required')
  })

  test('.description must be a string in the config schema', () => {
    const result = schema.validate({
      spotify_url: 'https://open.spotify.com/playlist/abc123',
      description: []
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'description')

    expect(err).toBeDefined()
    expect(err.type).toEqual('string.base')
  })
})

describe('execute', () => {
  test('updates the description of a playlist', async () => {
    const playlistId = 'abc123'
    const description = 'foo bar baz'
    const spotifyChangePlaylistDetailsStub = jest.fn().mockResolvedValue()

    await execute({
      config: {
        spotify_url: 'https://open.spotify.com/playlist/abc123',
        description
      },
      spotify: {
        changePlaylistDetails: spotifyChangePlaylistDetailsStub
      }
    })

    expect(spotifyChangePlaylistDetailsStub).toHaveBeenCalledTimes(1)
    expect(spotifyChangePlaylistDetailsStub).toHaveBeenCalledWith(playlistId, { description })
  })

  test('throws an error if the playlist description can not be updated', async () => {
    const description = 'foo bar baz'
    const err = new Error('failed to update playlist description')
    const spotifyChangePlaylistDetailsStub = jest.fn().mockRejectedValue(err)

    await expect(
      execute({
        config: {
          spotify_url: 'https://open.spotify.com/playlist/abc123',
          description
        },
        spotify: {
          changePlaylistDetails: spotifyChangePlaylistDetailsStub
        }
      })
    ).rejects.toThrow('an error occurred updating playlist description: failed to update playlist description')
  })
})
