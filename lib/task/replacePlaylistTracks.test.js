import { jest } from '@jest/globals'
import Joi from 'joi'
import { findErrorByContextLabel } from '../test/validationUtils.js'
import { id, getConfigSchema, execute } from './replacePlaylistTracks.js'

test('has correct id', () => {
  expect(id).toBe('playlist.replace_tracks')
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

  test('.tracks is required in config schema', () => {
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'tracks')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.required')
  })

  test('.tracks must be a string in config schema', () => {
    const result = schema.validate({
      tracks: {}
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'tracks')

    expect(err).toBeDefined()
    expect(err.type).toEqual('string.base')
  })
})

describe('execute', () => {
  it('replaces the tracks in a playlist', async () => {
    const trackCollectionName = 'foo'
    const playlistId = 'abc123'
    const spotifyReplaceTracksInPlaylistStub = jest.fn().mockResolvedValue({
      statusCode: 201
    })
    const spotifyAddTracksToPlaylistStub = jest.fn().mockResolvedValue({
      statusCode: 201
    })

    await execute({
      config: {
        spotify_url: 'https://open.spotify.com/playlist/abc123',
        tracks: trackCollectionName
      },
      spotify: {
        replaceTracksInPlaylist: spotifyReplaceTracksInPlaylistStub,
        addTracksToPlaylist: spotifyAddTracksToPlaylistStub
      },
      trackCollections: {
        [trackCollectionName]: [
          { uri: 'abc123' },
          { uri: 'abc456' }
        ]
      }
    })

    expect(spotifyReplaceTracksInPlaylistStub).toHaveBeenCalledTimes(1)
    expect(spotifyReplaceTracksInPlaylistStub).toHaveBeenCalledWith(playlistId, [])
    expect(spotifyAddTracksToPlaylistStub).toHaveBeenCalledTimes(1)
    expect(spotifyAddTracksToPlaylistStub).toHaveBeenCalledWith(playlistId, [
      'abc123',
      'abc456'
    ])

    // TODO - Test tracks are added recursively
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

  it('throws an error if the tracks in the playlist could not be cleared', async () => {
    const trackCollectionName = 'foo'
    const spotifyReplaceTracksInPlaylistStub = jest.fn().mockResolvedValue({
      statusCode: 500
    })

    await expect(
      execute({
        config: {
          spotify_url: 'https://open.spotify.com/playlist/abc123',
          tracks: trackCollectionName
        },
        spotify: {
          replaceTracksInPlaylist: spotifyReplaceTracksInPlaylistStub
        },
        trackCollections: {
          [trackCollectionName]: [
            { uri: 'abc123' },
            { uri: 'abc456' }
          ]
        }
      })
    ).rejects.toThrow('unexpected status code returned (500) whilst clearing tracks in playlist')
  })

  it('throws an error if the tracks can not be added to the playlist', async () => {
    const trackCollectionName = 'foo'
    const spotifyReplaceTracksInPlaylistStub = jest.fn().mockResolvedValue({
      statusCode: 201
    })
    const spotifyAddTracksToPlaylistStub = jest.fn().mockResolvedValue({
      statusCode: 500
    })

    await expect(
      execute({
        config: {
          spotify_url: 'https://open.spotify.com/playlist/abc123',
          tracks: trackCollectionName
        },
        spotify: {
          replaceTracksInPlaylist: spotifyReplaceTracksInPlaylistStub,
          addTracksToPlaylist: spotifyAddTracksToPlaylistStub
        },
        trackCollections: {
          [trackCollectionName]: [
            { uri: 'abc123' },
            { uri: 'abc456' }
          ]
        }
      })
    ).rejects.toThrow('unexpected status code returned (500) whilst replacing tracks in playlist')
  })
})
