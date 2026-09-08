<script>
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import {
		logoControls,
		logoScrollDriven,
		logoSettingsActive,
		logoReplayRequested
	} from '$lib/stores/logoControls'

	// user-tunable, see LogoSettings.svelte — driven by the shared store so the
	// settings panel (rendered from the header) can reach this component's state
	$: ({ thickness, spread, speed, layers, scaleStep, spreadTowards } = $logoControls)

	// time constant of the smoothing, in seconds (lower = snappier)
	$: smoothing = 1 / speed

	// PATHS[i] is revealed together with NAMES[i], so the two stay in step
	const PATHS = [
		// "Johannes" — the upright stroke down the left side
		'M71.5 0.5V118.152L0.5 188.797V94.5H15.5V0.5H71.5Z',
		// "Hansen" — the arm reaching into the top right
		'M132.125 0.5V10.25H145.875V0.5H188.809L146.518 43.6211H130.772V58.1035L88.5 102.744V0.5H132.125Z',
		// "Aas" — the wedge filling the bottom right
		'M199.5 199.5H147.375V187H102.918L90.418 199.5H13.707L199.5 13.707V199.5Z'
	]

	const NAMES = [
		// pairs with the left stroke
		{ text: 'Johannes', position: 'top-[15%] left-0 md:-left-[8%] lg:-left-[19%]' },
		// pairs with the top-right arm
		{ text: 'Hansen', position: 'top-[37%] left-[40%]' },
		// pairs with the bottom-right wedge
		{ text: 'Aas', position: 'top-[59%] right-0 md:-right-[6%] lg:-right-[10%]' }
	]

	// intro timeline, in ms
	// a beat of stillness before the first name, and long enough that the rewind
	// to the empty state gets painted before the CSS has anything to animate
	const INTRO_DELAY = 700
	const PATH_STAGGER = 620
	const LAYERS_DELAY = 2450
	const LAYER_STAGGER = 110
	const SETTLE_TIME = 1100

	// the fan-out rides a lazier trail than the cursor does
	const INTRO_SMOOTHING = 0.5
	// lag before the stack starts reacting to a cursor move, on top of the
	// smoothing trail — makes the follow read as a beat behind rather than glued on
	const CURSOR_DELAY = 90
	// Scrolling wants a much shorter trail than the cursor: the stack has to keep
	// up with the page, so this is fixed rather than left to the speed setting.
	const SCROLL_SMOOTHING = 0.08

	// Scroll swings the stack further than the cursor ever pulls it, since it is
	// the only motion a cursorless device gets. From/to are in `spread` units.
	// Starts at 0 (centered, matching where the intro leaves it) so there is no
	// shift until the page actually scrolls, and rises well above the logo.
	const SCROLL_FROM = 0
	const SCROLL_TO = -2.6
	// fraction of the hero's height the full swing plays out over
	const SCROLL_RANGE = 0.55

	// Layer i drifts by (i + LEAD) steps, so the top layer — and the names riding
	// along with it — still shift a little instead of sitting perfectly still.
	const LEAD = 1.4
	// viewBox units -> percent of the <h1> box, which spans the same 200 units
	const UNIT_PCT = 100 / 200

	// Start empty so the first painted frame — server-rendered included — is the
	// state the intro animates out of, with no flash of the finished logo.
	// Without JS the <noscript> rule below forces everything visible instead.
	let revealedPaths = 0 // how many of PATHS/NAMES are on screen
	let revealedLayers = 0 // highest layer index that has faded in
	let introDone = false
	let pointerActive = false
	let timers = []

	let innerWidth = 1000
	let innerHeight = 1000
	let mouseX = innerWidth / 2 // initialize to center
	let mouseY = innerHeight / 2
	// no cursor to follow — the layers ride the scroll instead
	let isTouchDevice = false
	let heroEl
	let svgEl
	let scrollProgress = 0
	let cursorTimers = []

	// center of the logo svg itself, in viewport coordinates — the point the
	// layers spread from, kept separate from the window center since the logo
	// isn't always centered in the viewport
	let logoCenterX = innerWidth / 2
	let logoCenterY = innerHeight / 2

	// target offset per layer, derived straight from the cursor
	let targetX = 0
	let targetY = 0
	// smoothed offset actually rendered
	let offsetX = 0
	let offsetY = 0
	// velocity of the smoothed offset, so a reversal curves through instead of
	// snapping — plain exponential decay has no memory of motion, so the instant
	// the cursor changes direction the pull flips instantly and reads as a jolt
	let velX = 0
	let velY = 0

	let frame = null
	let lastTime = 0

	// the cursor only drives the stack where there is one to follow
	$: scrollDriven = isTouchDevice
	// mirrored to the store so the settings panel knows to hide the speed slider
	$: logoScrollDriven.set(scrollDriven)

	const updateLogoCenter = () => {
		if (!svgEl) return
		const rect = svgEl.getBoundingClientRect()
		logoCenterX = rect.left + rect.width / 2
		logoCenterY = rect.top + rect.height / 2
	}

	const updateTarget = () => {
		const cx = logoCenterX
		const cy = logoCenterY
		const dx = mouseX - cx
		const dy = mouseY - cy
		const distance = Math.hypot(dx, dy)

		// Without a cursor the stack rides the scroll, straight up and down: it
		// hangs below the logo at rest and rises through it as the page scrolls.
		if (scrollDriven) {
			targetX = 0
			targetY = (SCROLL_FROM + (SCROLL_TO - SCROLL_FROM) * scrollProgress) * spread
			return
		}

		// with the cursor off the page the layers rest stacked in the center
		if (!pointerActive || distance === 0) {
			targetX = 0
			targetY = 0
			return
		}

		// capped so the layers never stretch beyond `spread` per step — normalized
		// against the viewport, not the (possibly off-center) logo position
		const maxDistance = Math.min(innerWidth / 2, innerHeight / 2) || 1
		const offset = Math.min(distance / maxDistance, 1) * spread

		// point away from the cursor, or into it when the setting is flipped
		const direction = spreadTowards ? 1 : -1
		targetX = ((direction * dx) / distance) * offset
		targetY = ((direction * dy) / distance) * offset
	}

	// Critically-damped spring toward `target`, carrying `velocity` across calls.
	// Unlike plain exponential decay this has inertia, so a target that reverses
	// direction curves the motion through the turn instead of snapping the pull
	// around instantly. `smoothTime` behaves like the old exponential `trail`.
	// (Standard closed-form critically-damped spring — e.g. Unity's SmoothDamp.)
	const springTo = (current, target, velocity, smoothTime, dt) => {
		const omega = 2 / smoothTime
		const x = omega * dt
		const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
		const change = current - target
		const temp = (velocity + omega * change) * dt
		const newVelocity = (velocity - omega * temp) * exp
		const newCurrent = target + (change + temp) * exp
		return [newCurrent, newVelocity]
	}

	const tick = (time) => {
		const dt = Math.min((time - lastTime) / 1000, 0.1)
		lastTime = time

		// frame-rate independent spring smoothing
		const trail = introDone ? (scrollDriven ? SCROLL_SMOOTHING : smoothing) : INTRO_SMOOTHING
		;[offsetX, velX] = springTo(offsetX, targetX, velX, trail, dt)
		;[offsetY, velY] = springTo(offsetY, targetY, velY, trail, dt)

		const settled =
			Math.abs(targetX - offsetX) < 0.001 &&
			Math.abs(targetY - offsetY) < 0.001 &&
			Math.abs(velX) < 0.001 &&
			Math.abs(velY) < 0.001

		if (settled) {
			offsetX = targetX
			offsetY = targetY
			velX = 0
			velY = 0
			frame = null
		} else {
			frame = requestAnimationFrame(tick)
		}
	}

	const startAnimation = () => {
		if (frame !== null) return
		lastTime = performance.now()
		frame = requestAnimationFrame(tick)
	}

	const handleMouseMove = (e) => {
		// the intro owns the logo until it has played out
		if (scrollDriven || !introDone) return
		const x = e.clientX
		const y = e.clientY
		// queued rather than debounced, so each move lands its own delayed update
		// and the stack trails the cursor by a steady beat instead of catching up in jumps
		const id = setTimeout(() => {
			cursorTimers = cursorTimers.filter((t) => t !== id)
			pointerActive = true
			mouseX = x
			mouseY = y
			updateTarget()
			startAnimation()
		}, CURSOR_DELAY)
		cursorTimers.push(id)
	}

	// cursorless devices drive the stack from how far the hero has scrolled away.
	// Kept live during the intro too (not gated on introDone) so the stack is
	// already easing toward its scroll position before the intro ends — otherwise
	// it sits frozen at 0 and snaps into place the instant the intro finishes.
	const handleScroll = () => {
		updateLogoCenter()

		if (!scrollDriven) {
			// the logo moves within the viewport as the page scrolls, so the
			// offset relative to the (unmoved) cursor position needs recomputing
			// too, or the follow effect freezes until the next mousemove
			updateTarget()
			startAnimation()
			return
		}
		if (!heroEl) return
		const rect = heroEl.getBoundingClientRect()
		const range = (rect.height || innerHeight || 1) * SCROLL_RANGE
		// Measuring from rect.top alone would stall the swing until the hero had
		// scrolled under the header, so anchor it to the scroll position where the
		// hero first comes into view — 0 for a hero that starts above the fold.
		const heroTop = rect.top + window.scrollY
		const start = Math.max(heroTop - innerHeight, 0)
		// 0 with the hero at rest, 1 once it has scrolled `range` px away
		scrollProgress = Math.min(Math.max((window.scrollY - start) / range, 0), 1)
		updateTarget()
		startAnimation()
	}

	// only leaving the window drops the layers back to their centered default —
	// they keep following the cursor anywhere else on the page
	const handleDocumentLeave = () => {
		pointerActive = false
		updateTarget()
		startAnimation()
	}

	const after = (ms, fn) => timers.push(setTimeout(fn, ms))

	const clearTimers = () => {
		timers.forEach(clearTimeout)
		timers = []
	}

	const runIntro = () => {
		// seed the scroll-driven target right away so mobile eases into position
		// over the intro's slow trail, instead of snapping once introDone flips
		handleScroll()

		// each name lands with its matching path
		PATHS.forEach((_, i) => after(INTRO_DELAY + i * PATH_STAGGER, () => (revealedPaths = i + 1)))

		// then the stack surfaces out of the paths it was hiding behind
		for (let i = 1; i < layers; i++) {
			after(LAYERS_DELAY + i * LAYER_STAGGER, () => (revealedLayers = i))
		}

		after(LAYERS_DELAY + layers * LAYER_STAGGER + SETTLE_TIME, () => {
			introDone = true
			// catch up to wherever the page was scrolled to during the intro
			handleScroll()
		})
	}

	const skipIntro = () => {
		revealedPaths = PATHS.length
		revealedLayers = layers - 1
		updateTarget()
		offsetX = targetX
		offsetY = targetY
		velX = 0
		velY = 0
		introDone = true
		handleScroll()
	}

	// rewind to the empty state and play the whole thing again, from the panel
	const replayIntro = () => {
		if (!browser) return
		clearTimers()
		if (frame !== null) {
			cancelAnimationFrame(frame)
			frame = null
		}
		introDone = false
		pointerActive = false
		scrollProgress = 0
		targetX = 0
		targetY = 0
		offsetX = 0
		offsetY = 0
		velX = 0
		velY = 0
		revealedPaths = 0
		revealedLayers = 0

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			skipIntro()
		} else {
			runIntro()
		}
	}

	const handleResize = () => {
		if (!browser) return
		innerWidth = window.innerWidth
		innerHeight = window.innerHeight
		updateLogoCenter()
		// Keep mouse centered on resize if there is no cursor driving the stack
		if (scrollDriven) {
			mouseX = innerWidth / 2
			mouseY = innerHeight / 2
		}
		if (!introDone) return
		// the hero's height feeds the scroll mapping, so re-measure before settling
		handleScroll()
		updateTarget()
		startAnimation()
	}

	onMount(() => {
		// Set initial values
		innerWidth = window.innerWidth
		innerHeight = window.innerHeight
		updateLogoCenter()

		// Anything that cannot hover has no cursor to follow, so it scrolls instead.
		// This is narrower than a touch check: a touchscreen laptop still has a mouse.
		isTouchDevice = window.matchMedia('(hover: none)').matches

		// Initialize mouse position to center
		mouseX = innerWidth / 2
		mouseY = innerHeight / 2

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			skipIntro()
		} else {
			runIntro()
		}

		// the header's settings button only shows while this component is mounted
		logoSettingsActive.set(true)

		// skip the store's own initial value so mounting doesn't trigger a replay
		let skipFirstReplay = true
		const unsubscribeReplay = logoReplayRequested.subscribe(() => {
			if (skipFirstReplay) {
				skipFirstReplay = false
				return
			}
			replayIntro()
		})

		return () => {
			if (frame !== null) cancelAnimationFrame(frame)
			clearTimers()
			cursorTimers.forEach(clearTimeout)
			cursorTimers = []
			unsubscribeReplay()
			logoSettingsActive.set(false)
		}
	})

	// re-settle when the motion settings are changed from the panel
	const applySettings = () => {
		if (!browser || !introDone) return
		// layers added after the intro have no reveal of their own to wait for
		revealedLayers = layers - 1
		handleScroll()
		updateTarget()
		startAnimation()
	}
	$: applySettings(spread, layers, scrollDriven, spreadTowards, introDone)
