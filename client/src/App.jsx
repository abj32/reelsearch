import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, Navigate } from "react-router-dom";
import Home from './pages/Home';
import SearchBar from "./components/SearchBar";

import { getProfile, logout } from "./services/auth";
import { fetchWatchlist } from './services/watchlist';
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Watchlist from './pages/Watchlist';


function AppShell() {
  const [results, setResults] = useState([]);   // stores results of search

  const [user, setUser] = useState(null);        // stores logged-in user (or null)
  const [checkingAuth, setCheckingAuth] = useState(true); // while we call /auth/profile on load
  const [menuOpen, setMenuOpen] = useState(false);        // dropdown state
  const [watchlist, setWatchlist] = useState([]);   // stores watchlist

  const navigate = useNavigate();

  // Check if user is logged in on first load via their cookie
  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();  // GET /api/auth/profile
        setUser(profile);
      } catch (err) {
        if (err.status !== 401) { // If error other than "user not logged in"
          console.error("Failed to load profile", err);
        }
      } finally {
        setCheckingAuth(false);
      }
    })();
  }, []);

  // Sync watchlist when user changes
  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      return;
    }

    (async () => {
      try {
        const items = await fetchWatchlist();
        setWatchlist(items);
      } catch (err) {
        console.error("Failed to load watchlist", err);
      }
    })();
  }, [user]);

  // Clear search results (for when user clicks home button)
  function handleHome() {
    setResults([]);
  }

  // Deactivate user, watchlist and menu on logout
  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
      setWatchlist([]);
      setMenuOpen(false);
      navigate("/");
    }
  }

  // Wrapper to protect pages needing logged in user
  function ProtectedRoute({ user, checkingAuth, children }) {
    // While still checking /auth/profile on initial load, don't render anything yet
    if (checkingAuth) {
      return null;
    }

    // If there is no user after the check, redirect to /login
    if (!user) {
      return (
        <Navigate to="/login" replace/>
      );
    }

    // If user is authenticated, render the protected content
    return children;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      
      {/* Header area for logo, search bar, and watchlist (later user profile) */}
      <header className="flex flex-row items-center relative px-1 sm:px-2 md:px-3 lg:px-4 xl:px-5 py-10 text-white bg-indigo-600 ">
        {/* Logo sends user back to home page */}
        <NavLink to="/" onClick={handleHome} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-wide" style={{ fontFamily: "'Lilita_One', cursive, sans-serif" }}>
          🎥ReelSearch
        </NavLink>

        {/* Search Bar */}
        <div className="absolute left-1/2 -translate-x-1/2 w-1/3">
          <SearchBar setResults={setResults} />
        </div>

        {/* Icon button with dropdown */}
        <div className="relative ml-auto">
          {/* Profile icon */}
          <button type="button" onClick={() => setMenuOpen((prev) => !prev)} className="flex items-center justify-center mr-1 w-9 sm:w-10 md:w-11 lg:w-13 xl:w-15 h-9 sm:h-10 md:h-11 lg:h-13 xl:h-15 rounded-full bg-white/20 hover:bg-white/30 border border-white/30">
            <span className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">👤</span>
          </button>

          {/* Dropdown checks if menuOpen is true and if page is done checkingAuth */}
          {menuOpen && !checkingAuth && (
            <div className="absolute right-0 mt-2 w-auto bg-white rounded-md text-black text-xs md:text-sm xl:text-base">
              {user ? (
                // If user if logged in
                <>
                  <NavLink to="/profile" onClick={() => setMenuOpen(false)} className="block rounded-md px-4 sm:px-5 py-1.75 sm:py-2 xl:py-2.25 hover:bg-gray-100">Profile</NavLink>
                  <NavLink to="/watchlist" onClick={() => setMenuOpen(false)} className="block px-4 sm:px-5 py-1.75 sm:py-2 xl:py-2.25 hover:bg-gray-100">Watchlist</NavLink>
                  <button onClick={handleLogout} className="block rounded-md w-full text-left px-4 sm:px-5 py-1.75 sm:py-2 xl:py-2.2 hover:bg-gray-100">Log out</button>
                </>
              ) : (
                // If user is not logged in
                <>
                  <NavLink to="/register" onClick={() => setMenuOpen(false)} className="block rounded-md px-4 py-1 sm:py-2 hover:bg-gray-100">Register</NavLink>
                  <NavLink to="/login" onClick={() => setMenuOpen(false)} className="block rounded-md px-4 py-1 sm:py-2 hover:bg-gray-100">Log in</NavLink>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main area for displaying search results and user watchlist */}
      <main className="p-3 sm:p-4 md:p-5 lg:p-6">
        <Routes>
          {/* Home page */}
          <Route path="/" element={<Home user={user} results={results} watchlist={watchlist} setWatchlist={setWatchlist} />} />

          {/* Register route */}
          <Route path="/register" element={<Register onAuth={setUser}/>}/>
          {/* Login page */}
          <Route path="/login" element={<Login onAuth={setUser}/>}/>

          {/* Protected profile page */}
          <Route path="/profile" element={<ProtectedRoute user={user} checkingAuth={checkingAuth}>
                                            <Profile user={user}/>
                                          </ProtectedRoute>}/>
          {/* Protected watchlist page */}
          <Route path="/watchlist" element={<ProtectedRoute user={user} checkingAuth={checkingAuth}>
                                              <Watchlist watchlist={watchlist} setWatchlist={setWatchlist}/>
                                            </ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}