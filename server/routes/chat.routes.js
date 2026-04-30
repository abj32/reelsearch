import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { parseWatchlistMessage } from '../services/chat.service.js';
import { normalizeWatchlistFilters, buildWatchlistQuery } from '../services/watchlistQuery.service.js';
import { serializeWatchlistItem } from '../utils/serializeWatchlistItem.util.js';

const router = Router();

router.post('/watchlist', requireAuth, async (req, res) => {
  try {
    const { message } = req.body ?? {};

    if (typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ message: 'message is required' });
    }

    // Send chat to OpenAI service
    const action = await parseWatchlistMessage(message.trim());

    let rawFilters = {};

    if (action.intent === 'sort_watchlist') {
      rawFilters = {
        sortBy: action.sortBy,
        order: action.order,
      };
    } else if (action.intent === 'filter_watchlist') {
      rawFilters = {
        type: action.type,
        genre: action.genre,

        yearGte: action.yearGte,
        yearLte: action.yearLte,
        runtimeLte: action.runtimeLte,

        sortBy: action.sortBy,
        order: action.order,
      };
    } else {
      return res.status(400).json({ message: 'Unsupported chat intent' });
    }

    // Call watchlist service to normalize optional filters
    let filters;
    try {
      filters = normalizeWatchlistFilters(rawFilters);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // Call watchlist service to build Prisma *where* and *orderBy*
    const { where, orderBy } = buildWatchlistQuery({
      userId: req.userId,
      filters,
    });

    // Query database
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