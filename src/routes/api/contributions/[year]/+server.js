import { error, json } from '@sveltejs/kit'
import { getYear } from 'date-fns'
import { getContributions } from '$lib/server/github.js'

// GitHub launched in 2008
const FIRST_YEAR = 2008

export async function GET({ params, fetch, setHeaders }) {
	const year = Number(params.year)
	const thisYear = getYear(new Date())
	if (!Number.isInteger(year) || year < FIRST_YEAR || year > thisYear) error(404)

	const contributions = await getContributions(fetch, year)
	if (!contributions) error(502)

	// a finished year doesn't change, so it can be cached for much longer than this one
	const maxAge = year === thisYear ? 60 * 60 * 24 : 60 * 60 * 24 * 30
	setHeaders({
		'cache-control': `public, max-age=3600, s-maxage=${maxAge}, stale-while-revalidate=${60 * 60 * 24 * 7}`
	})

	return json(contributions)
}
