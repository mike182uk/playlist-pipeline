// jest.mock('../spotify/utils')
import { jest } from '@jest/globals'
import { when, verifyAllWhenMocksCalled } from 'jest-when'
import { id, execute } from './getLibraryTracks.js'
import {
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
  LIMIT_GET_LIBRARY_TRACKS,
  normaliseTrack
} from '../spotify/utils.js'

test('has correct id', () => {
  expect(id).toBe('library.get_tracks')
})

xdescribe('execute', () => {
  test('retrieves the library tracks', async () => {
    const getTracksRecursivelyResult = [
      { id: 'foo', artists: [{ name: 'baz' }] },
      { id: 'bar', artists: [{ name: 'qux' }] }
    ]
    const decorateTracksWithArtistGenresResult = [
      { id: 'foo', artists: [{ name: 'artist 1', genres: ['punk'] }] },
      { id: 'bar', artists: [{ name: 'artist 1', genres: ['punk'] }] }
    ]
    const normalisedTracks = [
      { id: 'foo', artist: 'baz', genres: ['punk'] },
      { id: 'bar', artist: 'qux', genres: ['punk'] }
    ]
    const spotify = {
      getMySavedTracks: jest.fn()
    }
    const ctx = {
      retrieveArtistGenreDetails: true
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

    when(normaliseTrack)
      .calledWith(decorateTracksWithArtistGenresResult[0])
      .mockReturnValue(normalisedTracks[0])

    when(normaliseTrack)
      .calledWith(decorateTracksWithArtistGenresResult[1])
      .mockReturnValue(normalisedTracks[1])

    // Assert result is correct
    await expect(
      execute({ spotify, ctx })
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

  test('does not retrieve artist genre details if not required', async () => {
    const getTracksRecursivelyResult = [
      { id: 'foo', artists: [{ name: 'baz' }] },
      { id: 'bar', artists: [{ name: 'qux' }] }
    ]
    const normalisedTracks = [
      { id: 'foo', artist: 'baz' },
      { id: 'bar', artist: 'qux' }
    ]
    const spotify = {
      getMySavedTracks: jest.fn()
    }
    const ctx = {
      retrieveArtistGenreDetails: false
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

    when(normaliseTrack)
      .calledWith(getTracksRecursivelyResult[0])
      .mockReturnValue(normalisedTracks[0])

    when(normaliseTrack)
      .calledWith(getTracksRecursivelyResult[1])
      .mockReturnValue(normalisedTracks[1])

    // Assert result is correct
    await expect(
      execute({ spotify, ctx })
    ).resolves.toEqual(normalisedTracks)

    // Assert all mocks were called
    verifyAllWhenMocksCalled()

    // Assert decorateTrackArtistsWithGenres was not called
    expect(decorateTrackArtistsWithGenres).toHaveBeenCalledTimes(0)

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
    const ctx = {
      retrieveArtistGenreDetails: true
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
      execute({ spotify, ctx })
    ).rejects.toThrow(err.message)

    verifyAllWhenMocksCalled()
  })
})
