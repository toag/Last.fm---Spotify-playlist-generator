# API Setup Guide - Last.fm & Spotify

## Last.fm API Setup

### 1. Create Last.fm Account
- Go to https://www.last.fm/join
- Sign up and verify email

### 2. Generate API Key
- Visit https://www.last.fm/api/account/create
- Fill app name, description, application URL
- Accept terms
- Copy **API Key** and **Shared Secret**

### 3. Add to `.env.local`
```
NEXT_PUBLIC_LASTFM_API_KEY=your_api_key_here
LASTFM_API_SECRET=your_shared_secret_here
```

**Note:** `NEXT_PUBLIC_` prefix makes key accessible on frontend (safe for Last.fm read operations)

---

## Spotify API Setup

### 1. Create Spotify Developer Account
- Go to https://developer.spotify.com/dashboard
- Log in with Spotify account (create if needed)

### 2. Create Application
- Click "Create an App"
- Accept terms & create
- Copy **Client ID** and **Client Secret**

### 3. Set Redirect URI
- In app settings, add Redirect URI:
  ```
  http://localhost:3000/callback
  ```
  (For production: `https://yourdomain.com/callback`)

### 4. Add to `.env.local`
```
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

**Security:** Keep `SPOTIFY_CLIENT_SECRET` server-side only (no `NEXT_PUBLIC_`)

---

## Next.js Integration

### Environment File Structure
Create `.env.local` in project root:
```
# Last.fm (public)
NEXT_PUBLIC_LASTFM_API_KEY=xxx

# Last.fm (server)
LASTFM_API_SECRET=xxx

# Spotify (public)
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback

# Spotify (server)
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx
```

### Access in Code

**Frontend (Client Components):**
```javascript
const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
```

**Backend (API Routes/Server):**
```javascript
const secret = process.env.SPOTIFY_CLIENT_SECRET;
const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY; // Also accessible
```

---

## Testing Connectivity

### Last.fm Test
```bash
curl "https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=testuser&api_key=YOUR_KEY&format=json"
```

### Spotify Token Test
```bash
curl -X POST "https://accounts.spotify.com/api/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_ID&client_secret=YOUR_SECRET"
```

---

## Development Setup

1. Copy `.env.example` to `.env.local`
2. Fill in API credentials from steps above
3. Never commit `.env.local` to git
4. Run `npm run dev` - Next.js loads env automatically

---

## Security Checklist
- ✅ `SPOTIFY_CLIENT_SECRET` server-side only
- ✅ `.env.local` in `.gitignore`
- ✅ No credentials in code/comments
- ✅ Redirect URIs match exactly (trailing slash, protocol)
