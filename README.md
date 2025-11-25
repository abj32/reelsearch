# Movie Watchlist

Movie Watchlist is a full-stack app for discovering movies/shows/games through the OMDb catalog and saving items to a personal watchlist backed by PostgreSQL. The watchlist stores expanded metadata (plot, director, actors, critic ratings) so saved items are more detailed than search results.

<br>

## Tech Stack
- **Frontend:** Vite + React + React Router + Tailwind CSS  
- **Backend:** Node.js + Express + Prisma + PostgreSQL (tested with Neon)
- **Auth:** bcrypt, JWT (stored in an httpOnly cookie)
- **External API:** [OMDb API](https://www.omdbapi.com/)

<br>

## Project Structure
```text
movie-watchlist/
├─ client/                  # React + Vite frontend
│  ├─ src/
│  │  ├─ App.jsx
│  │  ├─ pages/
│  │  │  ├─ Home.jsx
│  │  │  ├─ Login.jsx
│  │  │  ├─ Profile.jsx
│  │  │  ├─ Register.jsx
│  │  │  └─ Watchlist.jsx
│  │  ├─ components/
│  │  │  ├─ SearchBar.jsx
│  │  └─ services/          # Frontend API wrappers (auth, search, watchlist)
│  └─ vite.config.js
│
├─ server/                  # Express backend (API, auth, watchlist features)
│  ├─ index.js              # Express entry point
│  ├─ routes/
│  │  ├─ auth.routes.js
│  │  ├─ search.routes.js
│  │  └─ watchlist.routes.js
│  ├─ services/
│  │  └─ omdb.service.js    # OMDb API proxy logic
│  ├─ middleware/
│  │  └─ requireAuth.js     # JWT cookie authentication middleware
│  └─ utils/
│     └─ ratings.util.js    # Rating normalization helpers
│
├─ prisma/
│  ├─ schema.prisma         # Prisma schema defining User & Watchlist models
│  └─ migrations/           # Generated Prisma migrations
│
├─ package.json             # Root scripts for dev / server / client
└─ README.md
```

<br>

## Features

- 🔍 **Movie / Show / Game Search**
  - Search the OMDb catalog by title
  - Results show key info (poster, title, year, type, age rating) for quick browsing

- 👤 **User Accounts & Auth**
  - Register and log in with email + password
  - Passwords are hashed with `bcrypt`
  - Session handled via an `httpOnly` cookie containing a signed JWT
  - View email and profile creation date via **Profile Icon** -> **Profile**

- 📺 **Persistent Watchlist**
  - Add movies/shows/games to your watchlist from search results
  - Watchlist is stored per-user in PostgreSQL via Prisma
  - Remove items from your watchlist at any time
  - Watchlist displays extra details on hover (plot, director, actors, critic ratings)

- ⭐ **Ratings & Normalization**
  - OMDb ratings (IMDb, Rotten Tomatoes, Metacritic) are displayed in usual format (IMDb: 8.7/10, Rotten Tomatoes: 87%, Metacritic: 87/100)
  - Normalized scores are computed and stored under the hood as well as an  combined average `sortScore`
  - These scores are **not yet displayed in the UI**, but will power future sorting/ranking features

<br>

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher is recommended)
- npm (bundled with Node.js)
- A PostgreSQL database URL (e.g. via [Neon](https://neon.com/), [Supabase](https://supabase.com/), local PostgreSQL)
- An OMDb API key (free: https://www.omdbapi.com/apikey.aspx)

### Installation and Setup
1. **Fork or Clone the Repository**
   ```bash
   git clone https://github.com/abj32/movie-watchlist.git
   cd movie-watchlist
   ```

2. **Install Dependencies**\
   Run a single install from the project root:
   ```bash
   npm install
   ```

   The root `package.json` uses a `predev` script to install client dependencies the first time you run the dev server.

3. **Set Up Environment Variables**\
   Create a `.env` file in the project root and define:
   ```bash
   # PostgreSQL connection string used by Prisma
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

   # Secret key used to sign JWTs
   JWT_SECRET="a-long-random-string-here"

   # OMDb API key (used only on the backend)
   API_KEY="your_omdb_api_key_here"

   # Optional: port for the Express API (default is 5000)
   PORT=5000
   ```
4. **Running the Development Server**\
   From the project root run:
   ```bash
   npm run dev
   ```
   This uses `concurrently` to start both
   - the Express API (`npm run start-server`) on http://localhost:5000
   - the Vite dev server (`npm run start-client`) on http://localhost:5173

<br>

## Using the App
Once `npm run dev` is running:
- Open the frontend: http://localhost:5173

<br>

1. **Register/Log In**
- **Note**: You **do not need to be logged in** to search for and view movies/shows/games, but you **do need to be logged in** to add items to your watchlist
- Click the profile icon in the header and go to **Register** or **Login**
- Create an account with email and password or login with 
- After successful registration or login, the server sets an `httpOnly` session cookie (`sid`) with a signed JWT (expires in 1 hour)
- The client automatically fetches your profile on load (`GET /api/auth/profile`) to check for session cookie and JWT
- You can log out via **Profile Icon** -> **Log out**
2. **Search for Titles**
- Use the search bar in the header to search by title
- The frontend calls the backend’s search endpoint (`GET /api/search?q=<query>`)
- The backend then:
   - Calls OMDb using your API_KEY
   - Deduplicates results
   - Fetches full details for each unique imdbID
   - Returns a list of detailed movie objects to the client
3. **Managing Your Watchlist**
- After searching, click the “+” button on a card to add it to your watchlist
- The frontend calls:
   - `POST /api/watchlist` with `{ "imdbId": "<imdbID>" }`
- The item is stored in your watchlist in the database with a relation to your userId
- Visit the **Watchlist** page (via **Profile Icon** -> **Watchlist**) to see your saved items, view their extra details, and remove them

<br>

## API Overview (Backend routes)

### Health
- `GET /health`\
   Simple health check: `{ "ok": true }`

### Auth ( /api/auth )
- `POST /api/auth/register`\
   Body: `{ "email": string, "password": string }`\
   Creates a new user, sets `sid` cookie, returns the authenticated user’s `id`, `email`, and `createdAt`
- `POST /api/auth/login`\
   Body: `{ "email": string, "password": string }`\
   Verifies credentials, sets `sid` cookie, returns the authenticated user’s `id`, `email`, and `createdAt`
- `POST /api/auth/logout`\
   Clears the `sid` cookie
- `GET /api/auth/profile`\
   Requires auth (`requireAuth` middleware)
   Returns the authenticated user’s `id`, `email`, and `createdAt`

### Search ( /api/search )
- `GET /api/search?q=<query>`\
   Calls OMDb using the backend’s API_KEY, deduplicates results, and returns an array of detailed movie objects

### Watchlist ( /api/watchlist )
**Note:** All watchlist routes require authentication (`requireAuth` middleware)
- `GET /api/watchlist`\
   Returns the current user's watchlist items
- `POST /api/watchlist`\
   Body: `{ "imdbId": string }`
   - Fetches full details from OMDb
   - Normalizes ratings
   - Stores the item for the current user
- `DELETE /api/watchlist/:imdbId`
   - Removes specific item from the user’s watchlist

<br>

## Roadmap & Upcoming Updates
- 🔄 **Watchlist sorting/ranking**
   - Add options to sort by critic ranking using the stored normalized rating scores (`imdbScore`, `rtScore`, `mcScore`, `sortScore`)
- 🎯 **Filtering**
   - Filter watchlist by type (movie / series / game)
- 📝 **Issue-driven refinements:**
   - Smaller UX and styling improvements tracked under the [Issues tab](https://github.com/abj32/movie-watchlist/issues).

**Stay tuned for updates!**

<br>

## License
MIT