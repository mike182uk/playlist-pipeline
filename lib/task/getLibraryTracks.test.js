jest.mock('../spotify/utils')

const { id, execute } = require('./getLibraryTracks')
const {
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
  LIMIT_GET_LIBRARY_TRACKS
} = require('../spotify/utils')

test('has correct id', () => {
  expect(id).toBe('library.get_tracks')
})

describe('execute', () => {
  test('retrieves the library tracks', async () => {
    const getTracksRecursivelyResult = [
      {
        id: 'foo',
        name: 'bar',
        track_number: 123,
        album: {
          name: 'baz',
          release_date: '2005-01-01'
        },
        artists: [
          {
            name: 'qux'
          }
        ],
        uri: 'spotify:track:abc789',
        popularity: 456,
        duration_ms: 789,
        explicit: false
      },
      {
        id: 'qux',
        name: 'baz',
        track_number: 987,
        album: {
          name: 'bar',
          release_date: '2010-10-01'
        },
        artists: [
          {
            name: 'foo'
          }
        ],
        uri: 'spotify:track:abc123',
        popularity: 654,
        duration_ms: 321,
        explicit: false
      }
    ]
    const decorateTracksWithArtistGenresResult = [
      {
        id: 'foo',
        name: 'bar',
        track_number: 123,
        album: {
          name: 'baz',
          release_date: '2005-01-01'
        },
        artists: [
          {
            name: 'qux',
            genres: ['foo', 'bar']
          }
        ],
        uri: 'spotify:track:abc789',
        popularity: 456,
        duration_ms: 789,
        explicit: false
      },
      {
        id: 'qux',
        name: 'baz',
        track_number: 987,
        album: {
          name: 'bar',
          release_date: '2010-10-01'
        },
        artists: [
          {
            name: 'foo',
            genres: ['bar', 'baz']
          }
        ],
        uri: 'spotify:track:abc123',
        popularity: 654,
        duration_ms: 321,
        explicit: false
      }
    ]

    getTracksRecursively.mockImplementation(() => Promise.resolve(getTracksRecursivelyResult))
    decorateTrackArtistsWithGenres.mockImplementation(() => Promise.resolve(decorateTracksWithArtistGenresResult))

    const spotify = {
      getMySavedTracks: jest.fn()
    }
    const spotifyGetMySavedTracksBindSpy = jest.spyOn(spotify.getMySavedTracks, 'bind')

    // Assert result is correct
    await expect(
      execute({ spotify })
    ).resolves.toEqual([
      {
        id: 'foo',
        name: 'bar',
        trackNumber: 123,
        album: 'baz',
        releaseDate: new Date('2005-01-01'),
        artist: 'qux',
        uri: 'spotify:track:abc789',
        genre: ['foo', 'bar'],
        popularity: 456,
        duration: 789,
        explicit: false
      },
      {
        id: 'qux',
        name: 'baz',
        trackNumber: 987,
        album: 'bar',
        releaseDate: new Date('2010-10-01'),
        artist: 'foo',
        uri: 'spotify:track:abc123',
        genre: ['bar', 'baz'],
        popularity: 654,
        duration: 321,
        explicit: false
      }
    ])

    // Assert getTracksRecursively is called with the correct args
    expect(getTracksRecursively).toHaveBeenCalledTimes(1)
    expect(getTracksRecursively).toHaveBeenCalledWith(
      expect.any(Function),
      LIMIT_GET_LIBRARY_TRACKS,
      expect.any(Function),
      expect.any(Function)
    )

    // Assert spotify.getMySavedTracks.bind is called with the correct arg
    expect(spotifyGetMySavedTracksBindSpy).toHaveBeenCalledWith(spotify)

    // Assert decorateTracksWithArtistGenres is called with the correct arg
    expect(decorateTrackArtistsWithGenres).toBeCalledWith(getTracksRecursivelyResult, spotify)

    // Assert the getTracksRecursively resolveTracks arg is valid
    const data = { items: [] }
    expect(getTracksRecursively.mock.calls[0][2](data)).toEqual(data.items)

    // Assert the getTracksRecursively resolvePaginationMeta arg is valid
    const paginationMeta = { next: 'https://next.page' }
    expect(getTracksRecursively.mock.calls[0][3](paginationMeta)).toEqual(paginationMeta)
  })

  test('throws an error if the library tracks can not be retrieved', async () => {
    const err = new Error('foo bar baz')

    getTracksRecursively.mockImplementation(() => { throw err })

    const spotify = {
      getMySavedTracks: jest.fn()
    }

    await expect(
      execute({ spotify })
    ).rejects.toThrow(err.message)
  })
})
