const {
  extractIDFromURL,
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
  LIMIT_GET_ARTISTS
} = require('./utils')

describe('extractIDFromURL', () => {
  test('extracts an ID from the URL', () => {
    expect(
      extractIDFromURL('https://open.spotify.com/playlist/37i9dQZF1DX1ewVhAJ17m4?si=cdf89e38e99e4078')
    ).toEqual('37i9dQZF1DX1ewVhAJ17m4')
  })
})

describe('getTracksRecursively', () => {
  test('recursively gets tracks', async () => {
    const getTracksResultPage1 = {
      body: {
        items: [
          {
            track: {
              artist: 'artist 1',
              album: 'artist 1 album 1',
              name: 'artist 1 album 1 track 1'
            }
          },
          {
            track: {
              artist: 'artist 1',
              album: 'artist 1 album 2',
              name: 'artist 1 album 2 track 1'
            }
          }
        ],
        meta: {
          next: 'https://next.page'
        }
      },
      statusCode: 200
    }
    const getTracksResultPage2 = {
      body: {
        items: [
          {
            track: {
              artist: 'artist 2',
              album: 'artist 2 album 1',
              name: 'artist 2 album 1 track 1'
            }
          },
          {
            track: {
              artist: 'artist 2',
              album: 'artist 2 album 2',
              name: 'artist 2 album 2 track 1'
            }
          }
        ],
        meta: {
          next: null
        }
      },
      statusCode: 200
    }
    const getTracksStub = jest.fn()
      .mockResolvedValueOnce(getTracksResultPage1)
      .mockResolvedValueOnce(getTracksResultPage2)
    const limit = 123
    const resolveTracks = (data) => data.items
    const resolvePaginationMeta = (data) => data.meta

    await expect(
      getTracksRecursively(
        getTracksStub,
        limit,
        resolveTracks,
        resolvePaginationMeta
      )
    ).resolves.toEqual([
      {
        artist: 'artist 1',
        album: 'artist 1 album 1',
        name: 'artist 1 album 1 track 1'
      },
      {
        artist: 'artist 1',
        album: 'artist 1 album 2',
        name: 'artist 1 album 2 track 1'
      },
      {
        artist: 'artist 2',
        album: 'artist 2 album 1',
        name: 'artist 2 album 1 track 1'
      },
      {
        artist: 'artist 2',
        album: 'artist 2 album 2',
        name: 'artist 2 album 2 track 1'
      }
    ])

    expect(getTracksStub).toHaveBeenCalledTimes(2)
    expect(getTracksStub).toHaveBeenCalledWith({
      limit: limit,
      offset: 0
    })
    expect(getTracksStub).toHaveBeenCalledWith({
      limit: limit,
      offset: limit
    })
  })

  test('throws an error if a request fails', async () => {
    const getTracksResult = {
      body: {},
      statusCode: 500
    }
    const getTracksStub = jest.fn().mockResolvedValue(getTracksResult)
    const limit = 123
    const resolveTracks = jest.fn()
    const resolvePaginationMeta = jest.fn()

    await expect(
      getTracksRecursively(
        getTracksStub,
        limit,
        resolveTracks,
        resolvePaginationMeta
      )
    ).rejects.toThrow('Invalid status code returned')
  })
})

describe('decorateTracksWithArtistGenres', () => {
  test('decorates artists with their genres', async () => {
    const artist1Id = 'artist_1'
    const artist2Id = 'artist_2'
    const artist3Id = 'artist_3'
    const tracks = [
      {
        artists: [
          {
            id: artist1Id,
            name: 'artist 1'
          }
        ],
        album: 'artist 1 album 1',
        name: 'artist 1 album 1 track 1'
      },
      {
        artists: [
          {
            id: artist1Id,
            name: 'artist 1'
          },
          {
            id: artist3Id,
            name: 'artist 3'
          }
        ],
        album: 'artist 1 album 2',
        name: 'artist 1 album 2 track 1'
      },
      {
        artists: [
          {
            id: artist2Id,
            name: 'artist 2'
          }
        ],
        album: 'artist 2 album 1',
        name: 'artist 2 album 1 track 1'
      },
      {
        artists: [
          {
            id: artist2Id,
            name: 'artist 2'
          }
        ],
        album: 'artist 2 album 2',
        name: 'artist 2 album 2 track 1'
      }
    ]
    const spotifyGetArtistsResultPage1 = {
      body: {
        artists: [
          {
            id: artist1Id,
            name: 'artist 1',
            genres: ['foo', 'bar']
          },
          {
            id: artist3Id,
            name: 'artist 3',
            genres: ['baz', 'qux']
          }
        ]
      },
      statusCode: 200
    }
    const spotifyGetArtistsResultPage2 = {
      body: {
        artists: [
          {
            id: artist2Id,
            name: 'artist 2',
            genres: ['bar', 'baz']
          }
        ]
      },
      statusCode: 200
    }
    const spotifyStub = {
      getArtists: jest.fn()
        .mockResolvedValueOnce(spotifyGetArtistsResultPage1)
        .mockResolvedValueOnce(spotifyGetArtistsResultPage2)
    }

    await expect(
      decorateTrackArtistsWithGenres(
        tracks,
        spotifyStub,
        2
      )
    ).resolves.toEqual([
      {
        artists: [
          {
            id: artist1Id,
            name: 'artist 1',
            genres: ['foo', 'bar']
          }
        ],
        album: 'artist 1 album 1',
        name: 'artist 1 album 1 track 1'
      },
      {
        artists: [
          {
            id: artist1Id,
            name: 'artist 1',
            genres: ['foo', 'bar']
          },
          {
            id: artist3Id,
            name: 'artist 3',
            genres: ['baz', 'qux']
          }
        ],
        album: 'artist 1 album 2',
        name: 'artist 1 album 2 track 1'
      },
      {
        artists: [
          {
            id: artist2Id,
            name: 'artist 2',
            genres: ['bar', 'baz']
          }
        ],
        album: 'artist 2 album 1',
        name: 'artist 2 album 1 track 1'
      },
      {
        artists: [
          {
            id: artist2Id,
            name: 'artist 2',
            genres: ['bar', 'baz']
          }
        ],
        album: 'artist 2 album 2',
        name: 'artist 2 album 2 track 1'
      }
    ])

    expect(spotifyStub.getArtists).toHaveBeenCalledTimes(2)
    expect(spotifyStub.getArtists).toHaveBeenCalledWith([artist1Id, artist3Id])
    expect(spotifyStub.getArtists).toHaveBeenCalledWith([artist2Id])
  })

  test('throws an error if a request fails', async () => {
    const getArtistsResult = {
      body: {},
      statusCode: 500
    }
    const spotifyStub = {
      getArtists: jest.fn().mockResolvedValue(getArtistsResult)
    }

    await expect(
      decorateTrackArtistsWithGenres(
        [
          {
            artists: [
              {
                id: 'artist_1',
                name: 'artist 1'
              }
            ],
            album: 'artist 1 album 1',
            name: 'artist 1 album 1 track 1'
          }
        ],
        spotifyStub
      )
    ).rejects.toThrow('Invalid status code returned')
  })

  test('throws an error if provided limit is too high', async () => {
    await expect(
      decorateTrackArtistsWithGenres([], {}, LIMIT_GET_ARTISTS + 1)
    ).rejects.toThrow(`Only ${LIMIT_GET_ARTISTS} artists can be retrieved at a time`)
  })
})
