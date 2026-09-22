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
	import Settings from '@lucide/svelte/icons/settings'
	import X from '@lucide/svelte/icons/x'
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw'
	import Play from '@lucide/svelte/icons/play'
	import Magnet from '@lucide/svelte/icons/magnet'
	import { Shuffle } from '@lucide/svelte'
	import { tick } from 'svelte'

	// natural height of the (always-mounted, fixed-width) content column, fed
	// into the panel's own height transition — measured off content that never
	// reflows, so the grow animation never shifts text mid-flight
	let panelHeight = $state(0)

	// `random` narrows the slider's full range to the part worth landing on —
	// a randomized thickness of 0 or a single layer is just a broken-looking logo
	const formSliders = [
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
			key: 'thickness',
			label: 'Thickness',
			min: 0.2,
			max: 3,
			step: 0.05,
			decimals: 1,
			random: [0.2, 2]
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
	let trigger = $state(null)

	// Grows the panel leftward from the trigger's own right edge (horizontally),
	// clamped back on screen if that would overflow — the same "place it, then
	// shift back if it would overflow" idea Floating UI's shift() middleware
	// uses, computed directly against values we already have (panelHeight;
	// PANEL_WIDTH matches the open panel's own w-72 below) rather than asking
	// Floating UI to measure the real panel element. That doesn't work here: a
	// CSS `transition` makes `getBoundingClientRect()` report the panel's
	// *currently interpolating* size, not its target — so at the instant the
	// panel starts opening, Floating UI would always measure it still at its
	// closed size, never the open size it's animating toward.
	//
	// Vertically it always grows downward from the trigger's own top edge, even
	// if that runs it past the bottom of the screen (the user can just scroll
	// down to see it) — the only thing it's clamped against is the actual top
	// of the page (scroll position 0), since there's nothing above that to
	// scroll to.
	const PANEL_WIDTH = 288 // 18rem, in px — keep in sync with the open panel's w-72
	const EDGE_PADDING = 8

	let panelX = $state(0)
	let panelY = $state(0)
	let panelWidth = $state(0)

	function updatePosition() {
		if (!open || !container) return
		const rect = container.getBoundingClientRect()
		const targetWidth = Math.min(PANEL_WIDTH, window.innerWidth - EDGE_PADDING * 2)
		panelWidth = targetWidth

		// ideal, pre-clamp position: right edge pinned to the trigger (grows
		// leftward), top edge pinned to the trigger (grows downward)
		const idealLeft = rect.right - targetWidth
		const idealTop = rect.top

		// clamp against the left edge only — the trigger sits flush with the
		// right edge of the screen, so the panel stays flush with it too — then
		// convert back to container-relative coordinates — what `left`/`top: Npx`
		// mean for an absolutely positioned child of `container`
		panelX = Math.max(idealLeft, EDGE_PADDING) - rect.left

		// clamp vertically against the page's own top edge, not the viewport's —
		// idealTop is viewport-relative, so shift it into document space (adding
		// the scroll offset) before comparing it against the page's actual top
		const idealTopInDocument = idealTop + window.scrollY
		const clampedTopInDocument = Math.max(idealTopInDocument, EDGE_PADDING)
		panelY = clampedTopInDocument - window.scrollY - rect.top
	}

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
			// the trigger is inert until the close renders, so wait for it
			tick().then(() => trigger?.focus())
		}
	}
</script>

<svelte:window
	onpointerdown={onWindowPointerDown}
	onkeydown={onWindowKeyDown}
	onresize={updatePosition}
/>

{#snippet sliderRow(spec)}
	<Slider
		label={spec.label}
		min={spec.min}
		max={spec.max}
		step={spec.step}
		decimals={spec.decimals}
		bipolar={spec.bipolar}
		value={$logoControls[spec.key]}
		onchange={(v) => setValue(spec.key, v)}
		onreset={() => resetOne(spec.key)}
	/>
{/snippet}

<div class="relative h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem]" bind:this={container}>
	<div
		class={[
			'absolute z-10 overflow-hidden border transition-[top,left,width,height,background-color] duration-300 ease-in-out',
			open
				? 'w-72 max-w-[calc(100vw-1.5rem)] border-border-subtle bg-panel-bg'
				: 'h-14 w-14 border-border-subtle bg-base-bg sm:h-[4.5rem] sm:w-[4.5rem]'
		]}
		style="top:{open ? panelY + 'px' : '0'};left:{open ? panelX + 'px' : '0'}{open
			? ';height:' + panelHeight + 'px'
			: ''}"
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
			<div class="flex h-13 items-stretch justify-between">
				<Button
					class="h-full w-1/2 border-r border-border-subtle text-sm text-muted transition-colors duration-200 hover:text-base-fg"
					onclick={randomize}
				>
					<Shuffle class="h-3.5 w-3.5 stroke-2" aria-hidden="true" />
					<span>Randomize</span>
				</Button>
				<Button
					class="w-[calc(3.5rem+1px)] border-l border-border-subtle text-muted transition-colors duration-200 hover:text-base-fg sm:w-[calc(4.5rem+1px)]"
					onclick={() => setOpen(false)}
					aria-label="Close logo settings"
				>
					<X class="h-5 w-5 stroke-[1.75]" aria-hidden="true" />
				</Button>
			</div>

			<div class="h-px bg-border-subtle"></div>

			<div class="flex flex-col gap-2.5 px-4 pt-3.5 pb-4">
				<span class="font-mono text-xs tracking-[0.16em] text-muted uppercase">Form</span>
				{#each formSliders as spec (spec.key)}
					{@render sliderRow(spec)}
				{/each}
			</div>

			{#if !$logoScrollDriven}
				<div class="h-px bg-border-subtle"></div>

				<div class="flex flex-col gap-2.5 px-4 pt-3.5 pb-4">
					<span class="font-mono text-xs tracking-[0.16em] text-muted uppercase"> Motion </span>
					{#each motionSliders as spec (spec.key)}
						{@render sliderRow(spec)}
					{/each}

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
				</div>
			{/if}

			<div class="flex border-t border-border-subtle">
				<Button
					class="h-13 flex-1 text-sm text-muted transition-colors duration-200 hover:text-base-fg"
					onclick={reset}
					aria-label="Reset to defaults"
					title="Reset to defaults"
				>
					<RotateCcw class="h-3.5 w-3.5 stroke-2" aria-hidden="true" />
					<span>Reset</span>
				</Button>
				<Button
					class="h-13 flex-1 border-l border-border-subtle text-sm text-muted transition-colors duration-200 hover:text-base-fg"
					onclick={replay}
				>
					<Play class="h-3.5 w-3.5 fill-current stroke-current" aria-hidden="true" />
					<span>Replay intro</span>
				</Button>
			</div>
		</div>
	</div>

	<Button
		bind:ref={trigger}
		class={[
			'absolute inset-0 z-20 text-muted transition-[opacity,color,background-color] duration-200 ease-in-out hover:text-base-fg',
			open && 'pointer-events-none opacity-0'
		]}
		onclick={() => setOpen(true)}
		aria-label="Open logo settings"
		aria-expanded={open}
		inert={open}
	>
		<Settings class="h-5 w-5 flex-none stroke-[1.75] sm:h-6 sm:w-6" aria-hidden="true" />
	</Button>
</div>
