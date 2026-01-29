import axios from 'axios'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, timeframe } = req.body

  if (!username) {
    return res.status(400).json({ error: 'Username required' })
  }

  // Verify API key exists
  const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY
  if (!apiKey) {
    console.error('Missing NEXT_PUBLIC_LASTFM_API_KEY in environment')
    return res.status(500).json({ error: 'Server configuration error: Missing API key' })
  }

  try {
    // Fetch user's top tracks from Last.fm
    const lastfmResponse = await axios.get('https://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'user.getTopTracks',
        user: username,
        period: timeframe,
        limit: 50,
        api_key: apiKey,
        format: 'json',
      },
    })

    const data = lastfmResponse.data

    // Check for Last.fm API errors
    if (data.error) {
      console.error(`Last.fm error: ${data.error}`)
      return res.status(400).json({ error: `Last.fm: ${data.error}` })
    }

    if (!data.toptracks || !data.toptracks.track) {
      return res.status(404).json({ error: 'User not found or no data available' })
    }

    const tracks = Array.isArray(data.toptracks.track) ? data.toptracks.track : [data.toptracks.track]

    if (tracks.length === 0) {
      return res.status(404).json({ error: 'No tracks found for this timeframe' })
    }

    // Return track data for Spotify matching
    return res.status(200).json({
      playlistName: `${username} - ${timeframe}`,
      trackCount: tracks.length,
      tracks: tracks.slice(0, 50).map(t => ({
        name: t.name,
        artist: typeof t.artist === 'string' ? t.artist : (t.artist?.name || 'Unknown'),
        playcount: t.playcount,
      })),
    })
  } catch (error) {
    console.error('API Error:', error.message)
    console.error('Full error:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch Last.fm data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
