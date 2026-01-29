import axios from 'axios'

// Search for a track on Spotify
async function searchSpotifyTrack(accessToken, trackName, artistName) {
  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: `track:${trackName} artist:${artistName}`,
        type: 'track',
        limit: 1,
      },
    })

    const tracks = response.data.tracks?.items || []
    return tracks.length > 0 ? tracks[0].id : null
  } catch (error) {
    console.error(`Error searching track "${trackName}":`, error.message)
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { tracks, playlistName } = req.body

  if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
    return res.status(400).json({ error: 'No tracks provided' })
  }

  // Get access token from cookies
  const accessToken = req.cookies.spotify_access_token

  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated with Spotify' })
  }

  try {
    // Get current user
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const userId = userResponse.data.id

    // Create playlist
    const playlistResponse = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name: playlistName,
        description: `Created with Last.fm to Spotify Exporter • ${new Date().toLocaleDateString()}`,
        public: false,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const playlistId = playlistResponse.data.id
    const playlistUrl = playlistResponse.data.external_urls.spotify

    // Search and match tracks
    const spotifyTrackIds = []
    const unmatchedTracks = []

    for (const track of tracks) {
      const spotifyId = await searchSpotifyTrack(accessToken, track.name, track.artist)
      if (spotifyId) {
        spotifyTrackIds.push(spotifyId)
      } else {
        unmatchedTracks.push(`${track.name} - ${track.artist}`)
      }
    }

    // Add tracks to playlist (in batches of 100)
    if (spotifyTrackIds.length > 0) {
      for (let i = 0; i < spotifyTrackIds.length; i += 100) {
        const batch = spotifyTrackIds.slice(i, i + 100)
        await axios.post(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          { uris: batch.map(id => `spotify:track:${id}`) },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
      }
    }

    return res.status(200).json({
      success: true,
      playlistUrl,
      playlistName,
      tracksAdded: spotifyTrackIds.length,
      tracksUnmatched: unmatchedTracks.length,
      unmatchedTracks: unmatchedTracks.slice(0, 5), // Show first 5
    })
  } catch (error) {
    console.error('Spotify playlist error:', error.message)
    return res.status(500).json({ error: 'Failed to create Spotify playlist' })
  }
}
