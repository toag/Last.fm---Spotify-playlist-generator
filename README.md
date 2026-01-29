# Last.fm to Spotify Exporter

Simple web app to export your Last.fm listening history into Spotify playlists.

## Features
- Fetch listening history from Last.fm by username
- Filter by timeframe: last week, last month, or custom date range
- Create Spotify playlists from selected tracks
- Real-time track matching and import

## Stack
- Frontend: React + Next.js
- Backend: Next.js API Routes
- APIs: Last.fm, Spotify OAuth 2.0
- Styling: Tailwind CSS

## Setup

### Prerequisites
- Node.js 16+
- Last.fm & Spotify API credentials

### Local Development
1. Clone repo: `git clone https://github.com/toag/Last.fm---Spotify-playlist-generator.git`
2. Install: `npm install`
3. Create `.env.local` from `.env.example`
4. Add API keys to `.env.local`
5. Run: `npm run dev`
6. Open `http://localhost:3000`

### Deployment
- Deployed on Vercel
- Auto-deploys on git push
- Update Spotify redirect URI to production URL

## Status
Development phase - Portfolio ready
