const { spawn } = require('child_process')

const shuffleTracks = {
  name: 'shuffle tracks',
  tasks: {
    get_tracks: {
      type: 'album.get_tracks',
      spotify_url: 'https://open.spotify.com/album/6d2dI1NyZB5xHpqBLPiHbP?si=mod36-DmSp6Bzg0ctu66q' // Album - AVA - I-Empire
    },
    shuffle_tracks: {
      type: 'tracks.shuffle',
      tracks: 'get_tracks'
    },
    save_tracks: {
      type: 'playlist.replace_tracks',
      spotify_url: 'https://open.spotify.com/playlist/70yOX4JIqkUL3optIQmicc?si=eade5d89aa7349a4', // Dev playlist - Save
      tracks: 'shuffle_tracks'
    }
  }
}
const json = JSON.stringify(shuffleTracks)
const accessToken = 'ABC123'

// echo <json> | npx playlist-pipeline run -t <token>

const echo = spawn('echo', [json])
const run = spawn('npx', ['playlist-pipeline', 'run', '-t', accessToken])

echo.stdout.pipe(run.stdin)

run.stdout.on('data', (data) => {
  console.log(
    data.toString().trim()
  )
})

run.stderr.on('data', (data) => {
  console.error(
    data.toString().trim()
  )
})

run.on('error', (error) => {
  console.error(error.message)
})
