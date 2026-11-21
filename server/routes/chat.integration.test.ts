import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../db.js';
import { createApp, createUser, resetDb } from '../test/app.js';
import { mockOpenAIAction, mockOpenAIFailure, watchlistAction } from '../test/providers.js';

const app = createApp();

let user: Awaited<ReturnType<typeof createUser>>['user'];
let cookie: string;

beforeEach(async () => {
  await resetDb();
  ({ user, cookie } = await createUser());
});

afterAll(() => prisma.$disconnect());

const post = (body: unknown) => request(app).post('/api/chat/watchlist').set('Cookie', cookie).send(body as object);

describe('POST /api/chat/watchlist', () => {
  it('applies a filter action to the user\'s watchlist', async () => {
    await prisma.watchlistItem.createMany({
      data: [
        { userId: user.id, imdbId: 'tt1', title: 'A', type: 'movie' },
        { userId: user.id, imdbId: 'tt2', title: 'B', type: 'series' },
      ],
    });
    const action = watchlistAction({ type: 'series' });
    mockOpenAIAction(action);

    const res = await post({ message: 'show me my series' });

    expect(res.status).toBe(200);
    expect(res.body.action).toEqual(action);
    expect(res.body.items.map((i: { imdbID: string }) => i.imdbID)).toEqual(['tt2']);
  });

  it('applies a sort action', async () => {
    await prisma.watchlistItem.createMany({
      data: [
        { userId: user.id, imdbId: 'tt1', title: 'B', type: 'movie' },
        { userId: user.id, imdbId: 'tt2', title: 'A', type: 'movie' },
      ],
    });
    mockOpenAIAction(watchlistAction({ intent: 'sort_watchlist', sortBy: 'title', order: 'asc' }));

    const res = await post({ message: 'sort by title' });

    expect(res.status).toBe(200);
    expect(res.body.items.map((i: { title: string }) => i.title)).toEqual(['A', 'B']);
  });

  it('returns 400 for a missing or blank message', async () => {
    for (const body of [{}, { message: '   ' }]) {
      const res = await post(body);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('CHAT_MESSAGE_REQUIRED');
    }
  });

  it('returns 500 when OpenAI fails', async () => {
    mockOpenAIFailure();

    const res = await post({ message: 'show me movies' });

    expect(res.status).toBe(500);
    expect(res.body.code).toBe('WATCHLIST_CHAT_FAILED');
  });

  it('returns 400 when the model returns filters that fail validation', async () => {
    mockOpenAIAction(watchlistAction({ yearGte: 2010, yearLte: 2000 }));

    const res = await post({ message: 'movies from 2010 to 2000' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('CHAT_INVALID_WATCHLIST_FILTERS');
  });

  it('requires a session', async () => {
    const res = await request(app).post('/api/chat/watchlist').send({ message: 'hi' });
    expect(res.status).toBe(401);
  });
});
