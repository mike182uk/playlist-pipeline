jest.mock('../spotify/utils')

const { when, verifyAllWhenMocksCalled } = require('jest-when')
const { id, execute } = require('./getLibraryTracks')
const {
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
  decorateTracksWithAudioFeatures,
  LIMIT_GET_LIBRARY_TRACKS,
  normaliseTrack
} = require('../spotify/utils')

test('has correct id', () => {
  expect(id).toBe('library.get_tracks')
})

describe('execute', () => {
  test('retrieves the library tracks', async () => {
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
      getMySavedTracks: jest.fn()
    }
    const spotifyGetMySavedTracksBindSpy = jest.spyOn(spotify.getMySavedTracks, 'bind')

    when(getTracksRecursively)
      .calledWith(
        expect.any(Function),
        LIMIT_GET_LIBRARY_TRACKS,
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
      execute({ spotify })
    ).resolves.toEqual(normalisedTracks)

    // Assert all mocks were called
    verifyAllWhenMocksCalled()

    // Assert spotify.getMySavedTracks.bind is called with the correct arg
    expect(spotifyGetMySavedTracksBindSpy).toHaveBeenCalledWith(spotify)

    // Assert the getTracksRecursively resolveTracks arg is valid
    const data = { items: [] }
    expect(getTracksRecursively.mock.calls[0][2](data)).toEqual(data.items)

    // Assert the getTracksRecursively resolvePaginationMeta arg is valid
    const paginationMeta = { next: 'https://next.page' }
    expect(getTracksRecursively.mock.calls[0][3](paginationMeta)).toEqual(paginationMeta)
  })

  test('throws an error if the library tracks can not be retrieved', async () => {
    const err = new Error('foo bar baz')
    const spotify = {
      getMySavedTracks: jest.fn()
    }

    when(getTracksRecursively)
      .calledWith(
        expect.any(Function),
        LIMIT_GET_LIBRARY_TRACKS,
        expect.any(Function),
        expect.any(Function)
      )
      .mockRejectedValue(err)

    await expect(
      execute({ spotify })
    ).rejects.toThrow(err.message)

    verifyAllWhenMocksCalled()
  })
})
