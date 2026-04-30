export function normalizeWatchlistFilters(filters = {}) {
	const { type, genre, yearGte, yearLte, runtimeLte, sortBy, order } = filters;

    // Optional type filter
    let normalizedType = null;
    if (typeof type === 'string' && type.trim() !== '') {
      normalizedType = type.trim().toLowerCase();

      const allowedTypes = new Set(['movie', 'series', 'game']);
      if (!allowedTypes.has(normalizedType)) {
        throw new Error('Invalid type filter');
      }
    }

	// Optional genre filter
    let normalizedGenre = null;
    if (typeof genre === 'string' && genre.trim() !== '') {
      normalizedGenre = genre.trim().toLowerCase();
    }

	// Optional year > or < filter
    const currentYear = new Date().getFullYear();

    const parsedYearGte =
      typeof yearGte === 'string' && yearGte.trim() !== ''
        ? Number(yearGte)
		: typeof yearGte === 'number'
    	? yearGte
        : null;

    if (parsedYearGte !== null) {
      if (!Number.isInteger(parsedYearGte)) {
        throw new Error('yearGte must be an integer');
      }

      if (parsedYearGte < 1888 || parsedYearGte > currentYear + 10) {   // Date of first film
        throw new Error('yearGte is invalid');
      }
    }

    const parsedYearLte =
      typeof yearLte === 'string' && yearLte.trim() !== ''
        ? Number(yearLte)
		: typeof yearLte === 'number'
    	? yearLte
        : null;

    if (parsedYearLte !== null) {
      if (!Number.isInteger(parsedYearLte)) {
        throw new Error('yearLte must be an integer');
      }

      if (parsedYearLte < 1888 || parsedYearLte > currentYear + 10) {   // Date of first film
        throw new Error('yearLte is invalid');
      }
    }

    if (parsedYearGte !== null && parsedYearLte !== null && parsedYearGte > parsedYearLte) {
      throw new Error('yearGte cannot be greater than yearLte');
    }

	// Optional runtime < filter
    const parsedRuntimeLte =
      typeof runtimeLte === 'string' && runtimeLte.trim() !== ''
        ? Number(runtimeLte)
		: typeof runtimeLte === 'number'
    	? runtimeLte
        : null;

    if (parsedRuntimeLte !== null) {
      if (!Number.isInteger(parsedRuntimeLte)) {
        throw new Error('runtimeLte must be an integer');
      }

      if (parsedRuntimeLte <= 0) {
        throw new Error('runtimeLte must be greater than 0');
      }
    }

	// Allowed sort fields
    const allowedSortFields = new Set([
      'createdAt',
      'title',
      'releaseYear',
	  'runtimeMins',
      'imdbScore',
      'rtScore',
      'mcScore',
      'sortScore',
    ]);

    const sortField =
      typeof sortBy === 'string' && allowedSortFields.has(sortBy)
        ? sortBy
        : 'createdAt';  // Default to *date added to watchlist*

    // Fields with descending order by default
    const defaultDescFields = new Set([
      'createdAt',
      'imdbScore',
      'rtScore',
      'mcScore',
      'sortScore',
    ]);

    const sortOrder =
      order === 'desc' || order === 'asc'
        ? order
        : defaultDescFields.has(sortField)
        ? 'desc'
        : 'asc';

	return {
        type: normalizedType,
        genre: normalizedGenre,

        yearGte: parsedYearGte,
        yearLte: parsedYearLte,
        runtimeLte: parsedRuntimeLte,

		sortBy: sortField,
		order: sortOrder,
    };
}

export function buildWatchlistQuery({ userId, filters }) {
	const { type, genre, yearGte, yearLte, runtimeLte, sortBy, order } = filters;

	const where = { userId };

	// --- Filtering ---
	if (type) where.type = type;    // type

	if (genre) where.genres = { has: genre };   // genre

	if (yearGte != null || yearLte != null) {   // year
		where.releaseYear = {};

		if (yearGte != null) where.releaseYear.gte = yearGte;
		if (yearLte != null) where.releaseYear.lte = yearLte;
	}

	if (runtimeLte != null) where.runtimeMins = { lte: runtimeLte };    // runtime

	const orderBy = { [sortBy]: order };

	return { where, orderBy };
}