# ReelSearch

ReelSearch lets people search a catalog of movies, series and games, compare critic scores, and keep a personal watchlist.

## Catalog

**Title**:
One catalog entry: a movie, a series or a game.
_Avoid_: Movie (when the entry could be a series or game), media, item

**Catalog provider**:
An outside service that supplies Title data: TMDB for metadata, OMDb for critic scores.
_Avoid_: API, source

**Critic score**:
One outside rating of a Title from IMDb, Rotten Tomatoes or Metacritic, on a 0–100 scale.
_Avoid_: Rating (alone), review score

**Composite score**:
The average of whichever critic scores a Title has, on a 0–100 scale.
_Avoid_: Sort score, star rating, overall rating

## Watchlist

**Watchlist**:
The set of Titles one user has saved.
_Avoid_: List, favorites, library

**Watchlist item**:
One Title in one user's watchlist, with the date it was added.
_Avoid_: Saved movie, entry

**Watchlist chat**:
A plain-English request that filters or sorts the user's watchlist.
_Avoid_: Assistant, AI search, chatbot

## Accounts

**User**:
A person with a session who owns one watchlist. In the live demo every user is a guest.
_Avoid_: Account holder, member, customer

**Guest**:
A temporary user created for one visitor, with no email or password, deleted 7 days after their last activity.
_Avoid_: Demo account, anonymous user, placeholder account

**Security event**:
A recorded account action such as sign-in, failed sign-in, password reset or account deletion.
_Avoid_: Audit log entry, activity
