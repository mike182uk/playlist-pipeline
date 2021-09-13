jest.mock('../util/spotify')

const Joi = require('joi')
const { findErrorByContextLabel } = require('../test/validationUtils')
const { id, getConfigSchema, execute } = require('./getAlbumTracks')
const {
  extractIDFromURL,
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
  LIMIT_GET_ALBUM_TRACKS
} = require('../util/spotify')

test('has correct id', () => {
  expect(id).toBe('album.get_tracks')
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
  test('retrieves the album tracks', async () => {
    const config = {
      spotify_url: 'https://open.spotify.com/album/abc123'
    }
    const albumId = 'abc123'
    const spotifyGetAlbumResult = {
      body: {
        name: 'artist 1 album 1',
        release_date: 2005
      },
      statusCode: 200
    }
    const getTracksRecursivelyResult = [
      {
        id: 'track_1',
        name: 'track 1',
        track_number: 1,
        artists: [
          {
            name: 'artist 1'
          }
        ],
        uri: 'spotify:track:track_1'
      },
      {
        id: 'track_2',
        name: 'track 2',
        track_number: 2,
        artists: [
          {
            name: 'artist 1'
          }
        ],
        uri: 'spotify:track:track_2'
      }
    ]
    const decorateTracksWithArtistGenresResult = [
      {
        id: 'track_1',
        name: 'track 1',
        track_number: 1,
        artists: [
          {
            name: 'artist 1',
            genres: ['foo', 'bar']
          }
        ],
        uri: 'spotify:track:track_1'
      },
      {
        id: 'track_2',
        name: 'track 2',
        track_number: 2,
        artists: [
          {
            name: 'artist 1',
            genres: ['foo', 'bar']
          }
        ],
        uri: 'spotify:track:track_2'
      }
    ]

    const spotify = {
      getAlbum: jest.fn().mockResolvedValue(spotifyGetAlbumResult),
      getAlbumTracks: jest.fn()
    }

    const spotifyGetMySavedTracksBindSpy = jest.spyOn(spotify.getAlbumTracks, 'bind')

    getTracksRecursively.mockImplementation(() => Promise.resolve(getTracksRecursivelyResult))
    extractIDFromURL.mockImplementation(() => albumId)
    decorateTrackArtistsWithGenres.mockImplementation(() => Promise.resolve(decorateTracksWithArtistGenresResult))

    // Assert result is correct
    await expect(
      execute({ config, spotify })
    ).resolves.toEqual([
      {
        id: 'track_1',
        name: 'track 1',
        trackNumber: 1,
        album: 'artist 1 album 1',
        releaseDate: 2005,
        artist: 'artist 1',
        uri: 'spotify:track:track_1',
        genre: ['foo', 'bar']
      },
      {
        id: 'track_2',
        name: 'track 2',
        trackNumber: 2,
        album: 'artist 1 album 1',
        releaseDate: 2005,
        artist: 'artist 1',
        uri: 'spotify:track:track_2',
        genre: ['foo', 'bar']
      }
    ])

    // Assert extractIDFromURL is called with the correct arg
    expect(extractIDFromURL).toHaveBeenCalledWith(config.spotify_url)

    // Assert spotify.getAlbum is called with the correct args
    expect(spotify.getAlbum).toHaveBeenCalledWith(albumId)

    // Assert getTracksRecursively is called with the correct args
    expect(getTracksRecursively).toHaveBeenCalledTimes(1)
    expect(getTracksRecursively).toHaveBeenCalledWith(
      expect.any(Function),
      LIMIT_GET_ALBUM_TRACKS,
      expect.any(Function),
      expect.any(Function)
    )
    // Assert spotify.getAlbumTracks.bind is called with the correct arg
    expect(spotifyGetMySavedTracksBindSpy).toHaveBeenCalledWith(spotify, albumId)

    // Assert decorateTracksWithArtistGenres is called with the correct arg
    expect(decorateTrackArtistsWithGenres).toBeCalledWith(
      getTracksRecursivelyResult,
      spotify
    )

    // Assert the getTracksRecursively resolveTracks arg is valid
    const data = { items: [] }
    expect(getTracksRecursively.mock.calls[0][2](data)).toEqual(data.items)

    // Assert the getTracksRecursively resolvePaginationMeta arg is valid
    const paginationMeta = { next: 'https://next.page' }
    expect(getTracksRecursively.mock.calls[0][3](paginationMeta)).toEqual(paginationMeta)
  })

  test('throws an error if the album details can not be retrieved', async () => {
    const config = {
      spotify_url: 'https://open.spotify.com/album/abc123'
    }

    const spotify = {
      getAlbum: jest.fn().mockResolvedValue({
        body: {},
        statusCode: 500
      }),
      getAlbumTracks: jest.fn()
    }

    await expect(
      execute({ config, spotify })
    ).rejects.toThrow('Invalid status code returned')
  })

  test('throws an error if the album tracks can not be retrieved', async () => {
    const config = {
      spotify_url: 'https://open.spotify.com/album/abc123'
    }
    const albumId = 'abc123'
    const err = new Error('foo bar baz')

    const spotify = {
      getAlbum: jest.fn().mockResolvedValue({
        body: {},
        statusCode: 200
      }),
      getAlbumTracks: jest.fn()
    }

    getTracksRecursively.mockImplementation(() => { throw err })
    extractIDFromURL.mockImplementation(() => albumId)

    await expect(
      execute({ config, spotify })
    ).rejects.toThrow(err.message)
  })
})
