import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, Navigate } from "react-router-dom";
import Home from './pages/Home';
import SearchBar from "./components/SearchBar";

import { getProfile, logout } from "./services/auth";
import { fetchWatchlist } from './services/watchlist';
import { subscribeToApiLoading } from './services/api';
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Watchlist from './pages/Watchlist';
import WatchlistChat from './components/WatchlistChat';

// Wrapper to protect pages needing logged in user
function ProtectedRoute({ user, checkingAuth, children }) {
  // While still checking /auth/profile on initial load, don't render anything yet
  if (checkingAuth) return null;

  // If there is no user after the check, redirect to /login
  if (!user) return <Navigate to="/login" replace/>;

  // If user is authenticated, render the protected content
  return children;
}

function AppShell() {
  const [results, setResults] = useState([]);   // stores results of search
  const [searchMode, setSearchMode] = useState('idle'); // 'idle' | 'searched'
  const [user, setUser] = useState(null);        // stores logged-in user (or null)
  const [checkingAuth, setCheckingAuth] = useState(true); // while we call /auth/profile on load
  const [menuOpen, setMenuOpen] = useState(false);        // dropdown state
  const [watchlist, setWatchlist] = useState([]);   // stores watchlist
  const [isApiLoading, setIsApiLoading] = useState(false);  // global API loading state

  const menuRef = useRef(null);
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

  // Subscribe/unsubscribe to loading updates
  useEffect(() => {
    return subscribeToApiLoading(setIsApiLoading);
  }, []);

  useEffect(() => {
    document.documentElement.style.cursor = isApiLoading ? "wait" : ""; // toggle cursor when loading

    return () => {
      document.documentElement.style.cursor = ''; // reset on unmount
    };
  }, [isApiLoading]);

  // Clear search results (for when user clicks home button)
  function handleHome() {
    setResults([]);
    setSearchMode('idle');
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

  const initial = user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
          {/* Logo */}
          <NavLink
            to="/"
            onClick={handleHome}
            className="flex shrink-0 items-center gap-2 font-serif text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-serif italic text-on-primary">R</span>
            <span className="hidden sm:inline">ReelSearch</span>
          </NavLink>

          {/* Search bar */}
          <div className="mx-auto w-full max-w-md flex-1">
            <SearchBar setResults={setResults} setSearchMode={setSearchMode} />
          </div>

          {/* Watchlist icon with count badge — visible at all widths */}
          <NavLink
            to="/watchlist"
            aria-label="View watchlist"
            title="Watchlist"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:border-border-strong hover:bg-surface-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
            </svg>
            {watchlist.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-on-primary">
                {watchlist.length}
              </span>
            )}
          </NavLink>

          {/* Profile avatar + dropdown */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              disabled={isApiLoading}
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                user
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border bg-surface text-muted"
              } ${isApiLoading ? "opacity-50" : "hover:border-border-strong"}`}
            >
              {user ? (
                initial
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 19a7 7 0 0 1 14 0" strokeLinecap="round" />
                </svg>
              )}
            </button>

            {menuOpen && !checkingAuth && (
              <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-elevated p-1 shadow-2xl shadow-black/50 animate-fade-up">
                {user ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-xs text-faint">Signed in as</p>
                      <p className="truncate text-sm font-medium text-foreground">{user.email}</p>
                    </div>
                    <div className="my-1 h-px bg-border" />
                    <NavLink to="/profile" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-surface-2">Profile</NavLink>
                    <button onClick={handleLogout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-destructive transition hover:bg-surface-2">Log out</button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-surface-2">Log in</NavLink>
                    <NavLink to="/register" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-surface-2">Register</NavLink>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main area for displaying search results and user watchlist */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Routes>
          {/* Home page */}
          <Route path="/" element={<Home user={user} results={results} searchMode={searchMode} watchlist={watchlist} setWatchlist={setWatchlist} />} />

          {/* Register route */}
          <Route path="/register" element={<Register onAuth={setUser}/>}/>
          {/* Login page */}
          <Route path="/login" element={<Login onAuth={setUser}/>}/>

          {/* Protected profile page */}
          <Route path="/profile" element={<ProtectedRoute user={user} checkingAuth={checkingAuth}>
                                            <Profile user={user} watchlist={watchlist} onLogout={handleLogout} />
                                          </ProtectedRoute>}/>
          {/* Protected watchlist page */}
          <Route path="/watchlist" element={<ProtectedRoute user={user} checkingAuth={checkingAuth}>
                                              <Watchlist watchlist={watchlist} setWatchlist={setWatchlist}/>
                                              <WatchlistChat onResults={setWatchlist} />
                                            </ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}