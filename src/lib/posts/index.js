import { getLocale, baseLocale } from '$lib/paraglide/runtime'

const modules = import.meta.glob('./*/*.svx', { eager: true })

const byLocale = {}
for (const [path, module] of Object.entries(modules)) {
	const [, locale, file] = path.split('/')
	byLocale[locale] ??= {}
	byLocale[locale][file.replace('.svx', '')] = {
		slug: file.replace('.svx', ''),
		meta: module.metadata,
		component: module.default
	}
}

export const getPosts = () => {
	const merged = { ...byLocale[baseLocale], ...byLocale[getLocale()] }
	return Object.values(merged).sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date))
}
