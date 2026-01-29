import axios from 'axios'

export default async function handler(req, res) {
  const { code } = req.query

  if (!code) {
    return res.status(400).json({ error: 'No auth code provided' })
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    )

    const { access_token, refresh_token, expires_in } = response.data

    // Store tokens in httpOnly cookie (secure) and return to frontend
    res.setHeader(
      'Set-Cookie',
      `spotify_access_token=${access_token}; HttpOnly; Path=/; Max-Age=${expires_in}`
    )

    // Redirect back to home with success
    return res.redirect('/?auth=success')
  } catch (error) {
    console.error('Spotify auth error:', error.message)
    return res.redirect('/?auth=error')
  }
}
