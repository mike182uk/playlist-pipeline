const Joi = require('joi')
const { findErrorByContextLabel } = require('../test/validationUtils')
const { id, getConfigSchema, execute } = require('./filterTracks')

test('has correct id', () => {
  expect(id).toBe('tracks.filter')
})

describe('getConfigSchema', () => {
  const schema = Joi.object(getConfigSchema())

  test('.tracks is required in the config schema', () => {
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'tracks')

    expect(err.type).toEqual('any.required')
  })

  test('.tracks must be a string in the config schema', () => {
    const result = schema.validate({
      tracks: []
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'tracks')

    expect(err.type).toEqual('string.base')
  })

  test('.filter is required in the config schema', () => {
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'filter')

    expect(err.type).toEqual('any.required')
  })

  test('.filter is valid in the config schema', () => {
    const result = schema.validate({
      filter: 'foo'
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'filter')

    expect(err).toBeDefined()
    expect(err.type).toEqual('alternatives.types')

    // TODO: Find a better way to test for alternative types here
  })

  test('.filter.album is a valid in the config schema', () => {
    const result = schema.validate({
      tracks: 'foo',
      filter: {
        album: {}
      }
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'filter.album')

    expect(err).toBeDefined()
    expect(err.type).toEqual('alternatives.types')

    // TODO: Find a better way to test for alternative types here
  })

  test('.filter.artist is valid in the config schema', () => {
    const result = schema.validate({
      tracks: 'foo',
      filter: {
        artist: {}
      }
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'filter.artist')

    expect(err).toBeDefined()
    expect(err.type).toEqual('alternatives.types')

    // TODO: Find a better way to test for alternative types here
  })

  test('.filter.name is a valid in the config schema', () => {
    const result = schema.validate({
      tracks: 'foo',
      filter: {
        name: {}
      }
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'filter.name')

    expect(err).toBeDefined()
    expect(err.type).toEqual('alternatives.types')

    // TODO: Find a better way to test for alternative types here
  })

  test('.filter.trackNumber is a valid in the config schema', () => {
    const result = schema.validate({
      tracks: 'foo',
      filter: {
        trackNumber: {}
      }
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'filter.trackNumber')

    expect(err).toBeDefined()
    expect(err.type).toEqual('alternatives.types')

    // TODO: Find a better way to test for alternative types here
  })

  test('.filter.genre is a valid in the config schema', () => {
    const result = schema.validate({
      tracks: 'foo',
      filter: {
        genre: {}
      }
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'filter.genre')

    expect(err).toBeDefined()
    expect(err.type).toEqual('alternatives.types')

    // TODO: Find a better way to test for alternative types here
  })

  test('.filter.explicit must be a boolean in the config schema', () => {
    const result = schema.validate({
      tracks: 'foo',
      filter: {
        explicit: {}
      }
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'filter.explicit')

    expect(err.type).toEqual('boolean.base')
  })
})

describe('execute', () => {
  describe('returns an array of filtered tracks based on the filter provided in the config', () => {
    const trackCollectionName = 'foo'
    const tracks = [
      {
        artist: 'artist 1',
        album: 'artist 1 album 1',
        name: 'artist 1 album 1 track 1',
        trackNumber: 1,
        genre: ['pop', 'rock'],
        explicit: false
      },
      {
        artist: 'artist 1',
        album: 'artist 1 album 2',
        name: 'artist 1 album 2 track 1',
        trackNumber: 1,
        genre: ['pop', 'rock'],
        explicit: false
      },
      {
        artist: 'artist 2',
        album: 'artist 2 album 1',
        name: 'artist 2 album 1 track 1',
        trackNumber: 1,
        genre: ['rock'],
        explicit: false
      },
      {
        artist: 'artist 2',
        album: 'artist 2 album 2',
        name: 'artist 2 album 2 track 1',
        trackNumber: 1,
        genre: ['rock'],
        explicit: true
      },
      {
        artist: 'artist 3',
        album: 'artist 3 album 1',
        name: 'artist 3 album 1 track 1',
        trackNumber: 1,
        genre: ['punk', 'metal'],
        explicit: false
      },
      {
        artist: 'artist 3',
        album: 'artist 3 album 1',
        name: 'artist 3 album 1 track 2',
        trackNumber: 2,
        genre: ['punk', 'metal'],
        explicit: false
      },
      {
        artist: 'artist 3',
        album: 'artist 3 album 2',
        name: 'artist 3 album 2 track 1',
        trackNumber: 1,
        genre: ['punk', 'metal'],
        explicit: true
      }
    ]

    test('filters case insensitively by single album', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            album: 'ARTist 2 aLBum 2'
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[3]
      ])
    })

    test('filters case insensitively by multiple albums', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            album: [
              'ARTist 3 aLBum 1',
              'ARTist 3 aLBum 2'
            ]
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[4],
        tracks[5],
        tracks[6]
      ])
    })

    test('filters case insensitively by single artist', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            artist: 'ARTist 1'
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[0],
        tracks[1]
      ])
    })

    test('filters case insensitively by multiple artists', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            artist: [
              'ARTist 1',
              'ARTist 2'
            ]
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[0],
        tracks[1],
        tracks[2],
        tracks[3]
      ])
    })

    test('filters case insensitively by single name', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            name: 'ARTist 1 aLBum 2 track 1'
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[1]
      ])
    })

    test('filters case insensitively by multiple names', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            name: [
              'ARTist 1 aLBum 2 track 1',
              'ARTist 2 aLBum 2 track 1'
            ]
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[1],
        tracks[3]
      ])
    })

    test('filters by single track number', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            trackNumber: 1
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[0],
        tracks[1],
        tracks[2],
        tracks[3],
        tracks[4],
        tracks[6]
      ])
    })

    test('filters by multiple track numbers', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            trackNumber: [1, 2]
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[0],
        tracks[1],
        tracks[2],
        tracks[3],
        tracks[4],
        tracks[5],
        tracks[6]
      ])
    })

    test('filters case insensitively by single genre', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            genre: 'PunK'
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[4],
        tracks[5],
        tracks[6]
      ])
    })

    test('filters case insensitively by multiple genres', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            genre: ['POp', 'pUNk']
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[0],
        tracks[1],
        tracks[4],
        tracks[5],
        tracks[6]
      ])
    })

    test('filters by explicit', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            explicit: true
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[3],
        tracks[6]
      ])
    })

    test('filters by non explicit', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            explicit: false
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[0],
        tracks[1],
        tracks[2],
        tracks[4],
        tracks[5]
      ])
    })

    test('filters by multiple fields with multiple values', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            artist: ['artist 1', 'artist 2'],
            album: ['artist 1 album 2', 'artist 2 album 2']
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[1],
        tracks[3]
      ])
    })

    test('filters by multiple filters', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: [
            { artist: 'artist 1' },
            { artist: 'artist 2', album: 'artist 2 album 2' }
          ]
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[0],
        tracks[1],
        tracks[3]
      ])
    })

    test('filters by multiple filters with multiple field values', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: [
            { artist: ['artist 1', 'artist 2'] },
            { artist: 'artist 3', album: 'artist 3 album 2' }
          ]
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[0],
        tracks[1],
        tracks[2],
        tracks[3],
        tracks[6]
      ])
    })
  })

  test('throws an error if an invalid track source is provided in the config', async () => {
    const trackCollectionName = 'foo'

    await expect(
      execute({
        config: {
          tracks: trackCollectionName
        },
        trackCollections: {}
      })
    ).rejects.toThrow(`"${trackCollectionName}" is not a valid track source`)
  })
})
