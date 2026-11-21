import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import chatRoutes from '../routes/chat.routes.js';
import watchlistRoutes from '../routes/watchlist.routes.js';

// server/index.ts starts listening on import, so tests mount the routers themselves.
export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/chat', chatRoutes);
  app.use('/api/watchlist', watchlistRoutes);
  return app;
}

export async function resetDb() {
  await prisma.user.deleteMany(); // watchlist items cascade
}

export async function createUser(email = 'user@example.com') {
  const user = await prisma.user.create({ data: { email, passwordHash: 'not-a-real-hash' } });
  const cookie = `sid=${jwt.sign({ sub: String(user.id) }, process.env.JWT_SECRET!)}`;
  return { user, cookie };
}
