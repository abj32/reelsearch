import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { getMovieDetails } from '../services/omdb.service.js';
import { normalizeRatings } from '../utils/ratings.util.js';

const router = Router();

function serializeWatchlistItem(item) {
  return {
    ...item,
    boxOfficeValue:
      item.boxOfficeValue != null ? item.boxOfficeValue.toString() : null,
  };
}

// GET user watchlist
router.get('/', requireAuth, async (req, res) => {
  try {
    const { type, genre, sortBy, order } = req.query;

    const where = {
      userId: req.userId,
    };

    // Optional type filter
    if (typeof type === 'string' && type.trim() !== '') {
      const normalizedType = type.trim().toLowerCase();

      const allowedTypes = new Set(['movie', 'series', 'game']);
      if (!allowedTypes.has(normalizedType)) {
        return res.status(400).json({ message: 'Invalid type filter' });
      }

      where.type = normalizedType;
    }

    // Optional genre filter
    if (typeof genre === 'string' && genre.trim() !== '') {
      const normalizedGenre = genre.trim().toLowerCase();
      where.genres = {
        has: normalizedGenre,
      };
    }

    // Allowed sort fields
    const allowedSortFields = new Set([
      'createdAt',
      'title',
      'releaseYear',
      'imdbScore',
      'rtScore',
      'mcScore',
      'sortScore',
    ]);

    const sortField =
      typeof sortBy === 'string' && allowedSortFields.has(sortBy)
        ? sortBy
        : 'createdAt';  // Default to *date added to watchlist*

    // Fields with descending order by default
    const defaultDescFields = new Set([
      'createdAt',
      'imdbScore',
      'rtScore',
      'mcScore',
      'sortScore',
    ]);

    const sortOrder =
      order === 'desc' || order === 'asc'
        ? order
        : defaultDescFields.has(sortField)
        ? 'desc'
        : 'asc';

    const items = await prisma.watchlistItem.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
    });

    res.json(
      items.map(serializeWatchlistItem)
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load watchlist' });
  }
});

function naToNull(value) {
  if (value == null) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' || trimmed === 'N/A' ? null : trimmed;
}

function parseCsvArray(value) {
  const normalized = naToNull(value);
  if (!normalized) return [];
  return normalized
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

function parseReleaseYear(value) {
  const normalized = naToNull(value);
  if (!normalized) return null;

  const match = normalized.match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

function parseRuntimeMins(value) {
  const normalized = naToNull(value);
  if (!normalized) return null;

  const match = normalized.match(/^(\d+)\s+min$/i);
  return match ? Number(match[1]) : null;
}

function parseBoxOfficeValue(value) {
  const normalized = naToNull(value);
  if (!normalized) return null;

  const digits = normalized.replace(/[^0-9]/g, '');
  return digits ? BigInt(digits) : null;
}

// POST item to watchlist
router.post('/', requireAuth, async (req, res) => {
  try {
    const { imdbId } = req.body ?? {};

    if (!imdbId) {
      return res.status(400).json({ message: 'imdbId is required' });
    }

    // Check if item already exists for this user
    const existing = await prisma.watchlistItem.findUnique({
      where: { userId_imdbId: { userId: req.userId, imdbId } },
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: 'Item is already in your watchlist' });
    }

    // Fetch full movie details from OMDb
    const movie = await getMovieDetails(imdbId);

    // Build normalized values
    const poster = naToNull(movie.Poster);
    const year = naToNull(movie.Year);
    const releaseYear = parseReleaseYear(movie.Year);

    const type = naToNull(movie.Type);
    const rated = naToNull(movie.Rated);

    const genre = naToNull(movie.Genre);
    const genres = parseCsvArray(movie.Genre);

    const plot = naToNull(movie.Plot);
    const director = naToNull(movie.Director);
    const actors = naToNull(movie.Actors);

    const runtime = naToNull(movie.Runtime);
    const runtimeMins = parseRuntimeMins(movie.Runtime);

    const language = naToNull(movie.Language);
    const languages = parseCsvArray(movie.Language);

    const boxOffice = naToNull(movie.BoxOffice);
    const boxOfficeValue = parseBoxOfficeValue(movie.BoxOffice);

    // Normalize rating numbers & compute rounded sortScore
    const { imdbRaw, rtRaw, mcRaw, imdbScore, rtScore, mcScore, sortScore } =
      normalizeRatings(movie.Ratings);

    // Build DB record
    const data = {
      userId: req.userId,
      imdbId,
      title: movie.Title,
      poster,

      year,
      releaseYear,

      type,
      rated,

      genre,
      genres,

      plot,
      director,
      actors,

      runtime,
      runtimeMins,

      language,
      languages,

      boxOffice,
      boxOfficeValue,

      imdbRaw,
      rtRaw,
      mcRaw,
      imdbScore,
      rtScore,
      mcScore,
      sortScore,
    };

    // Add to watchlist
    const item = await prisma.watchlistItem.create({ data });

    res.status(201).json(serializeWatchlistItem(item));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add to watchlist' });
  }
});


// Delete watchlist item
router.delete('/:imdbId', requireAuth, async (req, res) => {
  try {
    const { imdbId } = req.params;

    await prisma.watchlistItem.delete({
      where: { userId_imdbId: { userId: req.userId, imdbId } },
    });

    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Item not found in watchlist' });
    }

    console.error(err);
    res.status(500).json({ message: 'Failed to delete watchlist item' });
  }
});


export default router;