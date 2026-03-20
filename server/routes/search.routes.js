import { Router } from 'express';
import { combinedSearch } from '../services/omdb.service.js';

const router = Router();

router.get('/', async (req, res) => {
  const { q } = req.query;

  if (typeof q !== "string" || q.trim().length === 0) {
    return res.status(400).json({
      message: "Query parameter 'q' is required",
      code: "INVALID_QUERY",
    });
  }

  try {
    const movies = await combinedSearch(q.trim());
    return res.json(movies);
  } catch (err) {
    console.error("Search error:", err);
    
    if (err.code === "TOO_MANY_RESULTS") {
      return res.status(400).json({
        message: "Too many results",
        code: "TOO_MANY_RESULTS",
      });
    }

    return res.status(500).json({
      message: "Failed to fetch movies",
      code: "SEARCH_REQUEST_FAILED",
    });
  }
});

export default router;