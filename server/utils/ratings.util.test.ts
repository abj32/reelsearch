import { describe, expect, it } from 'vitest';
import { omdbDetails } from '../test/providers.js';
import { normalizeRatings, type OmdbRating } from './ratings.util.js';

const ratings = (d: Record<string, unknown>) => d.Ratings as OmdbRating[];

describe('normalizeRatings', () => {
  it('normalizes all three sources and averages them', () => {
    expect(normalizeRatings(ratings(omdbDetails()))).toEqual({
      imdbRaw: '8.8/10',
      rtRaw: '87%',
      mcRaw: '74/100',
      imdbScore: 88,
      rtScore: 87,
      mcScore: 74,
      sortScore: 83, // (88 + 87 + 74) / 3 = 83
    });
  });

  it('averages only the scores that are present', () => {
    const r = normalizeRatings([{ Source: 'Rotten Tomatoes', Value: '90%' }]);
    expect(r).toMatchObject({ rtScore: 90, imdbScore: null, mcScore: null, sortScore: 90 });
  });

  it('returns nulls for no ratings', () => {
    expect(normalizeRatings([])).toEqual({
      imdbRaw: null,
      rtRaw: null,
      mcRaw: null,
      imdbScore: null,
      rtScore: null,
      mcScore: null,
      sortScore: null,
    });
  });

  it('rounds the average to two decimals', () => {
    const r = normalizeRatings([
      { Source: 'Internet Movie Database', Value: '8.1/10' },
      { Source: 'Rotten Tomatoes', Value: '77%' },
      { Source: 'Metacritic', Value: '70/100' },
    ]);
    expect(r.sortScore).toBe(76); // (81 + 77 + 70) / 3 = 76
    const odd = normalizeRatings([
      { Source: 'Rotten Tomatoes', Value: '91%' },
      { Source: 'Metacritic', Value: '70/100' },
      { Source: 'Internet Movie Database', Value: '8.3/10' },
    ]);
    expect(odd.sortScore).toBe(81.33); // (91 + 70 + 83) / 3 = 81.333…
  });

  it('ignores sources it does not know', () => {
    const r = normalizeRatings([{ Source: 'Letterboxd', Value: '4/5' }]);
    expect(r.sortScore).toBeNull();
  });
});
