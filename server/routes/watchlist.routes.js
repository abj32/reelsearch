import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { getMovieDetails } from '../services/omdb.service.js';
import { normalizeRatings } from '../utils/ratings.util.js';

const router = Router();

// GET user watchlist
router.get('/', requireAuth, async (req, res) => {
  try {
    const items = await prisma.watchlistItem.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'asc' },
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load watchlist' });
  }
});


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

    // Normalize rating numbers & compute rounded sortScore
    const { imdbRaw, rtRaw, mcRaw, imdbScore, rtScore, mcScore, sortScore } =
      normalizeRatings(movie.Ratings);

    // Build DB record
    const data = {
      userId: req.userId,
      imdbId,
      title: movie.Title,
      poster: movie.Poster !== 'N/A' ? movie.Poster : null,
      year: movie.Year,
      type: movie.Type,
      rated: movie.Rated !== 'N/A' ? movie.Rated : null,
      genre: movie.Genre,
      plot: movie.Plot,
      director: movie.Director,
      actors: movie.Actors,

      // Raw string rating
      imdbRaw,
      rtRaw,
      mcRaw,

      // normalized numeric ratings
      imdbScore,
      rtScore,
      mcScore,
      sortScore,
    };

    // Add to watchlist
    const item = await prisma.watchlistItem.create({ data });

    res.status(201).json(item);
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