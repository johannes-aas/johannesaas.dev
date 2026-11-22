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

	// bits-ui binds `value`, so it gets a mirror of the controlled prop
	let internalValue = $derived(value)

	let dragging = $state(false)
	let moved = $state(false)

	// raw pointer position while dragging, so the fill glides regardless of `step`
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
	let growsLeft = $derived(bipolar && displayPercent < pct(0))
	let formatted = $derived(`${bipolar && value > 0 ? '+' : ''}${value.toFixed(decimals)}`)
	let motion = $derived([
		'ease-[cubic-bezier(0.34,1.56,0.64,1)]',
		dragging && moved ? 'duration-0' : 'duration-300'
	])

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

	// pointer capture on the root: bits-ui stops propagation of pointermove on document
	function onRootPointerDown(e) {
		if (disabled) return
		trackRect = e.currentTarget.getBoundingClientRect()
		e.currentTarget.setPointerCapture(e.pointerId)
		updateDragPercent(e.clientX)
		moved = false
		dragging = true
	}

	function onRootPointerMove(e) {
		if (!dragging) return
		moved = true
		updateDragPercent(e.clientX)
	}

	function endDrag() {
		dragging = false
		moved = false
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
	onpointerdown={onRootPointerDown}
	onpointermove={onRootPointerMove}
	onpointerup={endDrag}
	onpointercancel={endDrag}
	class={[
		'relative flex h-8 touch-none items-center justify-between overflow-hidden rounded-sm border border-border-subtle bg-inset px-3 transition-opacity duration-200 select-none',
		disabled && 'opacity-40'
	]}
>
	{#each ticks() as left (left)}
		<div class="absolute inset-y-2 w-px bg-border" style:left="{left}%"></div>
	{/each}
	<div
		class={[
			'absolute inset-y-0 bg-primary/80 transition-[left,width]',
			growsLeft ? 'rounded-l-sm' : 'rounded-r-sm',
			motion
		]}
		style:left="{fill.left}%"
		style:width="{fill.width}%"
	></div>
	{#if bipolar}
		<div class="absolute inset-y-0 w-px bg-border-strong" style:left="{pct(0)}%"></div>
	{/if}
	<SliderPrimitive.Thumb
		index={0}
		{disabled}
		aria-label={label}
		class="absolute inset-y-0 w-1 opacity-0"
	/>
	<span class="relative text-sm text-fg-strong">{label}</span>
	<span class="relative font-mono text-sm text-fg tabular-nums">{formatted}</span>
	<!-- ticks and text recoloured for the filled part, clipped to the fill -->
	<div
		aria-hidden="true"
		class={[
			'pointer-events-none absolute inset-0 flex items-center justify-between px-3 text-sm text-primary-fg transition-[clip-path] dark:text-fg-strong',
			motion
		]}
		style:clip-path="inset(0 {100 - fill.left - fill.width}% 0 {fill.left}%)"
	>
		{#each ticks() as left (left)}
			<div class="absolute inset-y-2 w-px bg-primary-fg/40" style:left="{left}%"></div>
		{/each}
		<span class="relative">{label}</span>
		<span class="relative font-mono tabular-nums">{formatted}</span>
	</div>
</SliderPrimitive.Root>
