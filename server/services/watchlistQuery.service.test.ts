import { describe, expect, it } from 'vitest';
import { buildWatchlistQuery, normalizeWatchlistFilters } from './watchlistQuery.service.js';

const currentYear = new Date().getFullYear();

describe('normalizeWatchlistFilters', () => {
  it('returns defaults for no input', () => {
    expect(normalizeWatchlistFilters()).toEqual({
      type: null,
      genre: null,
      yearGte: null,
      yearLte: null,
      runtimeLte: null,
      sortBy: 'createdAt',
      order: 'desc',
    });
  });

  it('trims and lowercases type and genre', () => {
    const f = normalizeWatchlistFilters({ type: ' Movie ', genre: ' Sci-Fi ' });
    expect(f.type).toBe('movie');
    expect(f.genre).toBe('sci-fi');
  });

  it('treats blank strings as no filter', () => {
    const f = normalizeWatchlistFilters({ type: ' ', genre: '', yearGte: '', runtimeLte: ' ' });
    expect(f).toMatchObject({ type: null, genre: null, yearGte: null, runtimeLte: null });
  });

  it('rejects an unknown type', () => {
    expect(() => normalizeWatchlistFilters({ type: 'podcast' })).toThrow('Invalid type filter');
  });

  it('accepts numbers and numeric strings for years and runtime', () => {
    const f = normalizeWatchlistFilters({ yearGte: '1999', yearLte: 2010, runtimeLte: '120' });
    expect(f).toMatchObject({ yearGte: 1999, yearLte: 2010, runtimeLte: 120 });
  });

  it.each([
    ['yearGte', 1888, true],
    ['yearGte', 1887, false],
    ['yearLte', currentYear + 10, true],
    ['yearLte', currentYear + 11, false],
  ])('%s = %i is valid: %s', (field, value, valid) => {
    const run = () => normalizeWatchlistFilters({ [field]: value });
    if (valid) expect(run).not.toThrow();
    else expect(run).toThrow(`${field} is invalid`);
  });

  it('rejects non-integer years and runtime', () => {
    expect(() => normalizeWatchlistFilters({ yearGte: '19.5' })).toThrow('yearGte must be an integer');
    expect(() => normalizeWatchlistFilters({ yearLte: 'abc' })).toThrow('yearLte must be an integer');
    expect(() => normalizeWatchlistFilters({ runtimeLte: 90.5 })).toThrow('runtimeLte must be an integer');
  });

  it('rejects a year range that is backwards but accepts equal years', () => {
    expect(() => normalizeWatchlistFilters({ yearGte: 2010, yearLte: 2000 })).toThrow(
      'yearGte cannot be greater than yearLte',
    );
    expect(() => normalizeWatchlistFilters({ yearGte: 2000, yearLte: 2000 })).not.toThrow();
  });

  it('requires runtimeLte above zero', () => {
    expect(() => normalizeWatchlistFilters({ runtimeLte: 0 })).toThrow('runtimeLte must be greater than 0');
    expect(normalizeWatchlistFilters({ runtimeLte: 1 }).runtimeLte).toBe(1);
  });

  describe('sorting', () => {
    it('falls back to createdAt for an unknown sort field', () => {
      expect(normalizeWatchlistFilters({ sortBy: 'popularity' }).sortBy).toBe('createdAt');
    });

    it.each([
      ['createdAt', 'desc'],
      ['imdbScore', 'desc'],
      ['sortScore', 'desc'],
      ['title', 'asc'],
      ['releaseYear', 'asc'],
      ['runtimeMins', 'asc'],
    ])('defaults %s to %s', (sortBy, order) => {
      expect(normalizeWatchlistFilters({ sortBy }).order).toBe(order);
    });

    it('honours an explicit order and ignores an invalid one', () => {
      expect(normalizeWatchlistFilters({ sortBy: 'title', order: 'desc' }).order).toBe('desc');
      expect(normalizeWatchlistFilters({ sortBy: 'title', order: 'sideways' }).order).toBe('asc');
    });
  });
});

describe('buildWatchlistQuery', () => {
  const none = normalizeWatchlistFilters();

  it('scopes to the user and sorts, with no other filters', () => {
    expect(buildWatchlistQuery({ userId: 7, filters: none })).toEqual({
      where: { userId: 7 },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('adds each filter to the where clause', () => {
    const filters = normalizeWatchlistFilters({
      type: 'movie',
      genre: 'Sci-Fi',
      yearGte: 1990,
      yearLte: 2000,
      runtimeLte: 120,
      sortBy: 'title',
    });
    expect(buildWatchlistQuery({ userId: 7, filters })).toEqual({
      where: {
        userId: 7,
        type: 'movie',
        genres: { has: 'sci-fi' },
        releaseYear: { gte: 1990, lte: 2000 },
        runtimeMins: { lte: 120 },
      },
      orderBy: { title: 'asc' },
    });
  });

  it('supports a one-sided year range', () => {
    const { where } = buildWatchlistQuery({
      userId: 1,
      filters: normalizeWatchlistFilters({ yearGte: 2000 }),
    });
    expect(where.releaseYear).toEqual({ gte: 2000, lte: undefined });
  });
});
