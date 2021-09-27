const Joi = require('joi')
const { findErrorByContextLabel } = require('../test/validationUtils')
const {
  id,
  getConfigSchema,
  execute,
  OPERATOR_EQUALS,
  OPERATOR_NOT_EQUALS,
  OPERATOR_GREATER_THAN,
  OPERATOR_GREATER_THAN_OR_EQUAL_TO,
  OPERATOR_LESS_THAN,
  OPERATOR_LESS_THAN_OR_EQUAL_TO
} = require('./filterTracks')

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

    // TODO: Find a better way to test this
  })

  // TODO: Find a nice way to test schema for individual properties
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
        explicit: false,
        popularity: 50,
        duration: 200100,
        releaseDate: new Date('2003-01-01')
      },
      {
        artist: 'artist 1',
        album: 'artist 1 album 2',
        name: 'artist 1 album 2 track 1',
        trackNumber: 2,
        genre: ['pop', 'rock'],
        explicit: false,
        popularity: 70,
        duration: 100100,
        releaseDate: new Date('2004-01-01')
      },
      {
        artist: 'artist 2',
        album: 'artist 2 album 1',
        name: 'artist 2 album 1 track 1',
        trackNumber: 1,
        genre: ['rock'],
        explicit: false,
        popularity: 48,
        duration: 212105,
        releaseDate: new Date('2003-01-01')
      },
      {
        artist: 'artist 2',
        album: 'artist 2 album 2',
        name: 'artist 2 album 2 track 1',
        trackNumber: 2,
        genre: ['rock'],
        explicit: true,
        popularity: 30,
        duration: 99155,
        releaseDate: new Date('2005-01-01')
      },
      {
        artist: 'artist 3',
        album: 'artist 3 album 1',
        name: 'artist 3 album 1 track 1',
        trackNumber: 1,
        genre: ['punk', 'metal'],
        explicit: false,
        popularity: 65,
        duration: 210450,
        releaseDate: new Date('2006-01-01')
      },
      {
        artist: 'artist 3',
        album: 'artist 3 album 1',
        name: 'artist 3 album 1 track 2',
        trackNumber: 2,
        genre: ['punk', 'metal'],
        explicit: false,
        popularity: 12,
        duration: 121560,
        releaseDate: new Date('2006-01-01')
      },
      {
        artist: 'artist 3',
        album: 'artist 3 album 2',
        name: 'artist 3 album 2 track 1',
        trackNumber: 3,
        genre: ['punk', 'metal'],
        explicit: true,
        popularity: 90,
        duration: 100500,
        releaseDate: new Date('2008-01-01')
      }
    ]

    test('filters by album equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            album: {
              operator: OPERATOR_EQUALS,
              value: 'artist 2 album 2'
            }
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

    test('filters by album equals case insensitively', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            album: {
              operator: OPERATOR_EQUALS,
              value: 'ARTist 2 aLBum 2'
            }
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

    test('filters by album not equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            album: {
              operator: OPERATOR_NOT_EQUALS,
              value: 'artist 2 album 2'
            }
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
        tracks[5],
        tracks[6]
      ])
    })

    test('filters by artist equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            artist: {
              operator: OPERATOR_EQUALS,
              value: 'artist 1'
            }
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

    test('filters by artist equals case insensitively', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            artist: {
              operator: OPERATOR_EQUALS,
              value: 'ARTist 1'
            }
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

    test('filters by artist not equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            artist: {
              operator: OPERATOR_NOT_EQUALS,
              value: 'artist 1'
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[2],
        tracks[3],
        tracks[4],
        tracks[5],
        tracks[6]
      ])
    })

    test('filters by name equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            name: {
              operator: OPERATOR_EQUALS,
              value: 'artist 1 album 2 track 1'
            }
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

    test('filters by name equals case insensitively', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            name: {
              operator: OPERATOR_EQUALS,
              value: 'ARTist 1 aLBum 2 track 1'
            }
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

    test('filters by name not equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            name: {
              operator: OPERATOR_NOT_EQUALS,
              value: 'artist 1 album 2 track 1'
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[0],
        tracks[2],
        tracks[3],
        tracks[4],
        tracks[5],
        tracks[6]
      ])
    })

    test('filters by track number equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            trackNumber: {
              operator: OPERATOR_EQUALS,
              value: 1
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[0],
        tracks[2],
        tracks[4]
      ])
    })

    test('filters by track number not equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            trackNumber: {
              operator: OPERATOR_NOT_EQUALS,
              value: 1
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[1],
        tracks[3],
        tracks[5],
        tracks[6]
      ])
    })

    test('filters by track number greater than', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            trackNumber: {
              operator: OPERATOR_GREATER_THAN,
              value: 1
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[1],
        tracks[3],
        tracks[5],
        tracks[6]
      ])
    })

    test('filters by track number greater than or equal to', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            trackNumber: {
              operator: OPERATOR_GREATER_THAN_OR_EQUAL_TO,
              value: 1
            }
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

    test('filters by track number less than', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            trackNumber: {
              operator: OPERATOR_LESS_THAN,
              value: 2
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[0],
        tracks[2],
        tracks[4]
      ])
    })

    test('filters by track number less than or equal to', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            trackNumber: {
              operator: OPERATOR_LESS_THAN_OR_EQUAL_TO,
              value: 2
            }
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
        tracks[5]
      ])
    })

    test('filters by genre equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            genre: {
              operator: OPERATOR_EQUALS,
              value: 'punk'
            }
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

    test('filters by genre equals case insensitively', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            genre: {
              operator: OPERATOR_EQUALS,
              value: 'PunK'
            }
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

    test('filters by genre not equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            genre: {
              operator: OPERATOR_NOT_EQUALS,
              value: 'punk'
            }
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

    test('filters by explicit equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            explicit: {
              operator: OPERATOR_EQUALS,
              value: true
            }
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

    test('filters by explicit not equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            explicit: {
              operator: OPERATOR_NOT_EQUALS,
              value: true
            }
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

    test('filters by popularity equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            popularity: {
              operator: OPERATOR_EQUALS,
              value: 90
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[6]
      ])
    })

    test('filters by popularity not equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            popularity: {
              operator: OPERATOR_NOT_EQUALS,
              value: 90
            }
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
        tracks[5]
      ])
    })

    test('filters by popularity greater than', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            popularity: {
              operator: OPERATOR_GREATER_THAN,
              value: 50
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[1],
        tracks[4],
        tracks[6]
      ])
    })

    test('filters by popularity greater than or equal to', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            popularity: {
              operator: OPERATOR_GREATER_THAN_OR_EQUAL_TO,
              value: 50
            }
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
        tracks[6]
      ])
    })

    test('filters by popularity less than', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            popularity: {
              operator: OPERATOR_LESS_THAN,
              value: 50
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[2],
        tracks[3],
        tracks[5]
      ])
    })

    test('filters by popularity less than or equal to', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            popularity: {
              operator: OPERATOR_LESS_THAN_OR_EQUAL_TO,
              value: 50
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[0],
        tracks[2],
        tracks[3],
        tracks[5]
      ])
    })

    test('filters by duration equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            duration: {
              operator: OPERATOR_EQUALS,
              value: 200100
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[0]
      ])
    })

    test('filters by duration not equals', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            duration: {
              operator: OPERATOR_NOT_EQUALS,
              value: 200100
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[1],
        tracks[2],
        tracks[3],
        tracks[4],
        tracks[5],
        tracks[6]
      ])
    })

    test('filters by duration greater than', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            duration: {
              operator: OPERATOR_GREATER_THAN,
              value: 200100
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[2],
        tracks[4]
      ])
    })

    test('filters by duration greater than or equal to', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            duration: {
              operator: OPERATOR_GREATER_THAN_OR_EQUAL_TO,
              value: 200100
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[0],
        tracks[2],
        tracks[4]
      ])
    })

    test('filters by duration less than', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            duration: {
              operator: OPERATOR_LESS_THAN,
              value: 100500
            }
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

    test('filters by duration less than or equal to', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            duration: {
              operator: OPERATOR_LESS_THAN_OR_EQUAL_TO,
              value: 100500
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[1],
        tracks[3],
        tracks[6]
      ])
    })

    test('filters by releaseDate greater than', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            releaseDate: {
              operator: OPERATOR_GREATER_THAN,
              value: '2006'
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[6]
      ])
    })

    test('filters by releaseDate less than', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            releaseDate: {
              operator: OPERATOR_LESS_THAN,
              value: '2006'
            }
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

    test('filters by multiple fields', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            artist: {
              operator: OPERATOR_EQUALS,
              value: 'artist 2'
            },
            explicit: {
              operator: OPERATOR_EQUALS,
              value: false
            }
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[2]
      ])
    })

    test('filters by multiple filters', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: [
            {
              artist: {
                operator: OPERATOR_EQUALS,
                value: 'artist 1'
              },
              trackNumber: {
                operator: OPERATOR_GREATER_THAN,
                value: 1
              }
            },
            {
              artist: {
                operator: OPERATOR_EQUALS,
                value: 'artist 2'
              }
            }
          ]
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[1],
        tracks[2],
        tracks[3]
      ])
    })

    test('filters by string field equals shorthand', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            album: 'artist 2 album 2'
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

    test('filters by string field not equals shorthand', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            album: '!artist 2 album 2'
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
        tracks[5],
        tracks[6]
      ])
    })

    test('filters by boolean field equals shorthand', async () => {
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

    test('filters by number field equals shorthand', async () => {
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
        tracks[2],
        tracks[4]
      ])
    })

    test('filters by number field not equals shorthand', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            trackNumber: '!1'
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[1],
        tracks[3],
        tracks[5],
        tracks[6]
      ])
    })

    test('filters by number field greater than shorthand', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            trackNumber: '>1'
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[1],
        tracks[3],
        tracks[5],
        tracks[6]
      ])
    })

    test('filters by number field greater than or equal to shorthand', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            trackNumber: '>=1'
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

    test('filters by number field less than shorthand', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            trackNumber: '<2'
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[0],
        tracks[2],
        tracks[4]
      ])
    })

    test('filters by number field less than or equal to shorthand', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            trackNumber: '<=2'
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
        tracks[5]
      ])
    })

    test('filters by date field greater than shorthand', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            releaseDate: '> 2006'
          }
        },
        trackCollections: {
          [trackCollectionName]: tracks
        }
      })

      expect(filteredTracks).toEqual([
        tracks[6]
      ])
    })

    test('filters by date field less than shorthand', async () => {
      const filteredTracks = await execute({
        config: {
          tracks: trackCollectionName,
          filter: {
            releaseDate: '< 2006'
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
