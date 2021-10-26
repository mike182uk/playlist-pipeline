const {
  extractIDFromURL,
  getTracksRecursively,
  decorateTrackArtistsWithGenres,
  decorateTracksWithAudioFeatures,
  normaliseTrack,
  LIMIT_GET_ARTISTS,
  LIMIT_GET_TRACKS_AUDIO_FEATURES
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
      }
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
      }
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
      }
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
      }
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

  test('throws an error if provided limit is too high', async () => {
    await expect(
      decorateTrackArtistsWithGenres([], {}, LIMIT_GET_ARTISTS + 1)
    ).rejects.toThrow(`only ${LIMIT_GET_ARTISTS} artists can be retrieved at a time`)
  })
})

describe('decorateTracksWithAudioFeatures', () => {
  test('decorates tracks with their audio features', async () => {
    const track1Id = 'track_1'
    const track2Id = 'track_2'
    const track3Id = 'track_3'
    const tracks = [
      {
        artists: [
          {
            id: 'artist_1',
            name: 'artist 1'
          }
        ],
        album: 'artist 1 album 1',
        name: 'artist 1 album 1 track 1',
        id: track1Id
      },
      {
        artists: [
          {
            id: 'artist_1',
            name: 'artist 1'
          }
        ],
        album: 'artist 1 album 1',
        name: 'artist 1 album 1 track 2',
        id: track2Id
      },
      {
        artists: [
          {
            id: 'artist_1',
            name: 'artist 1'
          }
        ],
        album: 'artist 1 album 1',
        name: 'artist 1 album 1 track 3',
        id: track3Id
      }
    ]
    const spotifyGetAudioFeaturesForTracksResultPage1 = {
      body: {
        audio_features: [
          {
            id: track1Id,
            acousticness: 0.01,
            danceability: 0.02,
            energy: 0.03,
            instrumentalness: 0.04,
            key: 0.05,
            liveness: 0.06,
            loudness: 0.07,
            mode: 0.08,
            speechiness: 0.09,
            tempo: 0.10,
            time_signature: 0.11,
            valence: 0.12
          },
          {
            id: track2Id,
            acousticness: 0.01,
            danceability: 0.02,
            energy: 0.03,
            instrumentalness: 0.04,
            key: 0.05,
            liveness: 0.06,
            loudness: 0.07,
            mode: 0.08,
            speechiness: 0.09,
            tempo: 0.10,
            time_signature: 0.11,
            valence: 0.12
          }
        ]
      }
    }
    const spotifyGetAudioFeaturesForTracksResultPage2 = {
      body: {
        audio_features: [
          {
            id: track3Id,
            acousticness: 0.01,
            danceability: 0.02,
            energy: 0.03,
            instrumentalness: 0.04,
            key: 0.05,
            liveness: 0.06,
            loudness: 0.07,
            mode: 0.08,
            speechiness: 0.09,
            tempo: 0.10,
            time_signature: 0.11,
            valence: 0.12
          }
        ]
      }
    }
    const spotifyStub = {
      getAudioFeaturesForTracks: jest.fn()
        .mockResolvedValueOnce(spotifyGetAudioFeaturesForTracksResultPage1)
        .mockResolvedValueOnce(spotifyGetAudioFeaturesForTracksResultPage2)
    }

    await expect(
      decorateTracksWithAudioFeatures(
        tracks,
        spotifyStub,
        2
      )
    ).resolves.toEqual([
      {
        artists: [
          {
            id: 'artist_1',
            name: 'artist 1'
          }
        ],
        album: 'artist 1 album 1',
        name: 'artist 1 album 1 track 1',
        id: track1Id,
        audio_features: {
          acousticness: 0.01,
          danceability: 0.02,
          energy: 0.03,
          instrumentalness: 0.04,
          key: 0.05,
          liveness: 0.06,
          loudness: 0.07,
          mode: 0.08,
          speechiness: 0.09,
          tempo: 0.10,
          time_signature: 0.11,
          valence: 0.12
        }
      },
      {
        artists: [
          {
            id: 'artist_1',
            name: 'artist 1'
          }
        ],
        album: 'artist 1 album 1',
        name: 'artist 1 album 1 track 2',
        id: track2Id,
        audio_features: {
          acousticness: 0.01,
          danceability: 0.02,
          energy: 0.03,
          instrumentalness: 0.04,
          key: 0.05,
          liveness: 0.06,
          loudness: 0.07,
          mode: 0.08,
          speechiness: 0.09,
          tempo: 0.10,
          time_signature: 0.11,
          valence: 0.12
        }
      },
      {
        artists: [
          {
            id: 'artist_1',
            name: 'artist 1'
          }
        ],
        album: 'artist 1 album 1',
        name: 'artist 1 album 1 track 3',
        id: track3Id,
        audio_features: {
          acousticness: 0.01,
          danceability: 0.02,
          energy: 0.03,
          instrumentalness: 0.04,
          key: 0.05,
          liveness: 0.06,
          loudness: 0.07,
          mode: 0.08,
          speechiness: 0.09,
          tempo: 0.10,
          time_signature: 0.11,
          valence: 0.12
        }
      }
    ])

    expect(spotifyStub.getAudioFeaturesForTracks).toHaveBeenCalledTimes(2)
    expect(spotifyStub.getAudioFeaturesForTracks).toHaveBeenCalledWith([track1Id, track2Id])
    expect(spotifyStub.getAudioFeaturesForTracks).toHaveBeenCalledWith([track3Id])
  })

  test('throws an error if provided limit is too high', async () => {
    await expect(
      decorateTracksWithAudioFeatures([], {}, LIMIT_GET_TRACKS_AUDIO_FEATURES + 1)
    ).rejects.toThrow(`only ${LIMIT_GET_TRACKS_AUDIO_FEATURES} track audio features can be retrieved at a time`)
  })
})

