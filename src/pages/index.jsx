import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Home() {
  const [username, setUsername] = useState('')
  const [timeframe, setTimeframe] = useState('7day')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [spotifyAuth, setSpotifyAuth] = useState(false)
  const [lastfmData, setLastfmData] = useState(null)
  const [creatingPlaylist, setCreatingPlaylist] = useState(false)

  // Check auth status on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('auth') === 'success') {
      setSpotifyAuth(true)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleLastfmSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim()) {
      setError('Please enter a Last.fm username')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/export', {
        username,
        timeframe,
      })

      setLastfmData(response.data)
      setSuccess(`Found ${response.data.trackCount} tracks!`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch Last.fm data')
    } finally {
      setLoading(false)
    }
  }

  const handleSpotifyAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
    const scopes = [
      'playlist-modify-public',
      'playlist-modify-private',
      'user-read-private',
    ]

    const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
    })}`

    window.location.href = authUrl
  }

  const handleCreatePlaylist = async () => {
    if (!lastfmData) return

    setCreatingPlaylist(true)
    setError('')
    setSuccess('')

    try {
      const response = await axios.post('/api/spotify/create-playlist', {
        tracks: lastfmData.tracks,
        playlistName: lastfmData.playlistName,
      })

      setSuccess(
        `✓ Playlist created! ${response.data.tracksAdded} tracks added. ${response.data.tracksUnmatched} could not be matched.`
      )
      
      // Open Spotify playlist in new tab
      setTimeout(() => {
        window.open(response.data.playlistUrl, '_blank')
      }, 1000)

      setLastfmData(null)
      setUsername('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create playlist')
    } finally {
      setCreatingPlaylist(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Vibes
            </h1>
            <p className="text-gray-400 text-sm tracking-widest">LAST.FM → SPOTIFY</p>
          </div>
          <p className="text-gray-300 text-lg font-light mb-2">
            Export your listening history
          </p>
          <p className="text-gray-500 text-sm">
            Turn your Last.fm stats into Spotify playlists instantly
          </p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
          {!lastfmData ? (
            // Step 1: Fetch Last.fm data
            <form onSubmit={handleLastfmSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-500 text-gray-300 mb-2">
                  Last.fm Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label htmlFor="timeframe" className="block text-sm font-500 text-gray-300 mb-2">
                  Listening Period
                </label>
                <select
                  id="timeframe"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                >
                  <option value="7day">Last 7 Days</option>
                  <option value="1month">Last Month</option>
                  <option value="3month">Last 3 Months</option>
                  <option value="6month">Last 6 Months</option>
                  <option value="12month">Last Year</option>
                  <option value="overall">All Time</option>
                </select>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Fetching...
                  </span>
                ) : (
                  'Fetch Last.fm Tracks'
                )}
              </button>
            </form>
          ) : (
            // Step 2: Show Last.fm data and Spotify auth
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">
                  <span className="text-gray-200 font-600">{lastfmData.trackCount}</span> tracks found
                </p>
                <p className="text-xs text-gray-500 mb-3">Sample tracks:</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {lastfmData.tracks.slice(0, 5).map((track, idx) => (
                    <p key={idx} className="text-xs text-gray-400">
                      {idx + 1}. {track.name} — {track.artist}
                    </p>
                  ))}
                  {lastfmData.tracks.length > 5 && (
                    <p className="text-xs text-gray-500 italic">
                      +{lastfmData.tracks.length - 5} more...
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
                  {success}
                </div>
              )}

              {!spotifyAuth ? (
                <button
                  onClick={handleSpotifyAuth}
                  className="w-full py-3 px-4 rounded-lg bg-[#1DB954] hover:bg-[#1ed760] text-white font-600 transition shadow-lg hover:shadow-xl"
                >
                  Connect with Spotify
                </button>
              ) : (
                <button
                  onClick={handleCreatePlaylist}
                  disabled={creatingPlaylist}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {creatingPlaylist ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Creating Playlist...
                    </span>
                  ) : (
                    '✓ Create Spotify Playlist'
                  )}
                </button>
              )}

              <button
                onClick={() => {
                  setLastfmData(null)
                  setUsername('')
                  setError('')
                  setSuccess('')
                }}
                className="w-full py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white text-sm transition"
              >
                Start Over
              </button>
            </div>
          )}

          {/* Info Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Your data is processed securely • No storage
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Your data is processed securely • No storage</p>
        </div>
      </div>
    </div>
  )
}
