const Joi = require('joi')
const { findErrorByContextLabel } = require('../test/validationUtils')
const {
  id,
  getConfigSchema,
  execute,
  SORT_ASCENDING,
  SORT_DESCENDING
} = require('./sortTracks')

test('has correct id', () => {
  expect(id).toBe('tracks.sort')
})

describe('getConfigSchema', () => {
  const schema = Joi.object(getConfigSchema())

  test('.tracks is required in the config schema', () => {
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'tracks')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.required')
  })

  test('.tracks must be a string in the config schema', () => {
    const result = schema.validate({
      tracks: []
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'tracks')

    expect(err).toBeDefined()
    expect(err.type).toEqual('string.base')
  })

  test('.sort is required in the config schema', () => {
    const result = schema.validate({}, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'sort')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.required')
  })

  test('.sort is an object in the config schema', () => {
    const result = schema.validate({
      sort: 'foo'
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'sort')

    expect(err).toBeDefined()
    expect(err.type).toEqual('object.base')
  })

  test('.sort.album is a valid string in the config schema', () => {
    const result = schema.validate({
      sort: {
        album: []
      }
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'sort.album')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.only')
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test('.sort.artist is a valid string in the config schema', () => {
    const result = schema.validate({
      sort: {
        artist: []
      }
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'sort.artist')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.only')
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test('.sort.name is a valid string in the config schema', () => {
    const result = schema.validate({
      sort: {
        name: []
      }
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'sort.name')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.only')
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test('.sort.releaseDate is a string in the config schema', () => {
    const result = schema.validate({
      sort: {
        releaseDate: []
      }
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'sort.releaseDate')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.only')
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })

  test('.sort.trackNumber is a valid string in the config schema', () => {
    const result = schema.validate({
      sort: {
        trackNumber: []
      }
    }, { abortEarly: false })

    expect(result.error).toBeDefined()

    const err = findErrorByContextLabel(result.error, 'sort.trackNumber')

    expect(err).toBeDefined()
    expect(err.type).toEqual('any.only')
    expect(err.context.valids).toEqual([SORT_ASCENDING, SORT_DESCENDING])
  })
})

describe('execute', () => {
  test('sorts case insensitively by album ascending', async () => {
    const trackCollectionName = 'foo'

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          album: SORT_ASCENDING
        }
      },
      trackCollections: {
        [trackCollectionName]: [
          { album: 'aaa' },
          { album: 'AAA' },
          { album: 'ccc' },
          { album: 'CCC' },
          { album: 'bbb' },
          { album: 'bbb' }
        ]
      }
    })

    expect(sortedTracks).toEqual([
      { album: 'aaa' },
      { album: 'AAA' },
      { album: 'bbb' },
      { album: 'bbb' },
      { album: 'ccc' },
      { album: 'CCC' }
    ])
  })

  test('sorts case insensitively by album descending', async () => {
    const trackCollectionName = 'foo'

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          album: SORT_DESCENDING
        }
      },
      trackCollections: {
        [trackCollectionName]: [
          { album: 'aaa' },
          { album: 'AAA' },
          { album: 'ccc' },
          { album: 'CCC' },
          { album: 'bbb' },
          { album: 'bbb' }
        ]
      }
    })

    expect(sortedTracks).toEqual([
      { album: 'ccc' },
      { album: 'CCC' },
      { album: 'bbb' },
      { album: 'bbb' },
      { album: 'aaa' },
      { album: 'AAA' }
    ])
  })

  test('sorts case insensitively by artist ascending', async () => {
    const trackCollectionName = 'foo'

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          artist: SORT_ASCENDING
        }
      },
      trackCollections: {
        [trackCollectionName]: [
          { artist: 'aaa' },
          { artist: 'AAA' },
          { artist: 'ccc' },
          { artist: 'CCC' },
          { artist: 'bbb' },
          { artist: 'bbb' }
        ]
      }
    })

    expect(sortedTracks).toEqual([
      { artist: 'aaa' },
      { artist: 'AAA' },
      { artist: 'bbb' },
      { artist: 'bbb' },
      { artist: 'ccc' },
      { artist: 'CCC' }
    ])
  })

  test('sorts case insensitively by artist descending', async () => {
    const trackCollectionName = 'foo'

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          artist: SORT_DESCENDING
        }
      },
      trackCollections: {
        [trackCollectionName]: [
          { artist: 'aaa' },
          { artist: 'AAA' },
          { artist: 'ccc' },
          { artist: 'CCC' },
          { artist: 'bbb' },
          { artist: 'bbb' }
        ]
      }
    })

    expect(sortedTracks).toEqual([
      { artist: 'ccc' },
      { artist: 'CCC' },
      { artist: 'bbb' },
      { artist: 'bbb' },
      { artist: 'aaa' },
      { artist: 'AAA' }
    ])
  })

  test('sorts case insensitively by name ascending', async () => {
    const trackCollectionName = 'foo'

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          name: SORT_ASCENDING
        }
      },
      trackCollections: {
        [trackCollectionName]: [
          { name: 'aaa' },
          { name: 'AAA' },
          { name: 'ccc' },
          { name: 'CCC' },
          { name: 'bbb' },
          { name: 'bbb' }
        ]
      }
    })

    expect(sortedTracks).toEqual([
      { name: 'aaa' },
      { name: 'AAA' },
      { name: 'bbb' },
      { name: 'bbb' },
      { name: 'ccc' },
      { name: 'CCC' }
    ])
  })

  test('sorts case insensitively by name descending', async () => {
    const trackCollectionName = 'foo'

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          name: SORT_DESCENDING
        }
      },
      trackCollections: {
        [trackCollectionName]: [
          { name: 'aaa' },
          { name: 'AAA' },
          { name: 'ccc' },
          { name: 'CCC' },
          { name: 'bbb' },
          { name: 'bbb' }
        ]
      }
    })

    expect(sortedTracks).toEqual([
      { name: 'ccc' },
      { name: 'CCC' },
      { name: 'bbb' },
      { name: 'bbb' },
      { name: 'aaa' },
      { name: 'AAA' }
    ])
  })

  test('sorts by release date ascending', async () => {
    const trackCollectionName = 'foo'

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          releaseDate: SORT_ASCENDING
        }
      },
      trackCollections: {
        [trackCollectionName]: [
          { artist: 'aaa', releaseDate: 2003 },
          { artist: 'aaa', releaseDate: 2001 },
          { artist: 'ccc', releaseDate: 2004 },
          { artist: 'ccc', releaseDate: 2003 },
          { artist: 'bbb', releaseDate: 2001 },
          { artist: 'bbb', releaseDate: 2004 }
        ]
      }
    })

    expect(sortedTracks).toEqual([
      { artist: 'aaa', releaseDate: 2001 },
      { artist: 'bbb', releaseDate: 2001 },
      { artist: 'aaa', releaseDate: 2003 },
      { artist: 'ccc', releaseDate: 2003 },
      { artist: 'ccc', releaseDate: 2004 },
      { artist: 'bbb', releaseDate: 2004 }
    ])
  })

  test('sorts by release date descending', async () => {
    const trackCollectionName = 'foo'

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          releaseDate: SORT_DESCENDING
        }
      },
      trackCollections: {
        [trackCollectionName]: [
          { artist: 'aaa', releaseDate: 2003 },
          { artist: 'aaa', releaseDate: 2001 },
          { artist: 'ccc', releaseDate: 2004 },
          { artist: 'ccc', releaseDate: 2003 },
          { artist: 'bbb', releaseDate: 2001 },
          { artist: 'bbb', releaseDate: 2004 }
        ]
      }
    })

    expect(sortedTracks).toEqual([
      { artist: 'ccc', releaseDate: 2004 },
      { artist: 'bbb', releaseDate: 2004 },
      { artist: 'aaa', releaseDate: 2003 },
      { artist: 'ccc', releaseDate: 2003 },
      { artist: 'aaa', releaseDate: 2001 },
      { artist: 'bbb', releaseDate: 2001 }
    ])
  })

  test('sorts by tack number ascending', async () => {
    const trackCollectionName = 'foo'

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          trackNumber: SORT_ASCENDING
        }
      },
      trackCollections: {
        [trackCollectionName]: [
          { artist: 'aaa', trackNumber: 2 },
          { artist: 'aaa', trackNumber: 1 },
          { artist: 'ccc', trackNumber: 3 },
          { artist: 'ccc', trackNumber: 4 },
          { artist: 'bbb', trackNumber: 1 },
          { artist: 'bbb', trackNumber: 7 }
        ]
      }
    })

    expect(sortedTracks).toEqual([
      { artist: 'aaa', trackNumber: 1 },
      { artist: 'bbb', trackNumber: 1 },
      { artist: 'aaa', trackNumber: 2 },
      { artist: 'ccc', trackNumber: 3 },
      { artist: 'ccc', trackNumber: 4 },
      { artist: 'bbb', trackNumber: 7 }
    ])
  })

  test('sorts by track number descending', async () => {
    const trackCollectionName = 'foo'

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          trackNumber: SORT_DESCENDING
        }
      },
      trackCollections: {
        [trackCollectionName]: [
          { artist: 'aaa', trackNumber: 2 },
          { artist: 'aaa', trackNumber: 1 },
          { artist: 'ccc', trackNumber: 3 },
          { artist: 'ccc', trackNumber: 4 },
          { artist: 'bbb', trackNumber: 1 },
          { artist: 'bbb', trackNumber: 7 }
        ]
      }
    })

    expect(sortedTracks).toEqual([
      { artist: 'bbb', trackNumber: 7 },
      { artist: 'ccc', trackNumber: 4 },
      { artist: 'ccc', trackNumber: 3 },
      { artist: 'aaa', trackNumber: 2 },
      { artist: 'aaa', trackNumber: 1 },
      { artist: 'bbb', trackNumber: 1 }
    ])
  })

  test('sorts by multiple fields', async () => {
    const trackCollectionName = 'foo'

    const sortedTracks = await execute({
      config: {
        tracks: trackCollectionName,
        sort: {
          artist: SORT_ASCENDING,
          releaseDate: SORT_ASCENDING
        }
      },
      trackCollections: {
        [trackCollectionName]: [
          { artist: 'aaa', releaseDate: 2003 },
          { artist: 'aaa', releaseDate: 2001 },
          { artist: 'ccc', releaseDate: 2004 },
          { artist: 'ccc', releaseDate: 2003 },
          { artist: 'bbb', releaseDate: 2001 },
          { artist: 'bbb', releaseDate: 2004 }
        ]
      }
    })

    expect(sortedTracks).toEqual([
      { artist: 'aaa', releaseDate: 2001 },
      { artist: 'aaa', releaseDate: 2003 },
      { artist: 'bbb', releaseDate: 2001 },
      { artist: 'bbb', releaseDate: 2004 },
      { artist: 'ccc', releaseDate: 2003 },
      { artist: 'ccc', releaseDate: 2004 }
    ])
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
    ).rejects.toThrow(`${trackCollectionName} is not a valid track source`)
  })
})
