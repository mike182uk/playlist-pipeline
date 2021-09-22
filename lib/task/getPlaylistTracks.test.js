jest.mock('../spotify/utils')

const Joi = require('joi')
const { findErrorByContextLabel } = require('../test/validationUtils')
const { id, getConfigSchema, execute } = require('./getPlaylistTracks')
const {
  extractIDFromURL,
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
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
        name: 'bar',
        track_number: 123,
        album: {
          name: 'baz',
          release_date: 456
        },
        artists: [
          {
            name: 'qux'
          }
        ],
        uri: 'spotify:track:abc789'
      },
      {
        id: 'qux',
        name: 'baz',
        track_number: 789,
        album: {
          name: 'bar',
          release_date: 456
        },
        artists: [
          {
            name: 'foo'
          }
        ],
        uri: 'spotify:track:abc123'
      }
    ]
    const decorateTracksWithArtistGenresResult = [
      {
        id: 'foo',
        name: 'bar',
        track_number: 123,
        album: {
          name: 'baz',
          release_date: 456
        },
        artists: [
          {
            name: 'qux',
            genres: ['foo', 'bar']
          }
        ],
        uri: 'spotify:track:abc789'
      },
      {
        id: 'qux',
        name: 'baz',
        track_number: 789,
        album: {
          name: 'bar',
          release_date: 456
        },
        artists: [
          {
            name: 'foo',
            genres: ['bar', 'baz']
          }
        ],
        uri: 'spotify:track:abc123'
      }
    ]

    getTracksRecursively.mockImplementation(() => Promise.resolve(getTracksRecursivelyResult))
    extractIDFromURL.mockImplementation(() => playlistId)
    decorateTrackArtistsWithGenres.mockImplementation(() => Promise.resolve(decorateTracksWithArtistGenresResult))

    const spotify = {
      getPlaylistTracks: jest.fn()
    }
    const spotifyGetPlaylistBindSpy = jest.spyOn(spotify.getPlaylistTracks, 'bind')

    // Assert result is correct
    await expect(
      execute({ config, spotify })
    ).resolves.toEqual([
      {
        id: 'foo',
        name: 'bar',
        trackNumber: 123,
        album: 'baz',
        releaseDate: 456,
        artist: 'qux',
        uri: 'spotify:track:abc789',
        genre: ['foo', 'bar']
      },
      {
        id: 'qux',
        name: 'baz',
        trackNumber: 789,
        album: 'bar',
        releaseDate: 456,
        artist: 'foo',
        uri: 'spotify:track:abc123',
        genre: ['bar', 'baz']
      }
    ])

    // Assert getTracksRecursively is called with the correct args
    expect(getTracksRecursively).toHaveBeenCalledTimes(1)
    expect(getTracksRecursively).toHaveBeenCalledWith(
      expect.any(Function),
      LIMIT_GET_PLAYLISTS_TRACKS,
      expect.any(Function),
      expect.any(Function)
    )

    // Assert extractIDFromURL is called with the correct arg
    expect(extractIDFromURL).toHaveBeenCalledWith(config.spotify_url)

    // Assert spotify.getPlaylist.bind is called with the correct args
    expect(spotifyGetPlaylistBindSpy).toHaveBeenCalledWith(spotify, playlistId)

    // Assert decorateTracksWithArtistGenres is called with the correct arg
    expect(decorateTrackArtistsWithGenres).toBeCalledWith(getTracksRecursivelyResult, spotify)

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
    const playlistId = 'abc123'
    const err = new Error('foo bar baz')

    getTracksRecursively.mockImplementation(() => { throw err })
    extractIDFromURL.mockImplementation(() => playlistId)

    const spotify = {
      getPlaylistTracks: jest.fn()
    }

    await expect(
      execute({ config, spotify })
    ).rejects.toThrow(err.message)
  })
})
