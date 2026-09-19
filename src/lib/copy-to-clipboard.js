export const COPIED_EVENT = 'clipboard:copied'

export async function copyToClipboard(text) {
	try {
		await navigator.clipboard.writeText(text)
		window.dispatchEvent(new CustomEvent(COPIED_EVENT))
	} catch {
		// clipboard unavailable or permission denied: stay silent rather than claim "copied"
	}
}
