# 🎥 ReelSearch

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue">
  <img src="https://img.shields.io/badge/API-Express-black">
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blue">
  <img src="https://img.shields.io/badge/License-MIT-green">
</p>

🎥 ReelSearch is a full-stack web application for discovering movies, TV series, and games through the OMDb catalog and saving them to a personal watchlist backed by PostgreSQL. Users can search the catalog, explore detailed movie metadata, and maintain a persistent watchlist of saved titles.

<br>

## Live Demo

Frontend:  
[reelsearch-ten.vercel.app](https://reelsearch-ten.vercel.app)

Backend health check:  
[reelsearch-api.onrender.com/health](https://reelsearch-api.onrender.com/health)

⚠️ Note: The app may take ~20–30 seconds to respond on the first request after inactivity because the server runs on Render's free tier.

<br>

## Screenshots

### Search Results

<p align="center">
  <img src="docs/search-results.png" width="900">
</p>

<p align="center">
Search results display key movie metadata and allow users to add titles directly to their watchlist.
</p>

<br>

### Watchlist (Expanded Details)

<p align="center">
  <img src="docs/watchlist-details.png" width="900">
</p>

<p align="center">
  Hovering over a watchlist item reveals stored metadata including plot, cast, and critic ratings.
</p>

<br>

## Tech Stack

- **Frontend**
   - React
   - Vite
   - React Router
   - Tailwind CSS
- **Backend**
   - Node.js
   - Express
   - Prisma
- **Database**
   - PostgreSQL (Neon)
- **Authentication**
   - bcrypt, JWT (stored in an httpOnly cookie)
- **External API**
   - [OMDb API](https://www.omdbapi.com/)
- **Deployment**
   - Vercel (frontend)
   - Render (backend)

<br>

## System Architecture

🎥 ReelSearch follows a typical full-stack architecture:
- The **React + Vite frontend** communicates with an **Express REST API**
- The API handles **authentication, search requests, and watchlist management**
- Search requests are proxied to the **OMDb API**, and the server fetches full metadata for each result
- **Prisma ORM** manages database access for user accounts and watchlists
- Watchlist data is stored in **PostgreSQL (Neon)**
- Authentication is implemented with **JWT tokens stored in secure httpOnly cookies**

<br>

## Project Structure
```text
reelsearch/
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

### 🔍 Movie / Show / Game Search

Search the OMDb catalog by title and return enriched metadata for each result.

- Results display key information such as poster, title, year, type, and age rating for quick browsing
- The backend fetches full metadata for each unique result before returning it to the client
- Users can add titles directly to their watchlist from the search results

### 👤 User Accounts & Authentication
Create an account and securely manage a personal watchlist.
- Users can register and log in with email and password
- Passwords are securely hashed using `bcrypt`
- Authentication is handled through a signed JWT stored in a secure `httpOnly` cookie
- Logged-in users can view their email and account creation date via **Profile Icon → Profile**

### 📺 Persistent Watchlist

Save titles to a personal watchlist backed by PostgreSQL.

- Movies, series, and games can be added directly from search results
- Watchlist items are stored per user using **Prisma ORM** and **PostgreSQL**
- Items can be removed from the watchlist at any time
- Hovering over an item reveals expanded metadata including plot, director, cast, and critic ratings

### ⭐ Ratings & Normalization

Normalize critic ratings to enable future ranking and sorting features.

- OMDb ratings (IMDb, Rotten Tomatoes, Metacritic) are displayed in their familiar formats (e.g., IMDb: 8.7/10, Rotten Tomatoes: 87%)
- Ratings are normalized internally into comparable scores
- A combined average `sortScore` is computed and stored
- These normalized scores are not yet displayed in the UI but will power future ranking and filtering features

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
   git clone https://github.com/abj32/reelsearch.git
   cd reelsearch
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
- Create an account with email and password or login with an existing account
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
   - Smaller UX and styling improvements tracked under the [Issues tab](https://github.com/abj32/reelsearch/issues).

**Stay tuned for updates!**

<br>

## License
MIT