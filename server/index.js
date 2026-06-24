import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import searchRoutes from './routes/search.routes.js';
import watchlistRoutes from './routes/watchlist.routes.js';

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
].filter(Boolean);

const previewOriginRegex = process.env.VERCEL_PREVIEW_ORIGIN_REGEX
  ? new RegExp(process.env.VERCEL_PREVIEW_ORIGIN_REGEX)
  : null;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        previewOriginRegex?.test(origin);

      callback(
        isAllowed ? null : new Error(`CORS blocked origin: ${origin}`),
        isAllowed
      );
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/watchlist', watchlistRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
