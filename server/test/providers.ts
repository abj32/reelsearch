// The one place that knows what provider payloads look like. If a provider's
// shape changes, or the catalog swaps providers, edit this file, not the tests.
import { vi } from 'vitest';
import { openai } from '../lib/openai.js';
import type { WatchlistAction } from '../services/chat.service.js';

// --- Catalog (OMDb) ---

export type OmdbDetails = Record<string, unknown>;

export function omdbDetails(overrides: OmdbDetails = {}): OmdbDetails {
  return {
    Response: 'True',
    imdbID: 'tt1375666',
    Title: 'Inception',
    Type: 'movie',
    Year: '2010',
    Rated: 'PG-13',
    Runtime: '148 min',
    Genre: 'Action, Adventure, Sci-Fi',
    Language: 'English, Japanese',
    Director: 'Christopher Nolan',
    Actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt',
    Plot: 'A thief who steals secrets through dreams is offered a final job.',
    Poster: 'https://example.com/inception.jpg',
    BoxOffice: '$292,587,330',
    Ratings: [
      { Source: 'Internet Movie Database', Value: '8.8/10' },
      { Source: 'Rotten Tomatoes', Value: '87%' },
      { Source: 'Metacritic', Value: '74/100' },
    ],
    ...overrides,
  };
}

export const omdbNotFound = { Response: 'False', Error: 'Incorrect IMDb ID.' };

type CatalogMock =
  | { titles: Record<string, OmdbDetails> } // imdbId -> payload; unknown ids get "not found"
  | { fails: true }; // provider outage

/** Stubs the catalog provider's HTTP calls. Returns the fetch spy so tests can count calls. */
export function mockCatalog(mock: CatalogMock) {
  const fetchMock = vi.fn(async (input: URL | string) => {
    if ('fails' in mock) return new Response('provider down', { status: 500 });

    const id = new URL(input.toString()).searchParams.get('i') ?? '';
    return Response.json(mock.titles[id] ?? omdbNotFound);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

// --- OpenAI ---

export function watchlistAction(overrides: Partial<WatchlistAction> = {}): WatchlistAction {
  return {
    intent: 'filter_watchlist',
    type: null,
    genre: null,
    yearGte: null,
    yearLte: null,
    runtimeLte: null,
    sortBy: null,
    order: null,
    ...overrides,
  };
}

const create = () => vi.mocked(openai.responses.create);

export function mockOpenAIAction(action: WatchlistAction) {
  create().mockResolvedValue({ output_text: JSON.stringify(action) } as never);
}

export function mockOpenAIFailure() {
  create().mockRejectedValue(new Error('OpenAI is down'));
}
