// ordered lightest to darkest; keep in sync with the inline script in src/app.html
export const themeIds = ['theme-1', 'theme-2', 'theme-3', 'theme-4', 'theme-5', 'theme-6']

export const theme = $state({ index: 0 })

// the 600ms fade in theme.css, plus a little margin
const FADE_MS = 700
let fadeTimer

export function initTheme() {
	const saved = themeIds.indexOf(localStorage.getItem('theme'))
	const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches
		? themeIds.length - 1
		: 0
	applyTheme(saved === -1 ? preferred : saved, false)
}

export function setTheme(i) {
	if (i === theme.index) return
	localStorage.setItem('theme', themeIds[i])
	applyTheme(i)
}

function applyTheme(i, animate = true) {
	theme.index = i
	if (!animate) return swapTheme()

	const html = document.documentElement
	// hold the old color-scheme until the fade ends: flipping it as the transitions start makes
	// Chrome restart them every frame, so text crawls to grey and then snaps
	html.style.colorScheme ||= getComputedStyle(html).colorScheme
	html.classList.add('theme-transition')
	swapTheme()
	clearTimeout(fadeTimer)
	fadeTimer = setTimeout(() => {
		html.classList.remove('theme-transition')
		html.style.removeProperty('color-scheme')
	}, FADE_MS)
}

function swapTheme() {
	const html = document.documentElement
	html.classList.remove(...themeIds)
	html.classList.add(themeIds[theme.index])
	syncThemeColor(html)
}

// mobile browsers tint their chrome from <meta name="theme-color">, which CSS can't reach
function syncThemeColor(html) {
	const meta = document.querySelector('meta[name="theme-color"]')
	if (!meta) return
	const bg = getComputedStyle(html).getPropertyValue('--color-body').trim()
	if (bg) meta.setAttribute('content', bg)
}
