import { writable } from 'svelte/store'

// "Reset" defaults offered in the settings panel — distinct from the hero's
// own opening look below, which is tuned to make a stronger first impression.
export const logoDefaults = {
  thickness: 0.5,
  spread: 3.2,
  speed: 2.8,
  layers: 10,
  scaleStep: 0.02,
  spreadTowards: true
}

export const logoControls = writable({
  thickness: 0.5,
  spread: 3.2,
  speed: 2.8,
  layers: 10,
  scaleStep: 0.02,
  spreadTowards: true
})

// riding the scroll pins the trail speed, so the panel hides that slider
export const logoScrollDriven = writable(false)

// the settings panel only makes sense while the hero logo is mounted
export const logoSettingsActive = writable(false)

// bumped by the panel's "Replay intro" button; the hero watches for changes
export const logoReplayRequested = writable(0)
