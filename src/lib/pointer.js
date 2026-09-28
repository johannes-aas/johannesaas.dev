import { MediaQuery } from 'svelte/reactivity'

// keep in sync with the fine-pointer variant in src/styles/base.css
export const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)'

// true on devices with a real cursor; false on touch and during SSR
export const finePointer = new MediaQuery(FINE_POINTER_QUERY, false)
