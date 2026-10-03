<script>
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import {
		logoControls,
		logoDefaults,
		logoReplayRequested,
		persistLogoControls
	} from '$lib/stores/logoControls'
	import Mail from '@lucide/svelte/icons/mail'
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw'
	import { GithubIcon, LinkedinIcon } from '$lib/components/icons'
	import GridLine from '$lib/components/grid-line.svelte'
	import Button from '$lib/components/button.svelte'
	import TintedImage from '$lib/components/tinted-image.svelte'
	import { m } from '$lib/paraglide/messages'
	import { finePointer } from '$lib/pointer.js'
	import LogoSettings from './logo-settings.svelte'

	let { thickness, spread, speed, layers, scaleStep, spreadTowards } = $derived($logoControls)

	// smoothing time constant in seconds (lower = snappier)
	let smoothing = $derived(1 / speed)

	// PATHS[i] is revealed together with NAMES[i], so the two stay in step
	const PATHS = [
		'M71.5 0.5V118.152L0.5 188.797V94.5H15.5V0.5H71.5Z',
		'M132.125 0.5V10.25H145.875V0.5H188.809L146.518 43.6211H130.772V58.1035L88.5 102.744V0.5H132.125Z',
		'M199.5 199.5H147.375V187H102.918L90.418 199.5H13.707L199.5 13.707V199.5Z'
	]

	const NAMES = [
		{ text: 'Johannes', position: 'top-[13%] left-0 min-[600px]:-left-[8%] lg:-left-[19%]' },
		{ text: 'Hansen', position: 'top-[37%] left-[40%]' },
		{ text: 'Aas', position: 'top-[59%] right-0 min-[600px]:-right-[6%] lg:-right-[10%]' }
	]

	// intro timeline, in ms. INTRO_DELAY must let the empty state paint before anything animates
	const INTRO_DELAY = 700
	const PATH_STAGGER = 600
	const LAYERS_DELAY = 2400
	const LAYER_STAGGER = 110
	const SETTLE_TIME = 600

	const INTRO_SMOOTHING = 0.5
	const CURSOR_DELAY = 90
	const SCROLL_SMOOTHING = 0.08

	// in `spread` units
	const SCROLL_FROM = 0
	const SCROLL_TO = -2.6
	// fraction of the hero's height the full swing plays out over
	const SCROLL_RANGE = 0.55

	// layer i drifts by (i + LEAD) steps, so the top layer still moves a little
	const LEAD = 1.4
	// viewBox units -> percent of the <h1> box, which spans the same 200 units
	const UNIT_PCT = 100 / 200

	// start empty so SSR paints the intro's first frame; <noscript> below forces it visible
	let revealedPaths = $state(0) // how many of PATHS/NAMES are on screen
	let revealedLayers = $state(0) // highest layer index that has faded in
	let introDone = $state(false)
	let pointerActive = false
	let timers = []

	let settingsOpen = $state(false)
	let settingsModified = $derived(
		Object.keys(logoDefaults).some((k) => $logoControls[k] !== logoDefaults[k])
	)

	// null until mounted so SSR markup never disagrees with the visitor's clock
	const osloTime = new Intl.DateTimeFormat('en-GB', {
		timeZone: 'Europe/Oslo',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
		timeZoneName: 'shortOffset'
	})
	let clock = $state(null)

	const updateClock = () => {
		const parts = Object.fromEntries(
			osloTime.formatToParts(new Date()).map((p) => [p.type, p.value])
		)
		clock = { hour: parts.hour, minute: parts.minute, offset: parts.timeZoneName }
	}

	let innerWidth = 1000
	let innerHeight = 1000
	let mouseX = innerWidth / 2
	let mouseY = innerHeight / 2
	let heroEl
	let svgEl
	let scrollProgress = 0
	let cursorTimers = []

	// viewport coordinates of the logo's centre, which the layers spread from
	let logoCenterX = innerWidth / 2
	let logoCenterY = innerHeight / 2

	let targetX = 0
	let targetY = 0
	let offsetX = $state(0)
	let offsetY = $state(0)
	// carried between frames so a direction reversal curves instead of jolting
	let velX = 0
	let velY = 0

	let frame = null
	let lastTime = 0

	// no cursor to follow, so the layers ride the scroll instead
	let scrollDriven = $derived(!finePointer.current)

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

		if (scrollDriven) {
			targetX = 0
			targetY = (SCROLL_FROM + (SCROLL_TO - SCROLL_FROM) * scrollProgress) * spread
			return
		}

		if (!pointerActive || distance === 0) {
			targetX = 0
			targetY = 0
			return
		}

		// normalised against the viewport, not the (possibly off-centre) logo
		const maxDistance = Math.min(innerWidth / 2, innerHeight / 2) || 1
		const offset = Math.min(distance / maxDistance, 1) * spread

		const direction = spreadTowards ? 1 : -1
		targetX = ((direction * dx) / distance) * offset
		targetY = ((direction * dy) / distance) * offset
	}

	// closed-form critically-damped spring (as in Unity's SmoothDamp)
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
		if (scrollDriven || !introDone) return
		const x = e.clientX
		const y = e.clientY
		// queued, not debounced, so the stack trails by a steady beat instead of jumping
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

	// not gated on introDone, or the stack would snap into place when the intro ends
	const handleScroll = () => {
		updateLogoCenter()

		if (!scrollDriven) {
			// the logo moves under a still cursor, so the offset needs recomputing
			updateTarget()
			startAnimation()
			return
		}
		if (!heroEl) return
		const rect = heroEl.getBoundingClientRect()
		const range = (rect.height || innerHeight || 1) * SCROLL_RANGE
		// anchored to where the hero first comes into view, not rect.top, so the swing starts at once
		const heroTop = rect.top + window.scrollY
		const start = Math.max(heroTop - innerHeight, 0)
		scrollProgress = Math.min(Math.max((window.scrollY - start) / range, 0), 1)
		updateTarget()
		startAnimation()
	}

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
		handleScroll()

		PATHS.forEach((_, i) => after(INTRO_DELAY + i * PATH_STAGGER, () => (revealedPaths = i + 1)))

		for (let i = 1; i < layers; i++) {
			after(LAYERS_DELAY + i * LAYER_STAGGER, () => (revealedLayers = i))
		}

		after(LAYERS_DELAY + layers * LAYER_STAGGER + SETTLE_TIME, () => {
			introDone = true
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
		if (scrollDriven) {
			mouseX = innerWidth / 2
			mouseY = innerHeight / 2
		}
		if (!introDone) return
		handleScroll()
		updateTarget()
		startAnimation()
	}

	onMount(() => {
		innerWidth = window.innerWidth
		innerHeight = window.innerHeight
		updateLogoCenter()

		const stopPersisting = persistLogoControls()

		updateClock()
		const clockInterval = setInterval(updateClock, 1000)

		mouseX = innerWidth / 2
		mouseY = innerHeight / 2

		// the language switcher leaves this flag so its reload doesn't replay the intro
		const skipFlag = sessionStorage.getItem('skip-intro')
		const skipOnce = skipFlag !== null
		sessionStorage.removeItem('skip-intro')

		// plus the pointer position, which the browser doesn't report until it moves
		const [x, y] = (skipFlag ?? '').split(',').map(Number)
		if (Number.isFinite(x) && Number.isFinite(y) && skipFlag.includes(',')) {
			mouseX = x
			mouseY = y
			pointerActive = true
		}

		if (skipOnce || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			skipIntro()
			if (skipOnce) {
				// transitions stay off (class set in app.html) until the revealed state has painted
				requestAnimationFrame(() =>
					requestAnimationFrame(() => document.documentElement.classList.remove('skip-intro'))
				)
			}
		} else {
			runIntro()
		}

		let skipFirstReplay = true
		const unsubscribeReplay = logoReplayRequested.subscribe(() => {
			if (skipFirstReplay) {
				skipFirstReplay = false
				return
			}
			replayIntro()
		})

		return () => {
			clearInterval(clockInterval)
			stopPersisting()
			if (frame !== null) cancelAnimationFrame(frame)
			clearTimers()
			cursorTimers.forEach(clearTimeout)
			cursorTimers = []
			unsubscribeReplay()
		}
	})

	const applySettings = () => {
		if (!browser || !introDone) return
		revealedLayers = layers - 1
		handleScroll()
		updateTarget()
		startAnimation()
	}
	$effect(() => {
		applySettings(spread, layers, scrollDriven, spreadTowards, introDone)
	})
</script>

<svelte:window onresize={handleResize} onscroll={handleScroll} onmousemove={handleMouseMove} />
<svelte:document onmouseleave={handleDocumentLeave} />

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
	class="relative flex w-full flex-col items-center justify-center bg-radial-[circle_420px_at_50%_360px] from-primary-subtle to-body py-10 lg:py-0 portrait:items-start landscape:min-h-[clamp(400px,calc(100svh-5rem),700px)]"
	style:--hero-w="clamp(300px, 100svw, 600px)"
	style:--hero-w-landscape="clamp(400px, calc(100svh - 5rem), 620px)"
>
	<div class="relative mx-auto">
		<svg
			bind:this={svgEl}
			class="pointer-events-none size-auto overflow-visible p-6 md:p-10 portrait:w-(--hero-w) landscape:h-(--hero-w-landscape)"
			viewBox="0 0 200 200"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			{#each Array(layers) as _, i (i)}
				<g
					class="layer stroke-primary transition-opacity duration-950 ease-out motion-reduce:transition-none [.skip-intro_&]:transition-none"
					stroke-width={thickness}
					fill="none"
					style:opacity={i <= revealedLayers ? 1 - i / layers : 0}
					transform={`translate(${offsetX * (i + LEAD)}, ${offsetY * (i + LEAD)}) scale(${1 + i * scaleStep})`}
					transform-origin="100 100"
				>
					{#each PATHS as d, j (j)}
						<path
							{d}
							class="glyph transition-opacity duration-900 ease-out motion-reduce:transition-none [.skip-intro_&]:transition-none"
							style:opacity={j < revealedPaths ? 1 : 0}
						/>
					{/each}
				</g>
			{/each}
		</svg>
		<h1
			class="pointer-events-none absolute inset-0 m-4 text-5xl font-bold tracking-tight min-[450px]:text-6xl min-[600px]:m-10 min-[600px]:text-7xl lg:text-[5.5rem]"
			style:transform="translate({offsetX * LEAD * UNIT_PCT}%, {offsetY * LEAD * UNIT_PCT}%)"
		>
			{#each NAMES as { text, position }, j (text)}
				<span
					class={[
						'name pointer-events-auto absolute transition-[opacity,transform] duration-900 ease-out motion-reduce:transition-none [.skip-intro_&]:transition-none',
						position
					]}
					style:opacity={j < revealedPaths ? 1 : 0}
					style:transform="translateY({j < revealedPaths ? 0 : '0.4em'})"
				>
					{text}
				</span>
			{/each}
		</h1>
	</div>
	<GridLine class="mt-8 lg:hidden" />
	<div
		class="mx-auto mt-8 flex w-(--hero-w) items-center gap-4 px-6 md:px-10 lg:absolute lg:bottom-6 lg:left-6 lg:z-10 lg:mx-0 lg:mt-0 lg:w-auto lg:flex-col lg:items-start lg:gap-3 lg:px-0 landscape:w-(--hero-w-landscape) lg:landscape:w-auto"
	>
		<TintedImage
			src="/images/johannes2.jpg"
			alt={m.about_photo_alt()}
			mirrored
			class="size-22 border border-border"
		/>
		<div class="flex flex-col gap-1 lg:gap-2">
			<h3 class="text-3xl leading-7 tracking-tight text-fg-strong">
				{m.hero_role_top()}<br class="hidden lg:block" />{m.hero_role_bottom()}
			</h3>
			<h3 class="text-xl leading-6 text-primary-text">{m.hero_tagline()}</h3>
		</div>
	</div>
	<div class="absolute top-0 right-0 z-20 -mt-px -mr-px hidden md:flex md:flex-col">
		<LogoSettings bind:open={settingsOpen} />
		{#if settingsModified && !settingsOpen}
			<Button
				variant="cell"
				class="-mt-px size-14 bg-body sm:size-18"
				onclick={() => logoControls.set({ ...logoDefaults })}
				aria-label={m.logo_reset_defaults()}
				title={m.logo_reset_defaults()}
			>
				<RotateCcw aria-hidden="true" />
			</Button>
		{/if}
	</div>
	<!-- 2-column grid from lg with the top-left cell empty; column 2 / row 2 overlap by 1px so borders don't double -->
	<div
		class="mx-auto mt-6 flex w-(--hero-w) px-6 md:px-10 lg:absolute lg:right-0 lg:bottom-0 lg:z-20 lg:mx-0 lg:mt-0 lg:-mr-px lg:-mb-px lg:grid lg:w-auto lg:grid-cols-[repeat(2,--spacing(18))] lg:px-0 landscape:w-(--hero-w-landscape) lg:landscape:w-auto"
	>
		<Button
			variant="cell"
			href="https://github.com/johannes-aas"
			aria-label="GitHub"
			target="_blank"
			rel="noopener noreferrer"
			class="h-14 flex-1 bg-body sm:h-18 lg:col-start-2 lg:-ml-px lg:w-[calc(--spacing(18)+1px)] lg:flex-none"
		>
			<GithubIcon aria-hidden="true" />
		</Button>
		<Button
			variant="cell"
			href="https://www.linkedin.com/in/johannes-hansen-aas/"
			aria-label="LinkedIn"
			target="_blank"
			rel="noopener noreferrer"
			class="-ml-px h-14 flex-1 bg-body sm:h-18 lg:-mt-px lg:ml-0 lg:h-[calc(--spacing(18)+1px)] lg:w-18 lg:flex-none"
		>
			<LinkedinIcon aria-hidden="true" />
		</Button>
		<Button
			variant="cell"
			email="johannes.hansen.aas@gmail.com"
			aria-label={m.hero_copy_email()}
			class="-ml-px h-14 flex-1 bg-body sm:h-18 lg:-mt-px lg:h-[calc(--spacing(18)+1px)] lg:w-[calc(--spacing(18)+1px)] lg:flex-none"
		>
			<Mail aria-hidden="true" />
		</Button>
	</div>
	<div
		class="mx-auto mt-4 flex w-(--hero-w) items-center gap-2 px-6 text-xs tracking-wider text-fg-muted uppercase tabular-nums md:px-10 lg:absolute lg:top-4 lg:left-6 lg:z-20 lg:mx-0 lg:mt-0 lg:w-auto lg:px-0 landscape:w-(--hero-w-landscape) lg:landscape:w-auto"
		aria-label={m.hero_local_time()}
	>
		<span>{m.hero_country()}</span>
		<span class="text-fg-strong">-</span>
		<span class="font-mono text-fg-strong slashed-zero">
			{clock?.hour ?? '--'}<span class="text-primary-text">:</span>{clock?.minute ?? '--'}
		</span>
		<span class="text-primary-text">{clock?.offset ?? 'GMT+?'}</span>
	</div>
</section>
