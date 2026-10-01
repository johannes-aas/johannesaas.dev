import { formatDistanceToNowStrict } from 'date-fns'
import { enUS, nb } from 'date-fns/locale'
import { getLocale } from '$lib/paraglide/runtime'

const locales = { en: enUS, no: nb }

export function relativeTime(date) {
	return formatDistanceToNowStrict(date, {
		addSuffix: true,
		roundingMethod: 'floor',
		locale: locales[getLocale()]
	})
}
