<script>
	import { onDestroy } from 'svelte'
	import { scale } from 'svelte/transition'
	import {
		logoControls,
		logoDefaults,
		logoScrollDriven,
		logoReplayRequested
	} from '$lib/stores/logoControls'
	import { openPanelCount } from '$lib/stores/panelState'
	import Settings from '@lucide/svelte/icons/settings'
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw'
	import Dices from '@lucide/svelte/icons/dices'
	import Play from '@lucide/svelte/icons/play'
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal'

	// `random` narrows the slider's full range to the part worth landing on —
	// a randomized thickness of 0 or a single layer is just a broken-looking logo
	const sliders = [
		{
			key: 'thickness',
			label: 'Thickness',
			group: 'form',
			min: 0,
			max: 3,
			step: 0.05,
			decimals: 2,
			random: [0.2, 2]
		},
		{
			key: 'spread',
			label: 'Spread',
			group: 'form',
			min: 0,
			max: 12,
			step: 0.1,
			decimals: 2,
			random: [1, 10]
		},
		{
			key: 'layers',
			label: 'Layers',
			group: 'form',
			min: 1,
			max: 16,
			step: 1,
			decimals: 0,
			random: [3, 14]
		},
		{
			key: 'scaleStep',
			label: 'Layer size step',
			group: 'form',
			min: -0.1,
			max: 0.1,
			step: 0.005,
			decimals: 3,
			bipolar: true,
			random: [-0.06, 0.06]
		},
		{
			key: 'speed',
			label: 'Speed',
			group: 'motion',
			min: 0.5,
			max: 10,
			step: 0.1,
			decimals: 2,
			random: [1, 8]
		}
	]

	const formSliders = sliders.filter((s) => s.group === 'form')
	const motionSliders = sliders.filter((s) => s.group === 'motion')

	const spreadSegment = {
		key: 'spreadTowards',
		label: 'Spread',
		options: [
			{ value: true, label: 'Follow' },
			{ value: false, label: 'Avoid' }
		]
	}

	let open = false
	let container
	let rowEls = {}
	let hoveredKey = null
	let draggingKey = null

	// the panel only shows while the hero logo is mounted, so it can be torn
	// down mid-open (e.g. navigating away) — release the scroll lock it holds
	onDestroy(() => {
		if (open) openPanelCount.update((n) => n - 1)
	})

	function ticksFor(spec) {
		const steps = Math.round((spec.max - spec.min) / spec.step)
		const n = steps <= 12 ? steps : 8
		const out = []
		for (let i = 1; i < n; i++) out.push((i / n) * 100)
		return out
	}

	function pct(spec, value) {
		return ((value - spec.min) / (spec.max - spec.min)) * 100
	}

	function fillFor(spec, value) {
		const at = pct(spec, value)
		const zero = spec.bipolar ? pct(spec, 0) : 0
		const lo = Math.min(at, zero)
		const hi = Math.max(at, zero)
		return { left: lo, width: hi - lo }
	}

	function setValue(key, value) {
		logoControls.update((s) => ({ ...s, [key]: value }))
	}

	function valueFromPointer(spec, clientX, rect) {
		const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
		const raw = spec.min + t * (spec.max - spec.min)
		const snapped = Math.round(raw / spec.step) * spec.step
		return Math.min(spec.max, Math.max(spec.min, Number(snapped.toFixed(6))))
	}

	function startDrag(spec) {
		return (event) => {
			if (event.button != null && event.button !== 0) return
			const row = rowEls[spec.key]
			if (!row) return
			draggingKey = spec.key
			const move = (ev) => {
				setValue(spec.key, valueFromPointer(spec, ev.clientX, row.getBoundingClientRect()))
			}
			move(event)
			const up = () => {
				draggingKey = null
				window.removeEventListener('pointermove', move)
				window.removeEventListener('pointerup', up)
			}
			window.addEventListener('pointermove', move)
			window.addEventListener('pointerup', up)
		}
	}

	function keyAdjust(spec) {
		return (event) => {
			const value = $logoControls[spec.key]
			if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
				event.preventDefault()
				setValue(spec.key, Math.min(spec.max, Number((value + spec.step).toFixed(6))))
			} else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
				event.preventDefault()
				setValue(spec.key, Math.max(spec.min, Number((value - spec.step).toFixed(6))))
			} else if (event.key === 'Home') {
				event.preventDefault()
				setValue(spec.key, spec.min)
			} else if (event.key === 'End') {
				event.preventDefault()
				setValue(spec.key, spec.max)
			}
		}
	}

	function resetOne(key) {
		setValue(key, logoDefaults[key])
	}

	function handleSegment(key, value) {
		setValue(key, value)
	}

	function randomize() {
		const next = { ...$logoControls }
		for (const { key, min, max, step, decimals, random } of sliders) {
			const [lo, hi] = random ?? [min, max]
			// snap to the slider's own step so the thumb lands on a real stop,
			// rounded to shake off the float noise the multiplication leaves behind
			const steps = Math.round((lo + Math.random() * (hi - lo)) / step)
			const value = Number((steps * step).toFixed(decimals))
			next[key] = Math.min(Math.max(value, min), max)
		}
		next.spreadTowards = Math.random() < 0.5
		logoControls.set(next)
	}

	function reset() {
		logoControls.set({ ...logoDefaults })
	}

	function replay() {
		logoReplayRequested.update((n) => n + 1)
	}

	function setOpen(value) {
		if (value === open) return
		open = value
		openPanelCount.update((n) => n + (value ? 1 : -1))
	}

	function onWindowPointerDown(event) {
		if (open && container && !container.contains(event.target)) setOpen(false)
	}

	function onWindowKeyDown(event) {
		if (open && event.key === 'Escape') {
			setOpen(false)
			container?.querySelector('button')?.focus()
		}
	}
