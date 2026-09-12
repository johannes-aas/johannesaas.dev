<script>
	import {
		logoControls,
		logoDefaults,
		logoScrollDriven,
		logoReplayRequested
	} from '$lib/stores/logoControls'
	import Slider from '$lib/components/Slider.svelte'
	import { cn } from '$lib/utils'
	import WandSparkles from '@lucide/svelte/icons/wand-sparkles'
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw'
	import Play from '@lucide/svelte/icons/play'
	import Magnet from '@lucide/svelte/icons/magnet'
	import { Shuffle } from '@lucide/svelte'

	// natural height of the (always-mounted, fixed-width) content column, fed
	// into the panel's own height transition — measured off content that never
	// reflows, so the grow animation never shifts text mid-flight
	let panelHeight = 0

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
			decimals: 1,
			random: [0.2, 2]
		},
		{
			key: 'spread',
			label: 'Spread',
			group: 'form',
			min: 0,
			max: 10,
			step: 0.1,
			decimals: 1,
			random: [1, 10]
		},
		{
			key: 'layers',
			label: 'Layers',
			group: 'form',
			min: 1,
			max: 14,
			step: 1,
			decimals: 0,
			random: [1, 14]
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
			decimals: 1,
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

	export let open = false
	let container

	// Grows the panel rightward from the trigger's own left edge (horizontally),
	// clamped back on screen if that would overflow — the same "place it, then
	// shift back if it would overflow" idea Floating UI's shift() middleware
	// uses, computed directly against values we already have (panelHeight;
	// PANEL_WIDTH matches the open panel's own w-72 below) rather than asking
	// Floating UI to measure the real panel element. That doesn't work here: a
	// CSS `transition` makes `getBoundingClientRect()` report the panel's
	// *currently interpolating* size, not its target — so at the instant the
	// panel starts opening, Floating UI would always measure it still at its
	// closed 44×44, never the open size it's animating toward.
	//
	// Vertically it always grows centered on the trigger, even if that runs it
	// past the bottom of the screen or above the top of the current viewport
	// (the user can just scroll up to see it) — the only thing it's clamped
	// against is the actual top of the page (scroll position 0), since there's
	// nothing above that to scroll to.
	const PANEL_WIDTH = 304 // 18rem, in px — keep in sync with the open panel's w-72
	const EDGE_PADDING = 8

	let panelX = 0
	let panelY = 0

	function updatePosition() {
		if (!open || !container) return
		const rect = container.getBoundingClientRect()
		const targetWidth = Math.min(PANEL_WIDTH, window.innerWidth - EDGE_PADDING * 2)

		// ideal, pre-clamp position: left edge pinned to the trigger (grows
		// rightward), vertically centered on the trigger (grows both ways)
		const idealLeft = rect.left
		const idealTop = rect.top + rect.height / 2 - panelHeight / 2

		// clamp horizontally into the viewport, then convert back to
		// container-relative coordinates — what `left`/`top: Npx` mean for an
		// absolutely positioned child of `container`
		const maxLeft = window.innerWidth - targetWidth - EDGE_PADDING
		panelX = Math.min(Math.max(idealLeft, EDGE_PADDING), maxLeft) - rect.left

		// clamp vertically against the page's own top edge, not the viewport's —
		// idealTop is viewport-relative, so shift it into document space (adding
		// the scroll offset) before comparing it against the page's actual top
		const idealTopInDocument = idealTop + window.scrollY
		const clampedTopInDocument = Math.max(idealTopInDocument, EDGE_PADDING)
		panelY = clampedTopInDocument - window.scrollY - rect.top
	}

	// the icon sits 0.5rem inside the panel's own top-left corner — same
	// coordinate space as panelX/panelY, since both are absolute within container
	$: iconOpenTop = panelY + 1
	$: iconOpenLeft = panelX + 4

	function setValue(key, value) {
		logoControls.update((s) => ({ ...s, [key]: value }))
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
		// panelHeight and container are already known/measured independent of
		// `open`, so this can run synchronously, before Svelte even renders
		// the open state — no risk of a jump to a stale position
		if (value) updatePosition()
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

<svelte:window
	on:pointerdown={onWindowPointerDown}
	on:keydown={onWindowKeyDown}
	on:resize={updatePosition}
/>

{#snippet sliderRow(spec)}
	{@const disabled = spec.key === 'speed' && $logoScrollDriven}
	<Slider
		label={spec.label}
		min={spec.min}
		max={spec.max}
		step={spec.step}
		decimals={spec.decimals}
		bipolar={spec.bipolar}
		value={$logoControls[spec.key]}
		{disabled}
		on:change={(e) => setValue(spec.key, e.detail)}
		on:reset={() => resetOne(spec.key)}
	/>
{/snippet}

<div class="relative h-11 w-11 rounded-sm" bind:this={container}>
	<div
		class={cn(
			'absolute z-10 overflow-hidden rounded-sm border border-transparent bg-transparent transition-[top,left,width,height,border-color,background-color] duration-300 ease-in-out hover:border-border hover:bg-[color-mix(in_srgb,var(--panel-tint)_72%,transparent)] hover:backdrop-blur-[14px] hover:backdrop-saturate-[1.4]',
			open ? 'w-72 border-border bg-[color-mix(in_srgb,var(--panel-tint)_72%,transparent)]' : 'w-11'
		)}
		class:max-w-[calc(100vw-1.5rem)]={open}
		class:backdrop-blur-[14px]={open}
		class:backdrop-saturate-[1.4]={open}
		style="top:{open ? panelY + 'px' : '0'};left:{open ? panelX + 'px' : '0'};height:{open
			? panelHeight + 'px'
			: '2.75rem'}"
	>
		<div
			class="content flex w-[18rem] flex-col"
			bind:clientHeight={panelHeight}
			inert={!open}
			aria-hidden={!open}
		>
			<div class="flex h-11 items-center justify-between pl-12">
				<span class="text-md text-base-fg">Playground</span>
				<button
					class="flex h-full cursor-pointer items-center gap-1.5 border-l border-border px-5 text-[13px] text-muted transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--muted)_14%,transparent)]"
					on:click={reset}
					aria-label="Reset to defaults"
					title="Reset to defaults"
				>
					<RotateCcw class="h-3.5 w-3.5 stroke-2" aria-hidden="true" />
					<span>Reset</span>
				</button>
			</div>

			<div class="h-px bg-border"></div>

			<div class="flex flex-col gap-[10px] px-4 pt-[14px] pb-4">
				<span class="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">Form</span>
				{#each formSliders as spec (spec.key)}
					{@render sliderRow(spec)}
				{/each}
			</div>

			<div class="h-px bg-border"></div>

			<div class="flex flex-col gap-[10px] px-4 pt-[14px] pb-4">
				<span class="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
					Motion
				</span>
				{#each motionSliders as spec (spec.key)}
					{@render sliderRow(spec)}
				{/each}

				{#if !$logoScrollDriven}
					{@const { key, label, options } = spreadSegment}
					<div class="flex items-center gap-6">
						<span class="text-[13px] text-muted">
							{label}
						</span>
						<div role="radiogroup" aria-label={label} class="flex w-full">
							{#each options as option, i (option.label)}
								{@const selected = $logoControls[key] === option.value}
								<button
									type="button"
									role="radio"
									aria-checked={selected}
									class="w-full border py-1 text-center text-[13px] transition-colors duration-200"
									class:border-accent={selected}
									class:bg-accent={selected}
									class:text-base-bg={selected}
									class:border-border={!selected}
									class:bg-transparent={!selected}
									class:text-muted={!selected}
									on:click={() => handleSegment(key, option.value)}
								>
									{option.label}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<div class="flex border-t border-border">
				<button
					class="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 text-[13px] text-base-fg transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--muted)_14%,transparent)]"
					on:click={randomize}
				>
					<Shuffle class="h-3.5 w-3.5 stroke-2" aria-hidden="true" />
					<span>Randomize</span>
				</button>
				<button
					class="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 border-l border-border bg-accent text-[13px] text-base-bg transition-opacity duration-200 hover:opacity-90"
					on:click={replay}
				>
					<Play class="h-3.5 w-3.5 fill-current stroke-current" aria-hidden="true" />
					<span>Replay intro</span>
				</button>
			</div>
		</div>
	</div>

	<button
		class={cn(
			'absolute z-20 flex cursor-pointer items-center justify-center border border-transparent text-muted transition-[top,left,width,height,color,border-color,background-color] duration-300 ease-in-out hover:text-base-fg',
			open ? 'h-11 w-11 text-base-fg' : 'h-full w-full'
		)}
		class:hover:border-border={!open}
		class:hover:bg-[color-mix(in_srgb,var(--panel-tint)_72%,transparent)]={!open}
		class:hover:backdrop-blur-[14px]={!open}
		class:hover:backdrop-saturate-[1.4]={!open}
		style="top:{open ? iconOpenTop + 'px' : '0'};left:{open ? iconOpenLeft + 'px' : '0'}"
		on:click={() => setOpen(!open)}
		aria-label={open ? 'Close playground' : 'Open playground'}
		aria-expanded={open}
		title="Playground"
	>
		<WandSparkles
			class={cn(
				'h-7 w-7 flex-none stroke-[1.75] transition-transform duration-300 ease-in-out',
				open && 'scale-[0.83]'
			)}
			aria-hidden="true"
		/>
	</button>
</div>