</script>

<svelte:window
	on:resize={handleResize}
	on:scroll|passive={handleScroll}
	on:mousemove={handleMouseMove}
/>
<svelte:document on:mouseleave={handleDocumentLeave} />

<noscript>
	<style>
		.glyph,
		.layer,
		.name {
			opacity: 1 !important;
			transform: none !important;
		}
	</style>
</noscript>

<section
	bind:this={heroEl}
	class="flex w-full flex-col items-center pt-10 sm:pt-0 portrait:items-start"
	style="background: radial-gradient(circle 320px at 50% 360px, color-mix(in srgb, var(--accent) 14%, var(--base-bg)), var(--base-bg) 100%);"
>
	<div class="relative mx-auto">
		<svg
			bind:this={svgEl}
			class="pointer-events-none h-auto w-auto overflow-visible p-4 md:p-10 portrait:h-auto portrait:w-[clamp(300px,calc(100svw),600px)] landscape:h-[clamp(400px,calc(100svh-5rem),700px)] landscape:w-auto"
			viewBox="0 0 200 200"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			{#each Array(layers) as _, i (i)}
				<g
					class="layer stroke-[var(--accent)] transition-opacity duration-[950ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
					stroke-width={thickness}
					fill="none"
					style="opacity: {i <= revealedLayers ? 1 - i / layers : 0};"
					transform={`translate(${offsetX * (i + LEAD)}, ${offsetY * (i + LEAD)}) scale(${1 - i * scaleStep})`}
					transform-origin="100 100"
				>
					{#each PATHS as d, j (j)}
						<path
							{d}
							class="glyph transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
							style="opacity: {j < revealedPaths ? 1 : 0};"
						/>
					{/each}
				</g>
			{/each}
		</svg>
		<h1
			class="pointer-events-none absolute inset-0 m-4 text-5xl font-bold md:m-10 md:text-7xl"
			style="transform: translate({offsetX * LEAD * UNIT_PCT}%, {offsetY * LEAD * UNIT_PCT}%);"
		>
			{#each NAMES as { text, position }, j (text)}
				<span
					class="name absolute transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none {position}"
					style="opacity: {j < revealedPaths ? 1 : 0}; transform: translateY({j < revealedPaths
						? 0
						: '0.4em'});"
				>
					{text}
				</span>
			{/each}
		</h1>
	</div>
</section>
