import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { parseWatchlistMessage } from '../services/chat.service.js';
import { buildWatchlistQuery } from '../services/watchlistQuery.service.js';
import { serializeWatchlistItem } from '../utils/serializeWatchlistItem.util.js';

const router = Router();

router.post('/watchlist', requireAuth, async (req, res) => {
  try {
    const { message } = req.body ?? {};

    if (typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ message: 'message is required' });
    }

    const action = await parseWatchlistMessage(message.trim());

    const normalizedGenre =
      typeof action.genre === 'string' && action.genre.trim() !== ''
        ? action.genre.trim().toLowerCase()
        : null;

    let filters = {};

    if (action.intent === 'clear_filters') {
      filters = {};
    } else if (action.intent === 'sort_watchlist') {
      filters = {
        sortBy: action.sortBy ?? null,
        order: action.order ?? null,
      };
    } else if (action.intent === 'filter_watchlist') {
      filters = {
        type: action.type ?? null,
        genre: normalizedGenre,
        yearGte: action.yearGte ?? null,
        yearLte: action.yearLte ?? null,
        runtimeLte: action.runtimeLte ?? null,
        sortBy: action.sortBy ?? null,
        order: action.order ?? null,
      };
    } else {
      return res.status(400).json({ message: 'Unsupported chat intent' });
    }

    const { where, orderBy } = buildWatchlistQuery({
      userId: req.userId,
      filters,
    });

    const items = await prisma.watchlistItem.findMany({
      where,
      orderBy,
    });

    return res.json({
      action,
      items: items.map(serializeWatchlistItem),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to process watchlist chat' });
  }
});

export default router;