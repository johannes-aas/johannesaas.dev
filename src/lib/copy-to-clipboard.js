export const COPIED_EVENT = 'clipboard:copied'

// execCommand first: it runs synchronously inside the tap, which iOS (in-app browsers especially)
// requires, and works on plain-http LAN dev. navigator.clipboard is the fallback.
export async function copyToClipboard(text) {
	try {
		if (!copyWithTextarea(text)) await navigator.clipboard.writeText(text)
		window.dispatchEvent(new CustomEvent(COPIED_EVENT))
		return true
	} catch {
		// clipboard unavailable or permission denied: stay silent rather than claim "copied"
		return false
	}
}

function copyWithTextarea(text) {
	const previousFocus = document.activeElement
	const textarea = document.createElement('textarea')
	textarea.value = text
	// readonly keeps the iOS keyboard from opening; fixed + transparent keeps the page from jumping
	textarea.setAttribute('readonly', '')
	textarea.style.position = 'fixed'
	textarea.style.opacity = '0'
	document.body.append(textarea)
	textarea.select()
	textarea.setSelectionRange(0, text.length)
	try {
		return document.execCommand('copy')
	} catch {
		return false
	} finally {
		textarea.remove()
		previousFocus?.focus({ preventScroll: true })
	}
}
