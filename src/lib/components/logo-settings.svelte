<script>
	import {
		logoControls,
		logoDefaults,
		logoScrollDriven,
		logoReplayRequested
	} from '$lib/stores/logoControls'
	import Slider from '$lib/components/slider.svelte'
	import { ToggleGroupRoot, ToggleGroupItem } from '$lib/components/toggle-group'
	import Button from '$lib/components/button.svelte'
	import WandSparkles from '@lucide/svelte/icons/wand-sparkles'
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw'
	import Play from '@lucide/svelte/icons/play'
	import Magnet from '@lucide/svelte/icons/magnet'
	import { Shuffle } from '@lucide/svelte'

	// natural height of the (always-mounted, fixed-width) content column, fed
	// into the panel's own height transition — measured off content that never
	// reflows, so the grow animation never shifts text mid-flight
	let panelHeight = $state(0)

	// `random` narrows the slider's full range to the part worth landing on —
	// a randomized thickness of 0 or a single layer is just a broken-looking logo
	const formSliders = [
		{
			key: 'thickness',
			label: 'Thickness',
			min: 0.2,
			max: 3,
			step: 0.05,
			decimals: 1,
			random: [0.2, 2]
		},
		{
			key: 'spread',
			label: 'Spread',
			min: 0,
			max: 10,
			step: 0.1,
			decimals: 1,
			random: [1, 10]
		},
		{
			key: 'layers',
			label: 'Layers',
			min: 1,
			max: 14,
			step: 1,
			decimals: 0,
			random: [1, 14]
		},
		{
			key: 'scaleStep',
			label: 'Layer size step',
			min: -0.06,
			max: 0.06,
			step: 0.005,
			decimals: 3,
			bipolar: true,
			random: [-0.06, 0.06]
		}
	]

	const motionSliders = [
		{
			key: 'speed',
			label: 'Speed',
			min: 0.5,
			max: 10,
			step: 0.1,
			decimals: 1,
			random: [1, 8]
		}
	]

	// randomize()/resetOne() below iterate over every slider generically, regardless of group
	const sliders = [...formSliders, ...motionSliders]

	let { open = $bindable(false) } = $props()
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

	let panelX = $state(0)
	let panelY = $state(0)

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
	let iconOpenTop = $derived(panelY + 1)
	let iconOpenLeft = $derived(panelX + 4)

	function setValue(key, value) {
		logoControls.update((s) => ({ ...s, [key]: value }))
	}

	function resetOne(key) {
		setValue(key, logoDefaults[key])
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
	onpointerdown={onWindowPointerDown}
	onkeydown={onWindowKeyDown}
	onresize={updatePosition}
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
		onchange={(v) => setValue(spec.key, v)}
		onreset={() => resetOne(spec.key)}
	/>
{/snippet}

<div class="relative h-11 w-11" bind:this={container}>
	<div
		class={[
			'absolute z-10 overflow-hidden rounded-sm border transition-[top,left,width,height,border-color,background-color] duration-300 ease-in-out',
			open
				? 'w-72 max-w-[calc(100vw-1.5rem)] border-border bg-[color-mix(in_srgb,var(--panel-tint)_72%,transparent)] backdrop-blur-[14px] backdrop-saturate-[1.4]'
				: 'w-11 border-transparent bg-transparent hover:border-border hover:bg-[color-mix(in_srgb,var(--panel-tint)_72%,transparent)] hover:backdrop-blur-[14px] hover:backdrop-saturate-[1.4]'
		]}
		style="top:{open ? panelY + 'px' : '0'};left:{open ? panelX + 'px' : '0'};height:{open
			? panelHeight + 'px'
			: '2.75rem'}"
	>
		<div
			class={[
				'content flex w-72 flex-col transition-opacity duration-200 ease-in-out',
				open ? 'opacity-100 delay-100' : 'opacity-0'
			]}
			bind:clientHeight={panelHeight}
			inert={!open}
			aria-hidden={!open}
		>
			<div class="flex h-11 items-center justify-between pl-12">
				<span class="text-sm text-muted">Playground</span>
				<Button
					class="h-full border-l border-border px-5 text-sm text-muted transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--muted)_14%,transparent)]"
					onclick={reset}
					aria-label="Reset to defaults"
					title="Reset to defaults"
				>
					<RotateCcw class="h-3.5 w-3.5 stroke-2" aria-hidden="true" />
					<span>Reset</span>
				</Button>
			</div>

			<div class="h-px bg-border"></div>

			<div class="flex flex-col gap-2.5 px-4 pt-3.5 pb-4">
				<span class="font-mono text-xs tracking-[0.16em] text-muted uppercase">Form</span>
				{#each formSliders as spec (spec.key)}
					{@render sliderRow(spec)}
				{/each}
			</div>

			<div class="h-px bg-border"></div>

			<div class="flex flex-col gap-2.5 px-4 pt-3.5 pb-4">
				<span class="font-mono text-xs tracking-[0.16em] text-muted uppercase"> Motion </span>
				{#each motionSliders as spec (spec.key)}
					{@render sliderRow(spec)}
				{/each}

				{#if !$logoScrollDriven}
					<div class="flex items-center gap-6">
						<span class="text-sm text-muted">Spread</span>
						<ToggleGroupRoot
							label="Spread"
							value={$logoControls.spreadTowards ? 'follow' : 'avoid'}
							onValueChange={(v) => setValue('spreadTowards', v === 'follow')}
						>
							<ToggleGroupItem value="follow">Follow</ToggleGroupItem>
							<ToggleGroupItem value="avoid">Avoid</ToggleGroupItem>
						</ToggleGroupRoot>
					</div>
				{/if}
			</div>

			<div class="flex border-t border-border">
				<Button
					class="h-11 flex-1 text-sm text-muted transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--muted)_14%,transparent)]"
					onclick={randomize}
				>
					<Shuffle class="h-3.5 w-3.5 stroke-2" aria-hidden="true" />
					<span>Randomize</span>
				</Button>
				<Button
					class="h-11 flex-1 border-l border-border bg-accent text-sm text-base-bg transition-opacity duration-200 hover:opacity-90"
					onclick={replay}
				>
					<Play class="h-3.5 w-3.5 fill-current stroke-current" aria-hidden="true" />
					<span>Replay intro</span>
				</Button>
			</div>
		</div>
	</div>

	<Button
		class={[
			'absolute z-20 rounded-sm border border-transparent text-muted transition-[top,left,width,height,color,border-color,background-color] duration-300 ease-in-out hover:text-base-fg',
			open
				? 'h-11 w-11'
				: 'h-full w-full hover:border-border hover:bg-[color-mix(in_srgb,var(--panel-tint)_72%,transparent)] hover:backdrop-blur-[14px] hover:backdrop-saturate-[1.4]'
		]}
		style="top:{open ? iconOpenTop + 'px' : '0'};left:{open ? iconOpenLeft + 'px' : '0'}"
		onclick={() => setOpen(!open)}
		aria-label={open ? 'Close playground' : 'Open playground'}
		aria-expanded={open}
		title="Playground"
	>
		<WandSparkles
			class={[
				'h-7 w-7 flex-none stroke-[1.75] transition-transform duration-300 ease-in-out',
				open && 'scale-[0.7]'
			]}
			aria-hidden="true"
		/>
	</Button>
</div>
