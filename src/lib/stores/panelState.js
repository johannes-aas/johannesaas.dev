import { writable } from 'svelte/store'

// count of currently-open header panels (theme switcher, logo settings) —
// a count rather than a boolean since both can be open at once
export const openPanelCount = writable(0)
