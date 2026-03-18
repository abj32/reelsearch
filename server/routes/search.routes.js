import { Router } from 'express';
import { combinedSearch } from '../services/omdb.service.js';

const router = Router();

router.get('/', async (req, res) => {
  const { q } = req.query;

  if (typeof q !== "string" || q.trim().length === 0) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    const movies = await combinedSearch(q.trim());
    return res.json(movies);
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ error: "Failed to fetch movies" });
  }
});

export default router;