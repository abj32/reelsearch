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
  if (!user) return <Navigate to="/login" replace />;

  // If user is authenticated, render the protected content
  return children;
}

function getProfileErrorMessage(err) {
  switch (err.code) {
    case "AUTH_REQUIRED":
      return "";

    case "AUTH_INVALID":
      return "Your session expired. Please log in again.";

    case "AUTH_USER_NOT_FOUND":
      return "Your session could not be restored. Please log in again.";

    case "AUTH_PROFILE_FAILED":
      return "Could not verify your session. Please try again.";

    default:
      if (err.status === 401) return "";
      return "Could not verify your session. Please try again.";
  }
}

function getWatchlistErrorMessage(err) {
  switch (err.code) {
    case "AUTH_REQUIRED":
      return "Please log in to view your watchlist.";

    case "AUTH_INVALID":
      return "Your session expired. Please log in again.";

    case "WATCHLIST_LOAD_FAILED":
      return "Failed to load your watchlist. Please try again.";

    default:
      return err.message || "Failed to load your watchlist. Please try again.";
  }
}

function AppShell() {
  const [results, setResults] = useState([]); // stores results of search
  const [searchMode, setSearchMode] = useState('idle'); // 'idle' | 'searched'
  const [user, setUser] = useState(null); // stores logged-in user (or null)
  const [checkingAuth, setCheckingAuth] = useState(true); // while we call /auth/profile on load
  const [menuOpen, setMenuOpen] = useState(false); // dropdown state
  const [watchlist, setWatchlist] = useState([]); // stores watchlist
  const [isApiLoading, setIsApiLoading] = useState(false); // global API loading state
  const [appMessage, setAppMessage] = useState("");

  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Check if user is logged in on first load via their cookie
  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile(); // GET /api/auth/profile
        setUser(profile);
        setAppMessage("");
      } catch (err) {
        const message = getProfileErrorMessage(err);

        if (err.code === "AUTH_REQUIRED") {
          setUser(null);
          return;
        }

        if (err.code === "AUTH_INVALID" || err.code === "AUTH_USER_NOT_FOUND") {
          setUser(null);
          setWatchlist([]);

          if (message) {
            setAppMessage(message);
          }

          return;
        }

        console.error("Failed to load profile:", err);

        if (message) {
          setAppMessage(message);
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
        if (err.code === "AUTH_REQUIRED" || err.code === "AUTH_INVALID") {
          setUser(null);
          setWatchlist([]);
          setMenuOpen(false);
          setAppMessage(getWatchlistErrorMessage(err));
          return;
        }

        console.error("Failed to load watchlist:", err);
        setAppMessage(getWatchlistErrorMessage(err));
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
      document.documentElement.style.cursor = ""; // reset on unmount
    };
  }, [isApiLoading]);

  // Clear search results (for when user clicks home button)
  function handleHome() {
    setResults([]);
    setSearchMode('idle');
    setAppMessage("");
  }

  // Deactivate user, watchlist and menu on logout
  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      setWatchlist([]);
      setMenuOpen(false);
      setAppMessage("");
      navigate("/");
    }
  }

  const initial = user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
          {/* Logo */}
          <NavLink
            to="/"
            onClick={handleHome}
            className="flex shrink-0 items-center gap-2 font-serif text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-serif italic text-on-primary">
              R
            </span>

            {/* Hide full logo text until lg to avoid colliding with centered search */}
            <span className="hidden lg:inline">ReelSearch</span>
          </NavLink>

          {/* Extra-small search bar: normal flex flow so it cannot overlap icons */}
          <div className="min-w-0 flex-1 sm:hidden">
            <SearchBar setResults={setResults} setSearchMode={setSearchMode} />
          </div>

          {/* Small / medium centered search bar */}
          <div className="pointer-events-none absolute left-1/2 hidden w-[min(26rem,calc(100%_-_16rem))] -translate-x-1/2 sm:block lg:hidden">
            <div className="pointer-events-auto">
              <SearchBar setResults={setResults} setSearchMode={setSearchMode} />
            </div>
          </div>

          {/* Desktop centered search bar */}
          <div className="pointer-events-none absolute left-1/2 hidden w-full max-w-md -translate-x-1/2 lg:block xl:max-w-lg">
            <div className="pointer-events-auto">
              <SearchBar setResults={setResults} setSearchMode={setSearchMode} />
            </div>
          </div>

          {/* Right-side actions */}
          <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-5">
            {/* Watchlist icon with count badge — visible at all widths */}
            <NavLink
              to="/watchlist"
              aria-label="View watchlist"
              title="Watchlist"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:border-border-strong hover:bg-surface-2"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z"
                  strokeLinejoin="round"
                />
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
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
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
                        <p className="truncate text-sm font-medium text-foreground">
                          {user.email}
                        </p>
                      </div>

                      <div className="my-1 h-px bg-border" />

                      <NavLink
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-surface-2"
                      >
                        Profile
                      </NavLink>

                      <button
                        onClick={handleLogout}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-destructive transition hover:bg-surface-2"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-surface-2"
                      >
                        Log in
                      </NavLink>

                      <NavLink
                        to="/register"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-surface-2"
                      >
                        Register
                      </NavLink>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main area for displaying search results and user watchlist */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {appMessage && (
          <div className="mx-auto mb-5 flex max-w-7xl items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/15 px-3 py-2 text-sm text-foreground">
            <span>{appMessage}</span>

            <button
              type="button"
              onClick={() => setAppMessage("")}
              className="shrink-0 text-faint transition hover:text-foreground"
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        <Routes>
          {/* Home page */}
          <Route
            path="/"
            element={
              <Home
                user={user}
                results={results}
                searchMode={searchMode}
                watchlist={watchlist}
                setWatchlist={setWatchlist}
              />
            }
          />

          {/* Register route */}
          <Route path="/register" element={<Register onAuth={setUser} />} />

          {/* Login page */}
          <Route path="/login" element={<Login onAuth={setUser} />} />

          {/* Protected profile page */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user} checkingAuth={checkingAuth}>
                <Profile user={user} watchlist={watchlist} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          {/* Protected watchlist page */}
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute user={user} checkingAuth={checkingAuth}>
                <Watchlist watchlist={watchlist} setWatchlist={setWatchlist} />
                <WatchlistChat onResults={setWatchlist} />
              </ProtectedRoute>
            }
          />
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