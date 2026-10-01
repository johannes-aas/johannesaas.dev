import { format, formatDistanceToNowStrict } from 'date-fns'
import { enUS, nb } from 'date-fns/locale'
import { getLocale } from '$lib/paraglide/runtime'

const locales = { en: enUS, no: nb }
const locale = () => locales[getLocale()]

export function formatDate(date) {
	return format(date, 'PP', { locale: locale() })
}

export function formatDateTime(date) {
	return format(date, 'PPpp', { locale: locale() })
}

export function relativeTime(date) {
	return formatDistanceToNowStrict(date, {
		addSuffix: true,
		roundingMethod: 'floor',
		locale: locale()
	})
}
