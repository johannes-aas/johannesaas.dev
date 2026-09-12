<script>
	import { createEventDispatcher } from 'svelte'
	import { Slider as SliderPrimitive } from 'bits-ui'
	import { cn } from '$lib/utils'

	export let label
	export let min
	export let max
	export let step = 1
	export let decimals = 0
	export let bipolar = false
	export let value
	export let disabled = false

	const dispatch = createEventDispatcher()

	// Slider.Root drives `value` itself (drag/keyboard) via a bindable prop, so
	// it needs its own mirror — kept in sync with the controlled `value` prop,
	// which only actually moves once the parent applies the dispatched change
	let internalValue = value
	$: internalValue = value

	let hovered = false
	let dragging = false
	$: active = hovered || dragging

	// While dragging we track the raw pointer position (not step-snapped) so
	// the fill/thumb glide continuously under the cursor no matter how coarse
	// `step` is. bits-ui still snaps `value` itself in real time underneath;
	// on release we drop the raw position and let the visual position fall
	// back to the snapped value, animating there with a slight overshoot so
	// it visibly "snaps" to the nearest step.
	let trackRect = null
	let dragPercent = null

	function pct(v) {
		return ((v - min) / (max - min)) * 100
	}

	function fillFor(atPercent) {
		const zero = bipolar ? pct(0) : 0
		const lo = Math.min(atPercent, zero)
		const hi = Math.max(atPercent, zero)
		return { left: lo, width: hi - lo }
	}

	$: displayPercent = dragging && dragPercent !== null ? dragPercent : pct(value)
	$: fill = fillFor(displayPercent)

	function ticks() {
		const steps = Math.round((max - min) / step)
		const n = steps <= 12 ? steps : 8
		const out = []
		for (let i = 1; i < n; i++) out.push((i / n) * 100)
		return out
	}

	function updateDragPercent(clientX) {
		if (!trackRect) return
		const raw = ((clientX - trackRect.left) / trackRect.width) * 100
		dragPercent = Math.min(100, Math.max(0, raw))
	}

	// bits-ui's own slider logic listens for pointermove on `document` and
	// calls stopPropagation() there, which would silence a window-level
	// listener (document is reached before window in the bubble phase). We
	// sidestep that by capturing the pointer on the root element itself —
	// captured pointer events keep targeting (and bubbling from) that
	// element no matter where the cursor travels, so our own pointermove
	// handler on the root fires before bits-ui's document handler ever gets
	// a chance to stop propagation.
	function onRootPointerDown(e) {
		if (disabled) return
		trackRect = e.currentTarget.getBoundingClientRect()
		e.currentTarget.setPointerCapture(e.pointerId)
		updateDragPercent(e.clientX)
		dragging = true
	}

	function onRootPointerMove(e) {
		if (!dragging) return
		updateDragPercent(e.clientX)
	}

	function endDrag() {
		dragging = false
		dragPercent = null
	}

	$: rootClass = cn(
		'relative flex h-9 touch-none items-center justify-between overflow-hidden border border-border bg-surface-bg px-3 transition-opacity duration-200 select-none',
		disabled ? 'cursor-not-allowed opacity-40' : 'cursor-ew-resize'
	)
</script>

<SliderPrimitive.Root
	type="single"
	bind:value={internalValue}
	{min}
	{max}
	{step}
	{disabled}
	thumbPositioning="exact"
	onValueChange={(v) => dispatch('change', v)}
	ondblclick={disabled ? undefined : () => dispatch('reset')}
	onpointerenter={() => (hovered = true)}
	onpointerleave={() => (hovered = false)}
	onpointerdown={onRootPointerDown}
	onpointermove={onRootPointerMove}
	onpointerup={endDrag}
	onpointercancel={endDrag}
	class={rootClass}
>
	<div
		class="absolute inset-y-0 bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] transition-[left,width] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
		class:duration-0={dragging}
		class:duration-300={!dragging}
		style="left:{fill.left}%;width:{fill.width}%"
	></div>
	{#each ticks() as left}
		<div
			class="absolute top-[10px] bottom-[10px] w-px bg-[color-mix(in_srgb,var(--border)_70%,transparent)]"
			style="left:{left}%"
		></div>
	{/each}
	{#if bipolar}
		<div class="absolute inset-y-0 w-px bg-border" style="left:{pct(0)}%"></div>
	{/if}
	<SliderPrimitive.Thumb
		index={0}
		{disabled}
		aria-label={label}
		class="absolute inset-y-0 w-[3px] opacity-0"
	/>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-y-0 w-[3px] bg-accent transition-[left,opacity,transform] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
		class:opacity-100={active}
		class:opacity-[0.55]={!active}
		class:scale-y-[1.3]={dragging}
		class:scale-y-100={!dragging}
		class:duration-[0ms,150ms,300ms]={dragging}
		class:duration-[300ms,150ms,300ms]={!dragging}
		style="left:calc({displayPercent}% - 1.5px)"
	></div>
	<span class="relative text-sm text-base-fg">{label}</span>
	<span
		class="relative font-mono text-[13px] text-surface-fg [font-variant-numeric:tabular-nums]"
		>{bipolar && value > 0 ? '+' : ''}{value.toFixed(decimals)}</span
	>
</SliderPrimitive.Root>
