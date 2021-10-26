jest.mock('../spotify/utils')

const { when, verifyAllWhenMocksCalled } = require('jest-when')
const Joi = require('joi')
const { findErrorByContextLabel } = require('../test/validationUtils')
const { id, getConfigSchema, execute } = require('./getPlaylistTracks')
const {
  extractIDFromURL,
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
  decorateTracksWithAudioFeatures,
  normaliseTrack,
  LIMIT_GET_PLAYLISTS_TRACKS
} = require('../spotify/utils')

test('has correct id', () => {
  expect(id).toBe('playlist.get_tracks')
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
})

describe('execute', () => {
  test('retrieves the playlist tracks', async () => {
    const config = {
      spotify_url: 'https://open.spotify.com/playlist/abc123'
    }
    const playlistId = 'abc123'
    const getTracksRecursivelyResult = [
      {
        id: 'foo',
        artists: [{ name: 'artist 1' }]
      },
      {
        id: 'bar',
        artists: [{ name: 'artist 1' }]
      }
    ]
    const decorateTracksWithArtistGenresResult = [
      {
        id: 'foo',
        artists: [{ name: 'artist 1', genres: ['punk'] }]
      },
      {
        id: 'bar',
        artists: [{ name: 'artist 1', genres: ['punk'] }]
      }
    ]
    const decorateTracksWithAudioFeaturesResult = [
      {
        id: 'foo',
        artists: [{ name: 'artist 1', genres: ['punk'] }],
        audio_features: { loudness: 0.5 }
      },
      {
        id: 'bar',
        artists: [{ name: 'artist 1', genres: ['punk'] }],
        audio_features: { loudness: 0.6 }
      }
    ]
    const normalisedTracks = [
      {
        id: 'foo',
        artist: 'baz',
        album: 'artist 1 album 1',
        genres: ['punk'],
        loudness: 0.5
      },
      {
        id: 'bar',
        artist: 'qux',
        album: 'artist 1 album 1',
        genres: ['punk'],
        loudness: 0.8
      }
    ]
    const spotify = {
      getPlaylistTracks: jest.fn()
    }
    const spotifyGetPlaylistBindSpy = jest.spyOn(spotify.getPlaylistTracks, 'bind')

    when(extractIDFromURL)
      .calledWith(config.spotify_url)
      .mockReturnValue(playlistId)

    when(getTracksRecursively)
      .calledWith(
        expect.any(Function),
        LIMIT_GET_PLAYLISTS_TRACKS,
        expect.any(Function),
        expect.any(Function)
      )
      .mockResolvedValue(getTracksRecursivelyResult)

    when(decorateTrackArtistsWithGenres)
      .calledWith(
        getTracksRecursivelyResult,
        spotify
      )
      .mockResolvedValue(decorateTracksWithArtistGenresResult)

    when(decorateTracksWithAudioFeatures)
      .calledWith(
        decorateTracksWithArtistGenresResult,
        spotify
      )
      .mockResolvedValue(decorateTracksWithAudioFeaturesResult)

    when(normaliseTrack)
      .calledWith(decorateTracksWithAudioFeaturesResult[0])
      .mockReturnValue(normalisedTracks[0])

    when(normaliseTrack)
      .calledWith(decorateTracksWithAudioFeaturesResult[1])
      .mockReturnValue(normalisedTracks[1])

    // Assert result is correct
    await expect(
      execute({ config, spotify })
    ).resolves.toEqual(normalisedTracks)

    // Assert all mocks were called
    verifyAllWhenMocksCalled()

    // Assert spotify.getPlaylist.bind is called with the correct args
    expect(spotifyGetPlaylistBindSpy).toHaveBeenCalledWith(spotify, playlistId)

    // Assert the getTracksRecursively resolveTracks arg is valid
    const data = { items: [] }
    expect(getTracksRecursively.mock.calls[0][2](data)).toEqual(data.items)

    // Assert the getTracksRecursively resolvePaginationMeta arg is valid
    const paginationMeta = { next: 'https://next.page' }
    expect(getTracksRecursively.mock.calls[0][3](paginationMeta)).toEqual(paginationMeta)
  })

  test('throws an error if the playlist tracks can not be retrieved', async () => {
    const config = {
      spotify_url: 'https://open.spotify.com/playlist/abc123'
    }
    const spotify = {
      getPlaylistTracks: jest.fn()
    }
    const playlistId = 'abc123'
    const err = new Error('foo bar baz')

    when(extractIDFromURL)
      .calledWith(config.spotify_url)
      .mockReturnValue(playlistId)

    when(getTracksRecursively)
      .calledWith(
        expect.any(Function),
        LIMIT_GET_PLAYLISTS_TRACKS,
        expect.any(Function),
        expect.any(Function)
      )
      .mockRejectedValue(err)

    await expect(
      execute({ config, spotify })
    ).rejects.toThrow(err.message)

    verifyAllWhenMocksCalled()
  })
})
