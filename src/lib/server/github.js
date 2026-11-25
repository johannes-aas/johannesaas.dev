import { formatISO, getYear } from 'date-fns'
import { env } from '$env/dynamic/private'

const LOGIN = 'johannes-aas'

const CALENDAR = `contributionCalendar {
	totalContributions
	weeks {
		contributionDays { date contributionCount contributionLevel weekday }
	}
}`

// the last year, with the years there is anything to pick from
const LAST_YEAR_QUERY = `query ($login: String!) {
	user(login: $login) {
		contributionsCollection { contributionYears ${CALENDAR} }
	}
}`

const YEAR_QUERY = `query ($login: String!, $from: DateTime!, $to: DateTime!) {
	user(login: $login) {
		contributionsCollection(from: $from, to: $to) { ${CALENDAR} }
	}
}`

const LEVELS = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE']

/*
	Contributions as Sunday-first weeks of 7 slots (null outside the range), or null on failure.
	Without a year it's the last year plus `years`, the years with contributions, latest first.
*/
export async function getContributions(fetch, year) {
	if (!env.GITHUB_TOKEN) {
		console.warn('GITHUB_TOKEN is not set, skipping the contribution graph')
		return null
	}

	// this year stops at today, so the days still to come don't show as empty
	const now = new Date()
	const to = year === getYear(now) ? formatISO(now) : `${year}-12-31T23:59:59Z`
	const variables = year ? { login: LOGIN, from: `${year}-01-01T00:00:00Z`, to } : { login: LOGIN }

	try {
		const response = await fetch('https://api.github.com/graphql', {
			method: 'POST',
			headers: {
				Authorization: `bearer ${env.GITHUB_TOKEN}`,
				'User-Agent': 'contribution-graph'
			},
			body: JSON.stringify({ query: year ? YEAR_QUERY : LAST_YEAR_QUERY, variables })
		})
		const { data, errors } = await response.json()
		if (!response.ok || errors) throw new Error(JSON.stringify(errors ?? response.status))

		const { contributionYears, contributionCalendar } = data.user.contributionsCollection

		return {
			total: contributionCalendar.totalContributions,
			weeks: contributionCalendar.weeks.map(({ contributionDays }) => {
				const week = Array(7).fill(null)
				for (const day of contributionDays) {
					week[day.weekday] = {
						date: day.date,
						count: day.contributionCount,
						level: LEVELS.indexOf(day.contributionLevel)
					}
				}
				return week
			}),
			...(contributionYears && { years: contributionYears })
		}
	} catch (error) {
		console.error('Failed to load GitHub contributions:', error)
		return null
	}
}
