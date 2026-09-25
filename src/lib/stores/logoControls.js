import { writable } from 'svelte/store'

// "Reset" defaults offered in the settings panel — distinct from the hero's
// own opening look below, which is tuned to make a stronger first impression.
export const logoDefaults = {
	thickness: 0.5,
	spread: 3.2,
	speed: 2.8,
	layers: 10,
	scaleStep: -0.02,
	spreadTowards: true
}

export const logoControls = writable({
	thickness: 0.5,
	spread: 3.2,
	speed: 2.8,
	layers: 10,
	scaleStep: -0.02,
	spreadTowards: true
})

// riding the scroll pins the trail speed, so the panel hides that slider
export const logoScrollDriven = writable(false)

// bumped by the panel's "Replay intro" button; the hero watches for changes
export const logoReplayRequested = writable(0)

const STORAGE_KEY = 'logo-controls'

// Restores saved settings, then keeps them saved as the panel changes them.
// Client-only: called from the hero's onMount so SSR and hydration still see
// the defaults. Returns the unsubscribe function.
export function persistLogoControls() {
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
		const restored = {}
		for (const [key, fallback] of Object.entries(logoDefaults)) {
			const value = saved?.[key]
			if (typeof value !== typeof fallback) continue
			if (typeof value === 'number' && !Number.isFinite(value)) continue
			restored[key] = key === 'layers' ? Math.max(1, Math.round(value)) : value
		}
		logoControls.update((s) => ({ ...s, ...restored }))
	} catch {
		// unreadable storage or bad JSON — keep the defaults
	}

	let first = true
	return logoControls.subscribe((value) => {
		if (first) {
			first = false
			return
		}
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
		} catch {
			// storage unavailable — settings just won't persist
		}
	})
}
