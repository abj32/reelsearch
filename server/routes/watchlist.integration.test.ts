import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../db.js';
import { createApp, createUser, resetDb } from '../test/app.js';
import { mockCatalog, omdbDetails } from '../test/providers.js';

const app = createApp();

let user: Awaited<ReturnType<typeof createUser>>['user'];
let cookie: string;

beforeEach(async () => {
  await resetDb();
  ({ user, cookie } = await createUser());
});

afterAll(() => prisma.$disconnect());

const seed = (imdbId: string, data: Record<string, unknown> = {}, userId = user.id) =>
  prisma.watchlistItem.create({
    data: { userId, imdbId, title: `Title ${imdbId}`, type: 'movie', ...data },
  });

describe('auth', () => {
  it('rejects requests without a session', async () => {
    const res = await request(app).get('/api/watchlist');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('AUTH_REQUIRED');
  });
});

describe('POST /api/watchlist', () => {
  it('adds a title with details from the catalog provider', async () => {
    mockCatalog({ titles: { tt1375666: omdbDetails() } });

    const res = await request(app).post('/api/watchlist').set('Cookie', cookie).send({ imdbId: 'tt1375666' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      imdbID: 'tt1375666',
      title: 'Inception',
      type: 'movie',
      releaseYear: 2010,
      genres: ['action', 'adventure', 'sci-fi'],
      runtimeMins: 148,
      boxOfficeValue: '292587330',
      imdbScore: 88,
      sortScore: 83,
    });
    expect(await prisma.watchlistItem.count({ where: { userId: user.id } })).toBe(1);
  });

  it('stores missing provider fields ("N/A") as null', async () => {
    mockCatalog({
      titles: { tt1: omdbDetails({ imdbID: 'tt1', Poster: 'N/A', BoxOffice: 'N/A', Ratings: [] }) },
    });

    const res = await request(app).post('/api/watchlist').set('Cookie', cookie).send({ imdbId: 'tt1' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ poster: null, boxOfficeValue: null, sortScore: null });
  });

  it('returns 409 for a duplicate without calling the provider', async () => {
    await seed('tt1375666');
    const fetchMock = mockCatalog({ titles: {} });

    const res = await request(app).post('/api/watchlist').set('Cookie', cookie).send({ imdbId: 'tt1375666' });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('WATCHLIST_ITEM_EXISTS');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([[{}], [{ imdbId: '   ' }], [{ imdbId: 42 }]])('returns 400 for a missing or invalid id: %j', async (body) => {
    const res = await request(app).post('/api/watchlist').set('Cookie', cookie).send(body);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_IMDB_ID');
  });

  it('returns 500 and saves nothing when the provider is down', async () => {
    mockCatalog({ fails: true });

    const res = await request(app).post('/api/watchlist').set('Cookie', cookie).send({ imdbId: 'tt1375666' });

    expect(res.status).toBe(500);
    expect(res.body.code).toBe('WATCHLIST_ADD_FAILED');
    expect(await prisma.watchlistItem.count()).toBe(0);
  });

  it('returns 500 when the provider does not know the id', async () => {
    mockCatalog({ titles: {} });

    const res = await request(app).post('/api/watchlist').set('Cookie', cookie).send({ imdbId: 'tt0000000' });

    expect(res.status).toBe(500);
    expect(res.body.code).toBe('WATCHLIST_ADD_FAILED');
  });
});

describe('GET /api/watchlist', () => {
  it('lists only the signed-in user\'s items, newest first', async () => {
    const other = await createUser('other@example.com');
    await seed('tt1', { createdAt: new Date('2024-01-01') });
    await seed('tt2', { createdAt: new Date('2024-06-01') });
    await seed('tt3', {}, other.user.id);

    const res = await request(app).get('/api/watchlist').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.map((i: { imdbID: string }) => i.imdbID)).toEqual(['tt2', 'tt1']);
  });

  it('returns an empty list for an empty watchlist', async () => {
    const res = await request(app).get('/api/watchlist').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('filters by type, genre, year and runtime', async () => {
    await seed('tt1', { type: 'movie', genres: ['sci-fi'], releaseYear: 1999, runtimeMins: 136 });
    await seed('tt2', { type: 'movie', genres: ['drama'], releaseYear: 1999, runtimeMins: 100 });
    await seed('tt3', { type: 'series', genres: ['sci-fi'], releaseYear: 2015, runtimeMins: 50 });

    const ids = async (query: Record<string, string>) => {
      const res = await request(app).get('/api/watchlist').query(query).set('Cookie', cookie);
      expect(res.status).toBe(200);
      return res.body.map((i: { imdbID: string }) => i.imdbID).sort();
    };

    expect(await ids({ type: 'series' })).toEqual(['tt3']);
    expect(await ids({ genre: 'Sci-Fi' })).toEqual(['tt1', 'tt3']);
    expect(await ids({ yearGte: '2000' })).toEqual(['tt3']);
    expect(await ids({ yearLte: '1999' })).toEqual(['tt1', 'tt2']);
    expect(await ids({ runtimeLte: '100' })).toEqual(['tt2', 'tt3']);
    expect(await ids({ type: 'movie', genre: 'sci-fi', yearGte: '1990', runtimeLte: '140' })).toEqual(['tt1']);
  });

  it('sorts by the requested field and order', async () => {
    await seed('tt1', { title: 'B' });
    await seed('tt2', { title: 'A' });
    await seed('tt3', { title: 'C' });

    const res = await request(app).get('/api/watchlist').query({ sortBy: 'title', order: 'desc' }).set('Cookie', cookie);

    expect(res.body.map((i: { title: string }) => i.title)).toEqual(['C', 'B', 'A']);
  });

  it('returns 400 for an invalid filter', async () => {
    const res = await request(app).get('/api/watchlist').query({ type: 'podcast' }).set('Cookie', cookie);

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'INVALID_WATCHLIST_FILTERS', message: 'Invalid type filter' });
  });
});

describe('DELETE /api/watchlist/:imdbId', () => {
  it('deletes the item', async () => {
    await seed('tt1');

    const res = await request(app).delete('/api/watchlist/tt1').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(await prisma.watchlistItem.count()).toBe(0);
  });

  it('returns 404 when the item is not in the watchlist', async () => {
    const res = await request(app).delete('/api/watchlist/tt404').set('Cookie', cookie);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('WATCHLIST_ITEM_NOT_FOUND');
  });

  it('cannot delete another user\'s item', async () => {
    const other = await createUser('other@example.com');
    await seed('tt1', {}, other.user.id);

    const res = await request(app).delete('/api/watchlist/tt1').set('Cookie', cookie);

    expect(res.status).toBe(404);
    expect(await prisma.watchlistItem.count()).toBe(1);
  });
});
