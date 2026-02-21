# OSRS Bingo Dashboard

A real-time, 6-player Free-for-All Bingo Dashboard for Old School RuneScape (OSRS).

## Features
- **Real-time Updates**: Powered by Supabase Realtime, completions sync across all clients instantly without refreshing.
- **Authentic OSRS UI**: Features custom `osrs-border` styling, accurate hex color matching (stone, panel, gold, yellow), and pixelated item icons.
- **Participant Orbs**: Each tile displays 8px colored squares for every player that has completed it. Full team completion dims the tile and displays a "DONE" overlay.
- **Leaderboard**: Real-time ranking of players by total tiles completed, featuring an OSRS "Total Level" style icon.
- **DM Control Panel**: A secure admin route (`/dm-panel?key=...`) that allows the Dungeon Master to click tiles and toggle completions for specific players using an authentic OSRS context-menu style UI.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Icons**: OSRSBox Item Database

## Getting Started

### 1. Database Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the SQL Editor in your Supabase dashboard.
3. Copy the contents of `supabase/schema.sql` and run it to create the necessary tables (`players`, `tiles`, `completions`) and seed them with initial data.
4. Make sure **Realtime** is enabled for the `completions` table (the SQL script attempts to do this, but verify in Table Settings -> Enable Realtime if it doesn't work).

### 2. Environment Variables
Create a `.env.local` file in the root directory (it may already exist with placeholders):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_KEY=your_secret_admin_key_here
```

### 3. Run the Development Server
Install dependencies and start the app:
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the main bingo board.

### 4. Admin Access
To manage the board, navigate to the DM Panel:
```
http://localhost:3000/dm-panel?key=your_secret_admin_key_here
```
Click on any tile to open the context menu and toggle completions for the players.

## Deployment
This project is ready to be deployed on Vercel. Ensure you add the environment variables from `.env.local` to your Vercel project settings during deployment.
