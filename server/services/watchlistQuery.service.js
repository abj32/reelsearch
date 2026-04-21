export function buildWatchlistQuery({ userId, filters }) {
	const {
		type,
		genre,
		sortBy,
		order,
		yearGte,
		yearLte,
		runtimeLte,
	} = filters;

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

	// --- Sorting ---
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

	const sortField = allowedSortFields.has(sortBy)
		? sortBy
		: 'createdAt';

	const defaultDescFields = new Set([
		'imdbScore',
		'rtScore',
		'mcScore',
		'sortScore',
		'createdAt',
	]);

	const sortOrder =
		order === 'desc' || order === 'asc'
			? order
			: defaultDescFields.has(sortField)
			? 'desc'
			: 'asc';

	const orderBy = { [sortField]: sortOrder };

	return { where, orderBy };
}