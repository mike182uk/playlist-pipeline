import { usesAlbumField, usesGenreField } from './analysis.js'
import { SORT_ASCENDING } from '../task/sortTracks.js'

describe('usesAlbumField', () => {
  it('returns true if .album is used by sort task', () => {
    expect(
      usesAlbumField({
        tasks: {
          sort_tracks: {
            type: 'tracks.sort',
            sort: {
              album: SORT_ASCENDING
            }
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .releaseDate is used by sort task', () => {
    expect(
      usesAlbumField({
        tasks: {
          sort_tracks: {
            type: 'tracks.sort',
            sort: {
              releaseDate: SORT_ASCENDING
            }
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .releaseYear is used by sort task', () => {
    expect(
      usesAlbumField({
        tasks: {
          sort_tracks: {
            type: 'tracks.sort',
            sort: {
              releaseYear: SORT_ASCENDING
            }
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .album is used in .group_by by sort task', () => {
    expect(
      usesAlbumField({
        tasks: {
          sort_tracks: {
            type: 'tracks.sort',
            sort: {
              duration: SORT_ASCENDING
            },
            group_by: 'album'
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .albumId is used in .group_by by sort task', () => {
    expect(
      usesAlbumField({
        tasks: {
          sort_tracks: {
            type: 'tracks.sort',
            sort: {
              duration: SORT_ASCENDING
            },
            group_by: 'albumId'
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .albumUri is used in .group_by by sort task', () => {
    expect(
      usesAlbumField({
        tasks: {
          sort_tracks: {
            type: 'tracks.sort',
            sort: {
              duration: SORT_ASCENDING
            },
            group_by: 'albumUri'
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .releaseDate is used in .group_by by sort task', () => {
    expect(
      usesAlbumField({
        tasks: {
          sort_tracks: {
            type: 'tracks.sort',
            sort: {
              duration: SORT_ASCENDING
            },
            group_by: 'releaseDate'
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .releaseYear is used in .group_by by sort task', () => {
    expect(
      usesAlbumField({
        tasks: {
          sort_tracks: {
            type: 'tracks.sort',
            sort: {
              duration: SORT_ASCENDING
            },
            group_by: 'releaseYear'
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .album is used in .sort_group by sort task', () => {
    expect(
      usesAlbumField({
        tasks: {
          sort_tracks: {
            type: 'tracks.sort',
            sort: {
              duration: SORT_ASCENDING
            },
            group_by: 'artist',
            sort_group: {
              album: SORT_ASCENDING
            }
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .albumId is used in .sort_group by sort task', () => {
    expect(
      usesAlbumField({
        tasks: {
          sort_tracks: {
            type: 'tracks.sort',
            sort: {
              duration: SORT_ASCENDING
            },
            group_by: 'artist',
            sort_group: {
              albumId: SORT_ASCENDING
            }
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .albumUri is used in .sort_group by sort task', () => {
    expect(
      usesAlbumField({
        tasks: {
          sort_tracks: {
            type: 'tracks.sort',
            sort: {
              duration: SORT_ASCENDING
            },
            group_by: 'albumUri',
            sort_group: {
              albumId: SORT_ASCENDING
            }
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .releaseDate is used in .sort_group by sort task', () => {
    expect(
      usesAlbumField({
        tasks: {
          sort_tracks: {
            type: 'tracks.sort',
            sort: {
              duration: SORT_ASCENDING
            },
            group_by: 'albumUri',
            sort_group: {
              releaseDate: SORT_ASCENDING
            }
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .releaseYear is used in .sort_group by sort task', () => {
    expect(
      usesAlbumField({
        tasks: {
          sort_tracks: {
            type: 'tracks.sort',
            sort: {
              duration: SORT_ASCENDING
            },
            group_by: 'albumUri',
            sort_group: {
              releaseYear: SORT_ASCENDING
            }
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .album is used by filter task', () => {
    expect(
      usesAlbumField({
        tasks: {
          filter_tracks: {
            type: 'tracks.filter',
            filter: {
              album: 'foo'
            }
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .releaseDate is used by filter task', () => {
    expect(
      usesAlbumField({
        tasks: {
          filter_tracks: {
            type: 'tracks.filter',
            filter: {
              releaseDate: '>2008'
            }
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .releaseYear is used by filter task', () => {
    expect(
      usesAlbumField({
        tasks: {
          filter_tracks: {
            type: 'tracks.filter',
            filter: {
              releaseYear: '>2008'
            }
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .album is used by a filter of filter task', () => {
    expect(
      usesAlbumField({
        tasks: {
          filter_tracks: {
            type: 'tracks.filter',
            filter: [
              {
                album: 'foo'
              },
              {
                artist: 'bar'
              }
            ]
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .releaseDate is used by a filter of filter task', () => {
    expect(
      usesAlbumField({
        tasks: {
          filter_tracks: {
            type: 'tracks.filter',
            filter: [
              {
                releaseDate: '>2008'
              },
              {
                artist: 'bar'
              }
            ]
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .releaseYear is used by a filter of filter task', () => {
    expect(
      usesAlbumField({
        tasks: {
          filter_tracks: {
            type: 'tracks.filter',
            filter: [
              {
                releaseYear: '>2008'
              },
              {
                artist: 'bar'
              }
            ]
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .album is used by export task', () => {
    expect(
      usesAlbumField({
        tasks: {
          write_tracks_to_file: {
            type: 'tracks.export',
            fields: ['id', 'name', 'album']
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .albumId is used by export task', () => {
    expect(
      usesAlbumField({
        tasks: {
          write_tracks_to_file: {
            type: 'tracks.export',
            fields: ['id', 'name', 'albumId']
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .albumUri is used by export task', () => {
    expect(
      usesAlbumField({
        tasks: {
          write_tracks_to_file: {
            type: 'tracks.export',
            fields: ['id', 'name', 'albumUri']
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .releaseDate is used by export task', () => {
    expect(
      usesAlbumField({
        tasks: {
          write_tracks_to_file: {
            type: 'tracks.export',
            fields: ['id', 'name', 'releaseDate']
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .releaseYear is used by export task', () => {
    expect(
      usesAlbumField({
        tasks: {
          write_tracks_to_file: {
            type: 'tracks.export',
            fields: ['id', 'name', 'releaseYear']
          }
        }
      })
    ).toEqual(true)
  })
})

describe('usesGenreField', () => {
  it('returns true if .genre is used by filter task', () => {
    expect(
      usesGenreField({
        tasks: {
          filter_tracks: {
            type: 'tracks.filter',
            filter: {
              genre: 'foo'
            }
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .genre is used by a filter of filter task', () => {
    expect(
      usesGenreField({
        tasks: {
          filter_tracks: {
            type: 'tracks.filter',
            filter: [
              {
                genre: 'foo'
              },
              {
                artist: 'bar'
              }
            ]
          }
        }
      })
    ).toEqual(true)
  })

  it('returns true if .genre is used by export task', () => {
    expect(
      usesGenreField({
        tasks: {
          write_tracks_to_file: {
            type: 'tracks.export',
            fields: ['id', 'name', 'genre']
          }
        }
      })
    ).toEqual(true)
  })
})
