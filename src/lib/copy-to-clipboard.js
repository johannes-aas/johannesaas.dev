export const COPIED_EVENT = 'clipboard:copied'

export async function copyToClipboard(text) {
	try {
		// navigator.clipboard only exists in secure contexts, so plain-http LAN dev needs the fallback
		if (navigator.clipboard) await navigator.clipboard.writeText(text)
		else if (!copyWithTextarea(text)) return false
		window.dispatchEvent(new CustomEvent(COPIED_EVENT))
		return true
	} catch {
		// clipboard unavailable or permission denied: stay silent rather than claim "copied"
		return false
	}
}

function copyWithTextarea(text) {
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
	} finally {
		textarea.remove()
	}
}