</script>

<svelte:window on:pointerdown={onWindowPointerDown} on:keydown={onWindowKeyDown} />

{#snippet sliderRow(spec)}
	{@const disabled = spec.key === 'speed' && $logoScrollDriven}
	{@const value = $logoControls[spec.key]}
	{@const fill = fillFor(spec, value)}
	{@const active = hoveredKey === spec.key || draggingKey === spec.key}
	<div
		bind:this={rowEls[spec.key]}
		class="relative flex h-9 touch-none items-center justify-between overflow-hidden border px-3 transition-opacity duration-200 select-none"
		class:cursor-ew-resize={!disabled}
		class:cursor-not-allowed={disabled}
		class:opacity-40={disabled}
		style="background:var(--surface-bg);border-color:var(--border)"
		role="slider"
		tabindex={disabled ? -1 : 0}
		aria-label={spec.label}
		aria-valuemin={spec.min}
		aria-valuemax={spec.max}
		aria-valuenow={value}
		aria-disabled={disabled}
		on:pointerdown={disabled ? undefined : startDrag(spec)}
		on:dblclick={disabled ? undefined : () => resetOne(spec.key)}
		on:pointerenter={() => (hoveredKey = spec.key)}
		on:pointerleave={() => (hoveredKey = null)}
		on:keydown={disabled ? undefined : keyAdjust(spec)}
	>
		<div
			class="absolute inset-y-0"
			style="left:{fill.left}%;width:{fill.width}%;background:color-mix(in srgb, var(--accent) 22%, transparent)"
		></div>
		{#each ticksFor(spec) as left}
			<div
				class="absolute top-[10px] bottom-[10px] w-px"
				style="left:{left}%;background:color-mix(in srgb, var(--border) 70%, transparent)"
			></div>
		{/each}
		{#if spec.bipolar}
			<div class="absolute inset-y-0 w-px" style="left:{pct(spec, 0)}%;background:var(--border)"></div>
		{/if}
		<div
			class="absolute inset-y-0 w-[3px] transition-opacity duration-150"
			style="left:calc({pct(spec, value)}% - 1.5px);opacity:{active ? 1 : 0.55};background:var(--accent)"
		></div>
		<span class="relative text-sm" style="color:var(--base-fg)">{spec.label}</span>
		<span
			class="relative font-mono text-[13px] [font-variant-numeric:tabular-nums]"
			style="color:var(--surface-fg)"
			>{spec.bipolar && value > 0 ? '+' : ''}{value.toFixed(spec.decimals)}</span
		>
	</div>
{/snippet}

<div class="relative flex items-center justify-center" bind:this={container}>
	<button
		class="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-[var(--muted)] transition-[color,background-color,transform] duration-200 hover:bg-[color-mix(in_srgb,var(--muted)_14%,transparent)] hover:text-[var(--base-fg)] active:scale-[0.94]"
		class:text-[var(--base-fg)]={open}
		class:bg-[color-mix(in_srgb,var(--muted)_14%,transparent)]={open}
		on:click={() => setOpen(!open)}
		aria-label="Playground"
		aria-expanded={open}
		title="Playground"
	>
		<Settings class="h-6 w-6 stroke-[1.75]" aria-hidden="true" />
	</button>

	{#if open}
		<div class="control-panel absolute top-full right-0 z-50 mt-4 w-[19rem]" transition:scale={{ duration: 160, start: 0.9, opacity: 0 }}>
			<div class="flex items-stretch justify-between border-b" style="border-color:var(--border)">
				<div class="flex items-center gap-[9px] px-4" style="color:var(--base-fg)">
					<SlidersHorizontal class="h-[15px] w-[15px] stroke-2" aria-hidden="true" />
					<span class="text-sm">Playground</span>
				</div>
				<button
					class="flex h-11 cursor-pointer items-center gap-2 border-l px-4 text-[13px] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--muted)_14%,transparent)]"
					style="border-color:var(--border);color:var(--muted)"
					on:click={reset}
				>
					<RotateCcw class="h-3.5 w-3.5 stroke-2" aria-hidden="true" />
					<span>Reset</span>
				</button>
			</div>

			<div class="flex flex-col gap-[10px] px-4 pt-[14px] pb-4">
				<span
					class="font-mono text-[10px] tracking-[0.16em] uppercase"
					style="color:var(--muted)">Form</span
				>
				{#each formSliders as spec (spec.key)}
					{@render sliderRow(spec)}
				{/each}
			</div>

			<div class="h-px" style="background:var(--border)"></div>

			<div class="flex flex-col gap-[10px] px-4 pt-[14px] pb-4">
				<span
					class="font-mono text-[10px] tracking-[0.16em] uppercase"
					style="color:var(--muted)">Motion</span
				>
				{#each motionSliders as spec (spec.key)}
					{@render sliderRow(spec)}
				{/each}

				{#if !$logoScrollDriven}
					{@const { key, label, options } = spreadSegment}
					<div class="flex h-11 items-center justify-between gap-[14px]">
						<span class="flex-none text-[13px]" style="color:var(--muted)">{label}</span>
						<div
							class="flex flex-[0_0_66.6%] border"
							style="border-color:var(--border)"
							role="radiogroup"
							aria-label={label}
						>
							{#each options as option, i (option.label)}
								<button
									type="button"
									role="radio"
									aria-checked={$logoControls[key] === option.value}
									class="flex-1 cursor-pointer px-[10px] py-[9px] text-center text-[13px] transition-colors duration-200"
									class:border-l={i > 0}
									style="border-color:var(--border);
										background:{$logoControls[key] === option.value ? 'var(--accent)' : 'transparent'};
										color:{$logoControls[key] === option.value ? 'var(--base-bg)' : 'var(--muted)'}"
									on:click={() => handleSegment(key, option.value)}
								>
									{option.label}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<div class="flex border-t" style="border-color:var(--border)">
				<button
					class="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 text-[13px] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--muted)_14%,transparent)]"
					style="color:var(--base-fg)"
					on:click={randomize}
				>
					<Dices class="h-3.5 w-3.5 stroke-2" aria-hidden="true" />
					<span>Randomize</span>
				</button>
				<button
					class="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 border-l text-[13px] transition-opacity duration-200 hover:opacity-90"
					style="border-color:var(--border);background:var(--accent);color:var(--base-bg)"
					on:click={replay}
				>
					<Play class="h-3.5 w-3.5 fill-current stroke-current" aria-hidden="true" />
					<span>Replay intro</span>
				</button>
			</div>
		</div>
	{/if}
</div>
