<script>
	import {
		logoControls,
		logoDefaults,
		logoScrollDriven,
		logoReplayRequested
	} from '$lib/stores/logoControls'
	import Slider from '$lib/components/Slider.svelte'
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
	// PANEL_WIDTH matches .morph-panel.open's width below) rather than asking
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
	const PANEL_WIDTH = 304 // 18rem, in px — keep in sync with .morph-panel.open
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

<div class="relative h-11 w-11" bind:this={container}>
	<div
		class="morph-panel absolute z-10 overflow-hidden hover:border-[var(--border)]"
		class:open
		class:border-[var(--border)]={open}
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
				<span class="text-md color-[var(--base-fg)]">Playground</span>
				<button
					class="flex h-full cursor-pointer items-center gap-1.5 px-5 text-[13px] border-l border-[var(--border)] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--muted)_14%,transparent)]"
					style="color:var(--muted)"
					on:click={reset}
					aria-label="Reset to defaults"
					title="Reset to defaults"
				>
					<RotateCcw class="h-3.5 w-3.5 stroke-2" aria-hidden="true" />
					<span>Reset</span>
				</button>
			</div>

			<div class="h-px" style="background:var(--border)"></div>

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
					style="color:var(--muted)"
				>
						Motion
				</span>
				{#each motionSliders as spec (spec.key)}
					{@render sliderRow(spec)}
				{/each}

				{#if !$logoScrollDriven}
					{@const { key, label, options } = spreadSegment}
					<div class="flex items-center gap-6">
						<span class="text-[13px]" style="color:var(--muted)">
							{label}
						</span>
						<div
							role="radiogroup"
							aria-label={label}
							class="flex w-full"
						>
							{#each options as option, i (option.label)}
								<button
									type="button"
									role="radio"
									aria-checked={$logoControls[key] === option.value}
									class="w-full py-1 text-center text-[13px] transition-colors duration-200 border"
									style="border-color:{$logoControls[key] === option.value
										? 'var(--accent)'
										: 'var(--border)'};
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
					<Shuffle class="h-3.5 w-3.5 stroke-2" aria-hidden="true" />
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
	</div>

	<button
		class="icon-btn absolute z-20 flex cursor-pointer items-center justify-center text-[var(--muted)] transition-[top,left,width,height,color,border-color,background-color] duration-300 ease-in-out hover:text-[var(--base-fg)]"
		class:open
		class:text-[var(--base-fg)]={open}
		class:hover:border-[var(--border)]={!open}
		style="top:{open ? iconOpenTop + 'px' : '0'};left:{open ? iconOpenLeft + 'px' : '0'}"
		on:click={() => setOpen(!open)}
		aria-label={open ? 'Close playground' : 'Open playground'}
		aria-expanded={open}
		title="Playground"
	>
		<WandSparkles
			class="h-7 w-7 flex-none stroke-[1.75] transition-transform duration-300 ease-in-out {open
				? 'scale-[0.83]'
				: ''}"
			aria-hidden="true"
		/>
	</button>
</div>

<style>
	/* same recipe as the shared .control-panel look (see globals.css) — sharp
	   corners throughout, matching the trigger button's own square edges.
	   Ghost by default: no border/background until hovered or open, so the
	   trigger only reveals its "panel" chrome on interaction. --panel-tint is
	   defined on both .morph-panel and .icon-btn directly (they're siblings,
	   not nested) so each has it available for its own hover chrome below. */
	.morph-panel,
	.icon-btn {
		--panel-tint: color-mix(in srgb, var(--base-bg) 88%, #000);
	}

	:global(.theme-5) .morph-panel,
	:global(.theme-5) .icon-btn,
	:global(.theme-6) .morph-panel,
	:global(.theme-6) .icon-btn,
	:global(.theme-7) .morph-panel,
	:global(.theme-7) .icon-btn,
	:global(.theme-8) .morph-panel,
	:global(.theme-8) .icon-btn {
		--panel-tint: color-mix(in srgb, var(--base-bg) 82%, #fff);
	}

	.morph-panel {
		top: 0;
		left: 0;
		width: 2.75rem;
		border-radius: 0;
		border: 1px solid transparent;
		background-color: transparent;
		/* cubic-bezier(0.4, 0, 0.2, 1) is what Tailwind's `ease-in-out` utility
		   (used on .icon-btn below) actually resolves to — it's a different
		   curve than the plain CSS `ease-in-out` keyword. Spelling it out here
		   keeps the panel and the icon on the exact same curve. top/left are
		   Floating UI's collision-corrected position (see updatePosition) —
		   animating them too means the shrink-back-on-overflow reads as a
		   smooth part of the same motion, not a separate snap. */
		transition:
			top 300ms cubic-bezier(0.4, 0, 0.2, 1),
			left 300ms cubic-bezier(0.4, 0, 0.2, 1),
			width 300ms cubic-bezier(0.4, 0, 0.2, 1),
			height 300ms cubic-bezier(0.4, 0, 0.2, 1),
			border-color 300ms cubic-bezier(0.4, 0, 0.2, 1),
			background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.morph-panel.open,
	.morph-panel:hover {
		background-color: color-mix(in srgb, var(--panel-tint) 72%, transparent);
		backdrop-filter: blur(14px) saturate(1.4);
	}

	.morph-panel.open {
		width: 18rem;
		/* belt-and-braces fallback for the instant before JS has measured and
		   positioned it — Floating UI's own size() middleware (see script)
		   applies the precise, live-measured constraint once it runs. */
		max-width: calc(100vw - 1.5rem);
	}

	/* the button is a sibling of .morph-panel, not a child of it — both sit
	   directly in the static 2.75rem outer wrapper. Sized as a percentage of
	   that wrapper (which never itself animates) so it always fills exactly,
	   border included. `top`/`left` are set inline (see iconOpenTop/Left in
	   the script): they track panelX/panelY, which Floating UI computes and
	   can shift at any time to avoid overflow, so they can't be static here. */
	.icon-btn {
		width: 100%;
		height: 100%;
		justify-content: center;
		border: 1px solid transparent;
	}

	/* while closed, the button sits exactly over the (invisible) closed
	   panel — hovering it stands in for hovering the panel itself, so it
	   gets the same border/background/blur the open panel always shows */
	.icon-btn:not(.open):hover {
		background-color: color-mix(in srgb, var(--panel-tint) 72%, transparent);
		backdrop-filter: blur(14px) saturate(1.4);
	}

	.icon-btn.open {
		width: 2.75rem;
		height: 2.75rem;
	}
</style>
