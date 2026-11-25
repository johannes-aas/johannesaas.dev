import { getContributions } from '$lib/server/github.js'

// rendered on demand and cached on Vercel's CDN instead, so the graph stays fresh without redeploying
export const prerender = false

export async function load({ fetch, setHeaders }) {
	const contributions = await getContributions(fetch)

	// a failed fetch is only cached briefly, so the graph comes back soon after
	const maxAge = contributions ? 60 * 60 * 24 : 60 * 5
	setHeaders({
		'cache-control': `public, s-maxage=${maxAge}, stale-while-revalidate=${60 * 60 * 24 * 7}`
	})

	return { contributions }
}
