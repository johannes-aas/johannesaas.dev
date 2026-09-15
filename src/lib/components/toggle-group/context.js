import { getContext, setContext } from 'svelte'

const KEY = Symbol('toggle-group')

export function setToggleGroupContext(ctx) {
	setContext(KEY, ctx)
}

export function getToggleGroupContext() {
	const ctx = getContext(KEY)
	if (!ctx) throw new Error('ToggleGroup.Item must be used within ToggleGroup.Root')
	return ctx
}
