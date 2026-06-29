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

    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        code: "CHAT_MESSAGE_REQUIRED",
        message: "Message is required.",
      });
    }

    // Parse the user's natural-language request into a structured watchlist action.
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
      console.error("Invalid watchlist chat action:", action);

      return res.status(500).json({
        code: "CHAT_INVALID_ACTION",
        message: "Failed to process watchlist chat.",
      });
    }

    // Call watchlist service to normalize optional filters
    let filters;
    try {
      filters = normalizeWatchlistFilters(rawFilters);
    } catch (err) {
      return res.status(400).json({
        code: "CHAT_INVALID_WATCHLIST_FILTERS",
        message: err.message,
      });
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
    console.error("Watchlist chat error:", err);

    return res.status(500).json({
      code: "WATCHLIST_CHAT_FAILED",
      message: "Failed to process watchlist chat.",
    });
  }
});

export default router;