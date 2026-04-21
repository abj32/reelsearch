import { openai } from '../lib/openai.js';

const watchlistActionSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    intent: {
      type: 'string',
      enum: ['filter_watchlist', 'sort_watchlist'],
    },
    type: {
      type: ['string', 'null'],
      enum: ['movie', 'series', 'game', null],
    },
    genre: {
      type: ['string', 'null'],
    },
    yearGte: {
      type: ['integer', 'null'],
    },
    yearLte: {
      type: ['integer', 'null'],
    },
    runtimeLte: {
      type: ['integer', 'null'],
    },
    sortBy: {
      type: ['string', 'null'],
      enum: [
        'createdAt',
        'title',
        'releaseYear',
        'runtimeMins',
        'imdbScore',
        'rtScore',
        'mcScore',
        'sortScore',
        null,
      ],
    },
    order: {
      type: ['string', 'null'],
      enum: ['asc', 'desc', null],
    },
  },
  required: [
    'intent',
    'type',
    'genre',
    'yearGte',
    'yearLte',
    'runtimeLte',
    'sortBy',
    'order',
  ],
};

export async function parseWatchlistMessage(message) {
  const response = await openai.responses.create({
    model: 'gpt-5.4-mini',
    input: [
      {
        role: 'developer',
        content: [
          {
            type: 'input_text',
            text:
              'You convert watchlist chat requests into structured actions. ' +
              'Only use the supported intents and fields. Do not invent fields. ' +

              'Return one of two intents: "filter_watchlist" or "sort_watchlist". ' +

              'Use "filter_watchlist" when the user asks to filter, narrow, or view items. ' +
              'Use "sort_watchlist" when the user only asks to change sorting. ' +

              'For type filtering: ' +
              '- "movie" or "movies" -> type = "movie". ' +
              '- "show", "shows", "series", or "tv show" -> type = "series". ' +
              '- "game" or "games" -> type = "game". ' +
              '- If the user says "show" as a verb (e.g. "show me ...") or does not specify a type, set type to null. ' +
              '- If the user says "items", "everything", or "all", set type to null. ' +

              'For genre: return a single lowercase genre string if clearly specified (e.g. "sci-fi", "action"), otherwise null. ' +

              'For year and runtime: extract numeric values when present, otherwise null. ' +

              'For sorting: map user intent to supported fields (imdbScore, rtScore, mcScore, sortScore, createdAt, title, releaseYear, runtimeMins). ' +
              '- imdbScore = IMDb rating. ' +
              '- rtScore = Rotten Tomatoes score. ' +
              '- mcScore = Metacritic score. ' +
              '- sortScore = combined average critic score across sources. ' +
              '- If the user asks for "best", "top", or "highest rated" without specifying a source, use sortScore. ' +
              'Use "desc" by default for scores and dates unless the user specifies otherwise. ' +

              'If the user asks to "clear filters", "show all items", or "show everything", return intent "filter_watchlist" with all filter fields set to null. ' +

              'If a field is not explicitly requested, set it to null.',
          },
        ],
      },
      {
        role: 'user',
        content: [{ type: 'input_text', text: message }],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'watchlist_action',
        strict: true,
        schema: watchlistActionSchema,
      },
    },
  });

  return JSON.parse(response.output_text);
}