describe('normaliseTrack', () => {
  test('normalises track', () => {
    const track = {
      id: 'id',
      name: 'name',
      track_number: 123,
      album: {
        id: 'album id',
        name: 'album name',
        release_date: '2003-01-01',
        uri: 'album uri'
      },
      artists: [
        {
          id: 'artist id',
          name: 'artist name',
          genres: [
            'genre 1',
            'genre 2',
            'genre 3'
          ],
          uri: 'artist uri'
        }
      ],
      uri: 'uri',
      popularity: 456,
      duration_ms: 789,
      explicit: false,
      audio_features: {
        acousticness: 0.01,
        danceability: 0.02,
        energy: 0.03,
        instrumentalness: 0.04,
        key: 0.05,
        liveness: 0.06,
        loudness: 0.07,
        mode: 0.08,
        speechiness: 0.09,
        tempo: 0.10,
        time_signature: 0.11,
        valence: 0.12
      }
    }
    const expectedNormalisedTrack = {
      id: 'id',
      name: 'name',
      trackNumber: 123,
      album: 'album name',
      albumId: 'album id',
      albumUri: 'album uri',
      releaseDate: new Date(2003, 0, 1),
      artist: 'artist name',
      artistId: 'artist id',
      artistUri: 'artist uri',
      uri: 'uri',
      genre: [
        'genre 1',
        'genre 2',
        'genre 3'
      ],
      popularity: 456,
      duration: 789,
      explicit: false,
      acousticness: 0.01,
      danceability: 0.02,
      energy: 0.03,
      instrumentalness: 0.04,
      key: 0.05,
      liveness: 0.06,
      loudness: 0.07,
      mode: 0.08,
      speechiness: 0.09,
      tempo: 0.10,
      timeSignature: 0.11,
      valence: 0.12
    }

    expect(normaliseTrack(track)).toEqual(expectedNormalisedTrack)
  })
})
