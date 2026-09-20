<script>
	import { Slider as SliderPrimitive } from 'bits-ui'

	let {
		label,
		min,
		max,
		step = 1,
		decimals = 0,
		bipolar = false,
		value,
		disabled = false,
		onchange,
		onreset
	} = $props()

	// Slider.Root drives `value` itself (drag/keyboard) via a bindable prop, so
	// it needs its own mirror — kept in sync with the controlled `value` prop,
	// which only actually moves once the parent applies the dispatched change
	let internalValue = $derived(value)

	let hovered = $state(false)
	let dragging = $state(false)
	let active = $derived(hovered || dragging)

	// While dragging we track the raw pointer position (not step-snapped) so
	// the fill/thumb glide continuously under the cursor no matter how coarse
	// `step` is. bits-ui still snaps `value` itself in real time underneath;
	// on release we drop the raw position and let the visual position fall
	// back to the snapped value, animating there with a slight overshoot so
	// it visibly "snaps" to the nearest step.
	let trackRect = null
	let dragPercent = $state(null)

	function pct(v) {
		return ((v - min) / (max - min)) * 100
	}

	function fillFor(atPercent) {
		const zero = bipolar ? pct(0) : 0
		const lo = Math.min(atPercent, zero)
		const hi = Math.max(atPercent, zero)
		return { left: lo, width: hi - lo }
	}

	let displayPercent = $derived(dragging && dragPercent !== null ? dragPercent : pct(value))
	let fill = $derived(fillFor(displayPercent))

	// the thumb sits flush against the fill's moving edge rather than
	// straddling it — for a bipolar slider that edge is on the left once the
	// value drops below zero (fill grows leftward from the zero mark), so the
	// 4px-wide thumb (w-1) shifts to hug whichever side that is
	const THUMB_WIDTH = 4
	let thumbOffset = $derived(displayPercent < (bipolar ? pct(0) : 0) ? 0 : -THUMB_WIDTH)

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
</script>

<SliderPrimitive.Root
	type="single"
	bind:value={internalValue}
	{min}
	{max}
	{step}
	{disabled}
	thumbPositioning="exact"
	onValueChange={(v) => onchange?.(v)}
	ondblclick={disabled ? undefined : () => onreset?.()}
	onpointerenter={() => (hovered = true)}
	onpointerleave={() => (hovered = false)}
	onpointerdown={onRootPointerDown}
	onpointermove={onRootPointerMove}
	onpointerup={endDrag}
	onpointercancel={endDrag}
	class={[
		'relative flex h-9 touch-none items-center justify-between overflow-hidden rounded-sm border border-border-subtle bg-[color-mix(in_oklch,var(--panel-bg),var(--base-fg)_6%)] px-3 transition-opacity duration-200 select-none',
		disabled ? 'cursor-not-allowed opacity-40' : 'cursor-ew-resize'
	]}
>
	<div
		class={[
			'absolute inset-y-0 bg-[color-mix(in_srgb,var(--accent)_32%,transparent)] transition-[left,width] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
			dragging ? 'duration-0' : 'duration-300'
		]}
		style="left:{fill.left}%;width:{fill.width}%"
	></div>
	{#each ticks() as left}
		<div
			class="absolute top-2.5 bottom-2.5 w-px bg-border-subtle"
			style="left:{left}%"
		></div>
	{/each}
	{#if bipolar}
		<div class="absolute inset-y-0 w-px bg-[color-mix(in_oklch,var(--border)_60%,transparent)]" style="left:{pct(0)}%"></div>
	{/if}
	<SliderPrimitive.Thumb
		index={0}
		{disabled}
		aria-label={label}
		class="absolute inset-y-0 w-1 opacity-0"
	/>
	<div
		aria-hidden="true"
		class={[
			'pointer-events-none absolute inset-y-0 w-1 bg-accent transition-[left,opacity,transform] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
			active ? 'opacity-100' : 'opacity-0',
			dragging ? 'scale-y-[1.3] duration-0' : 'scale-y-100 duration-500'
		]}
		style="left:calc({displayPercent}% + {thumbOffset}px)"
	></div>
	<span class="relative text-sm text-base-fg">{label}</span>
	<span class="relative font-mono text-sm text-surface-fg [font-variant-numeric:tabular-nums]"
		>{bipolar && value > 0 ? '+' : ''}{value.toFixed(decimals)}</span
	>
</SliderPrimitive.Root>
