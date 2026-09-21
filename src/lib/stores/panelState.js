import { writable } from 'svelte/store'

// count of currently-open header panels (theme switcher, logo settings) —
// a count rather than a boolean since both can be open at once
export const openPanelCount = writable(0)

export const mobileMenuOpen = writable(false)

// true from a menu link click until the page-nav transition swaps the DOM,
// so the menu can stand in for `main` as the old page-content snapshot
export const menuNav = writable(false)
