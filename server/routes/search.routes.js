import { Router } from 'express';
import { combinedSearch } from '../services/omdb.service.js';
import { normalizeSearchResult } from '../utils/normalizeSearchResult.js';

const router = Router();

router.get('/', async (req, res) => {
  const { q } = req.query;

  if (typeof q !== "string" || q.trim().length === 0) {
    return res.status(400).json({
      code: "INVALID_QUERY",
      message: "Query parameter 'q' is required",
    });
  }

  try {
    const movies = await combinedSearch(q.trim());
    return res.json(movies.map(normalizeSearchResult));
  } catch (err) {
    if (err.code === "TOO_MANY_RESULTS") {
      return res.status(400).json({
        code: "TOO_MANY_RESULTS",
        message: "Too many results",
      });
    }

    console.error("Search error:", err);

    return res.status(500).json({
      code: "SEARCH_REQUEST_FAILED",
      message: "Failed to fetch movies",
    });
  }
});

export default router;