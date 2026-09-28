<script>
	import { logoControls, logoDefaults, logoReplayRequested } from '$lib/stores/logoControls'
	import { finePointer } from '$lib/pointer.js'
	import { m } from '$lib/paraglide/messages'
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

	// measured off the fixed-width content so the grow animation never reflows text
	let panelHeight = $state(0)

	// `random` narrows the range the randomizer picks from
	const formSliders = [
		{
			key: 'spread',
			label: m.logo_spread(),
			min: 0,
			max: 10,
			step: 0.1,
			decimals: 1,
			random: [1, 10]
		},
		{
			key: 'layers',
			label: m.logo_layers(),
			min: 1,
			max: 14,
			step: 1,
			decimals: 0,
			random: [1, 14]
		},
		{
			key: 'thickness',
			label: m.logo_thickness(),
			min: 0.2,
			max: 3,
			step: 0.05,
			decimals: 1,
			random: [0.2, 2]
		},
		{
			key: 'scaleStep',
			label: m.logo_layer_step(),
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
			label: m.logo_speed(),
			min: 0.5,
			max: 10,
			step: 0.1,
			decimals: 1,
			random: [1, 8]
		}
	]

	const sliders = [...formSliders, ...motionSliders]

	let { open = $bindable(false) } = $props()
	let container
	let trigger = $state(null)

	// Positioned by hand, not Floating UI: mid-transition the panel measures at its
	// interpolating size. Grows left and down from the trigger, clamped to the page edges.
	const PANEL_WIDTH = 288 // keep in sync with w-72
	const EDGE_PADDING = 8

	let panelX = $state(0)
	let panelY = $state(0)
	let panelWidth = $state(0)

	function updatePosition() {
		if (!open || !container) return
		const rect = container.getBoundingClientRect()
		const targetWidth = Math.min(PANEL_WIDTH, window.innerWidth - EDGE_PADDING * 2)
		panelWidth = targetWidth

		const idealLeft = rect.right - targetWidth
		const idealTop = rect.top

		panelX = Math.max(idealLeft, EDGE_PADDING) - rect.left

		// clamp against the page's top, not the viewport's
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

<div class="relative size-14 sm:size-18" bind:this={container}>
	<div
		class={[
			'absolute z-10 overflow-hidden border transition-[top,left,width,height,background-color] duration-300 ease-in-out',
			open
				? 'w-72 max-w-[calc(100vw-1.5rem)] border-border-subtle bg-panel'
				: 'size-14 border-border-subtle bg-body sm:size-18'
		]}
		style:top={open ? `${panelY}px` : '0'}
		style:left={open ? `${panelX}px` : '0'}
		style:height={open ? `${panelHeight}px` : undefined}
	>
		<div
			class={[
				'flex w-72 flex-col transition-opacity duration-200 ease-in-out',
				open ? 'opacity-100 delay-100' : 'opacity-0'
			]}
			bind:clientHeight={panelHeight}
			inert={!open}
			aria-hidden={!open}
		>
			<div class="flex h-13 items-stretch justify-between">
				<Button
					class="h-full w-[calc(50%+1px)] border-r border-border-subtle text-sm text-fg hover:text-fg-strong"
					onclick={randomize}
				>
					<Shuffle class="size-3.5 stroke-2" aria-hidden="true" />
					<span>{m.logo_randomize()}</span>
				</Button>
				<Button
					class="w-[calc(--spacing(14)+1px)] border-l border-border-subtle text-fg hover:text-fg-strong sm:w-[calc(--spacing(18)+1px)]"
					onclick={() => setOpen(false)}
					aria-label={m.logo_settings_close()}
				>
					<X class="size-4 stroke-[1.75]" aria-hidden="true" />
				</Button>
			</div>

			<div class="h-px bg-border-subtle"></div>

			<div class="flex flex-col gap-2.5 px-4 pt-3.5 pb-4">
				<span class="font-mono text-xs tracking-[0.16em] text-fg-muted uppercase"
					>{m.logo_group_form()}</span
				>
				{#each formSliders as spec (spec.key)}
					{@render sliderRow(spec)}
				{/each}
			</div>

			{#if finePointer.current}
				<div class="h-px bg-border-subtle"></div>

				<div class="flex flex-col gap-2.5 px-4 pt-3.5 pb-4">
					<span class="font-mono text-xs tracking-[0.16em] text-fg-muted uppercase"
						>{m.logo_group_motion()}</span
					>
					{#each motionSliders as spec (spec.key)}
						{@render sliderRow(spec)}
					{/each}

					<div class="flex items-center gap-6">
						<span class="text-sm text-fg-muted">{m.logo_spread()}</span>
						<ToggleGroupRoot
							label={m.logo_spread()}
							value={$logoControls.spreadTowards ? 'follow' : 'avoid'}
							onValueChange={(v) => setValue('spreadTowards', v === 'follow')}
						>
							<ToggleGroupItem value="follow">{m.logo_follow()}</ToggleGroupItem>
							<ToggleGroupItem value="avoid">{m.logo_avoid()}</ToggleGroupItem>
						</ToggleGroupRoot>
					</div>
				</div>
			{/if}

			<div class="flex border-t border-border-subtle">
				<Button
					class="h-13 flex-1 text-sm text-fg hover:text-fg-strong"
					onclick={reset}
					aria-label={m.logo_reset_defaults()}
					title={m.logo_reset_defaults()}
				>
					<RotateCcw class="size-3.5 stroke-2" aria-hidden="true" />
					<span>{m.logo_reset()}</span>
				</Button>
				<Button
					class="h-13 flex-1 border-l border-border-subtle text-sm text-fg hover:text-fg-strong"
					onclick={replay}
				>
					<Play class="size-3.5 fill-current stroke-current" aria-hidden="true" />
					<span>{m.logo_replay()}</span>
				</Button>
			</div>
		</div>
	</div>

	<Button
		bind:ref={trigger}
		class={[
			'absolute inset-0 z-20 text-fg transition-[opacity,color,background-color] duration-200 ease-in-out hover:text-fg-strong',
			open && 'pointer-events-none opacity-0'
		]}
		onclick={() => setOpen(true)}
		aria-label={m.logo_settings_open()}
		aria-expanded={open}
		inert={open}
	>
		<Settings class="size-4 flex-none stroke-[1.75] sm:size-5" aria-hidden="true" />
	</Button>
</div>
