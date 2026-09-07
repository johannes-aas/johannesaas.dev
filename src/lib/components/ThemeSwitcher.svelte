<script>
	import { onMount } from 'svelte'
	import { scale } from 'svelte/transition'
	import { openPanelCount } from '$lib/stores/panelState'
	import Sun from '@lucide/svelte/icons/sun'
	import Moon from '@lucide/svelte/icons/moon'

	/* ordered lightest to darkest — see the spectrum in globals.css.
     `accent` mirrors each theme's --accent value there, so a swatch can preview
     it on hover without taking on that theme's full set of custom properties
     (which would also repaint its border/etc the rest of the time). */
	const themes = [
		{ id: 'theme-1', name: 'Paper', accent: 'rgb(74, 142, 142)' },
		{ id: 'theme-2', name: 'Warm Sand', accent: 'rgb(198, 102, 64)' },
		{ id: 'theme-3', name: 'Sea Glass', accent: 'rgb(20, 142, 110)' },
		{ id: 'theme-4', name: 'Overcast', accent: 'rgb(38, 96, 196)' },
		{ id: 'theme-5', name: 'Plum Dusk', accent: 'rgb(184, 142, 240)' },
		{ id: 'theme-6', name: 'Deep Forest', accent: 'rgb(72, 194, 126)' },
		{ id: 'theme-7', name: 'Midnight', accent: 'rgb(96, 148, 244)' },
		{ id: 'theme-8', name: 'Void', accent: 'rgb(140, 152, 216)' }
	]

	const ids = themes.map((t) => t.id)
	const last = themes.length - 1
	/* themes at this index and beyond are dark, so the button shows a moon */
	const firstDark = 4

	let themeIndex = 0
	let open = false
	let container
	let toggleEl
	let buttonEls = []
	let transitionTimer
	/* true for the duration of the reveal/cross-fade animation — swatches are
     inert while it plays so a second pick can't stack a new wipe on top of
     one still running */
	let transitioning = false
	/* viewport width:height, mirrored onto each swatch button so it reads as a
     shrunk copy of the screen itself, same as the reveal animation's shape */
	let screenAspect = 0.5

	onMount(() => {
		const saved = localStorage.getItem('theme')
		if (saved && ids.includes(saved)) {
			themeIndex = ids.indexOf(saved)
		} else {
			themeIndex = window.matchMedia('(prefers-color-scheme: dark)').matches ? last : 0
		}
		applyTheme(false)

		updateScreenAspect()
		window.addEventListener('resize', updateScreenAspect)
		return () => window.removeEventListener('resize', updateScreenAspect)
	})

	function updateScreenAspect() {
		screenAspect = window.innerWidth / window.innerHeight
	}

	function swapTheme() {
		const html = document.documentElement
		html.classList.remove(...ids)
		html.classList.add(ids[themeIndex])
		syncThemeColor(html)
	}

	/* the property-by-property cross-fade — the fallback path */
	function crossFadeTheme() {
		const html = document.documentElement
		html.classList.add('theme-transition')
		clearTimeout(transitionTimer)
		transitionTimer = setTimeout(() => {
			html.classList.remove('theme-transition')
			transitioning = false
		}, 1800)
		swapTheme()
	}

	/*
    Collapsed/expanded clip-path polygons for a rectangular wipe that starts at
    the toggle button's own bounds and grows into a shrunk copy of the viewport
    itself — width:height kept equal to vw:vh throughout, rather than an
    independent width and height — so it reads as the screen's own rectangle
    growing outward from the button, not an arbitrary box. Coordinates are
    percentages of the viewport rather than px — Chrome renders absolute px
    clip-path coordinates on ::view-transition-new(root) unscaled on fractional
    display scaling for the first transition after load, so px values can land in
    the wrong place; percentages resolve correctly either way.
  */
	function buttonClipPaths(buttonRect, vw, vh) {
		const toX = (px) => `${(px / vw) * 100}%`
		const toY = (py) => `${(py / vh) * 100}%`
		const point = (px, py) => `${toX(px)} ${toY(py)}`
		const x = buttonRect.left + buttonRect.width / 2
		const y = buttonRect.top + buttonRect.height / 2
		/* smallest scale of a vw×vh rectangle, centred on (x, y), whose edges clear
       the farthest viewport edge in both axes — slightly overscanned so the
       corners clear the viewport before the animation ends */
		const scale = Math.max((2 * Math.max(x, vw - x)) / vw, (2 * Math.max(y, vh - y)) / vh) * 1.05
		const halfW = (scale * vw) / 2
		const halfH = (scale * vh) / 2
		const collapsed = `polygon(${[
			point(buttonRect.left, buttonRect.top),
			point(buttonRect.right, buttonRect.top),
			point(buttonRect.right, buttonRect.bottom),
			point(buttonRect.left, buttonRect.bottom)
		].join(', ')})`
		const expanded = `polygon(${[
			point(x - halfW, y - halfH),
			point(x + halfW, y - halfH),
			point(x + halfW, y + halfH),
			point(x - halfW, y + halfH)
		].join(', ')})`
		return [collapsed, expanded]
	}

	/*
    The new theme is revealed as a rectangle, shaped like the screen itself,
    growing out from the swatch that was picked — starting at that button's
    own size rather than a single point. The View Transition API snapshots the
    page, so this needs the plain cross-fade wherever startViewTransition is missing.
  */
	function revealTheme(originRect) {
		const html = document.documentElement
		const [from, to] = buttonClipPaths(originRect, window.innerWidth, window.innerHeight)

		/* pinned via CSS so the new snapshot stays clipped to a point between the
       snapshot and the ready.then() below, instead of flashing in unclipped */
		html.style.setProperty('--theme-reveal-clip-from', from)
		html.classList.add('theme-reveal')

		let anim
		const transition = document.startViewTransition(() => swapTheme())
		transition.ready
			.then(() => {
				anim = html.animate(
					{ clipPath: [from, to] },
					{
						duration: 600,
						easing: 'ease-in-out',
						fill: 'forwards',
						pseudoElement: '::view-transition-new(root)'
					}
				)
			})
			.catch(() => {})
		transition.finished.finally(() => {
			anim?.cancel()
			html.classList.remove('theme-reveal')
			html.style.removeProperty('--theme-reveal-clip-from')
			transitioning = false
		})
	}

	function applyTheme(animate = true, originRect = null) {
		if (!animate) return swapTheme()

		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		if (reduced || !document.startViewTransition) {
			crossFadeTheme()
			return
		}
		revealTheme(originRect ?? toggleEl.getBoundingClientRect())
	}

	function startTransition(originRect) {
		transitioning = true
		applyTheme(true, originRect)
	}

	/*
    Mobile browsers tint their own chrome from <meta name="theme-color">, which
    CSS variables can't reach — read the resolved --base-bg back out and mirror
    it so the URL bar matches the page instead of staying white.
  */
	function syncThemeColor(html) {
		const meta = document.querySelector('meta[name="theme-color"]')
		if (!meta) return
		const bg = getComputedStyle(html).getPropertyValue('--base-bg').trim()
		if (bg) meta.setAttribute('content', bg)
	}

	function setTheme(i) {
		if (transitioning || i === themeIndex) return
		themeIndex = i
		localStorage.setItem('theme', ids[themeIndex])
		startTransition(buttonEls[i]?.getBoundingClientRect())
	}

	function setOpen(value) {
		if (value === open) return
		open = value
		openPanelCount.update((n) => n + (value ? 1 : -1))
	}

	async function toggle() {
		setOpen(!open)
		if (open) {
			await new Promise((r) => requestAnimationFrame(r))
			buttonEls[themeIndex]?.focus()
		}
	}

	/* roving tabindex within the radiogroup — arrow keys both move focus and
     pick the theme, matching the ARIA APG radiogroup pattern */
	function onButtonKeyDown(event, i) {
		let next = i
		switch (event.key) {
			case 'ArrowUp':
			case 'ArrowLeft':
				next = i - 1
				break
			case 'ArrowDown':
			case 'ArrowRight':
				next = i + 1
				break
			case 'Home':
				next = 0
				break
			case 'End':
				next = last
				break
			default:
				return
		}
		event.preventDefault()
		next = Math.max(0, Math.min(last, next))
		setTheme(next)
		buttonEls[next]?.focus()
	}

	function onWindowPointerDown(event) {
		/* during the view transition the browser's own overlay sits above the
	     real DOM, so a click inside the panel can hit-test to <html> instead of
	     a swatch button — ignore outside-clicks while that's playing so it
	     doesn't look like a click outside the panel and close it */
		if (transitioning) return
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

<div class="relative flex items-center justify-center" bind:this={container}>
	<button
		class="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-[var(--muted)] transition-[color,background-color,transform] duration-200 hover:bg-[color-mix(in_srgb,var(--muted)_14%,transparent)] hover:text-[var(--base-fg)] active:scale-[0.94]"
		class:text-[var(--base-fg)]={open}
		class:bg-[color-mix(in_srgb,var(--muted)_14%,transparent)]={open}
		bind:this={toggleEl}
		on:click={toggle}
		aria-label="Colour theme"
		aria-expanded={open}
		title="Colour theme: {themes[themeIndex].name}"
	>
		{#if themeIndex >= firstDark}
			<Moon class="h-6 w-6 stroke-[1.75]" aria-hidden="true" />
		{:else}
			<Sun class="h-6 w-6 stroke-[1.75]" aria-hidden="true" />
		{/if}
	</button>

	{#if open}
		<div class="panel-wrap fixed top-[6rem] left-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-[58rem] [transform:translateX(-50%)]">
			<div
				class="control-panel flex w-full flex-row items-center gap-2 px-2 py-3 sm:gap-4 sm:px-6 sm:py-5 lg:gap-6 lg:px-9 lg:py-7"
				transition:scale={{ duration: 160, start: 0.9, opacity: 0 }}
			>
				<Sun
					class="h-5 w-5 flex-none stroke-[var(--muted)] stroke-[1.5] opacity-75 sm:h-7 sm:w-7 lg:h-9 lg:w-9"
					aria-hidden="true"
				/>

				<div
					class="grid flex-1 grid-cols-8 items-center gap-1 sm:gap-2 lg:gap-3"
					role="radiogroup"
					aria-label="Colour theme"
				>
					{#each themes as t, i}
						<button
							type="button"
							role="radio"
							aria-checked={i === themeIndex}
							aria-label={t.name}
							title={t.name}
							tabindex={i === themeIndex ? 0 : -1}
							aria-disabled={transitioning}
							class="theme-swatch block w-full cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
							class:selected={i === themeIndex}
							class:wiping={transitioning && i !== themeIndex}
							style="aspect-ratio: {screenAspect}; --swatch-accent: {t.accent};"
							bind:this={buttonEls[i]}
							on:click={() => setTheme(i)}
							on:keydown={(event) => onButtonKeyDown(event, i)}
						></button>
					{/each}
				</div>

				<Moon
					class="h-5 w-5 flex-none stroke-[var(--muted)] stroke-[1.5] opacity-75 sm:h-7 sm:w-7 lg:h-9 lg:w-9"
					aria-hidden="true"
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	.theme-swatch {
		/* the grid divides the row's full width evenly across the 8 buttons at
		   every screen size, with height derived from that width via
		   aspect-ratio (set inline, per-button) so the shape never distorts. */
		background-color: transparent;
		border: 1px solid var(--muted);
		/* own compositing layer, so its background-color transition doesn't force
		   the parent's backdrop-filter blur to repaint every hover frame — that
		   repaint is what reads as flicker on hover */
		will-change: background-color;
		/* fade-in duration for when .wiping is removed — deliberately slower than
		   the wipe-out below, so the other swatches settle back in gently once
		   the reveal has finished rather than snapping back with it */
		transition:
			opacity 450ms ease,
			transform 450ms ease,
			background-color 150ms,
			border-color 150ms;
	}

	/* --swatch-accent (set inline, per-button) mirrors that swatch's own theme
	   accent, so hovering previews it regardless of the page's current theme */
	.theme-swatch:hover:not(.selected) {
		background-color: var(--swatch-accent);
	}

	.theme-swatch.selected {
		border-color: var(--accent);
		background-color: var(--accent);
	}

	/* the other swatches wipe away fast while the picked one's reveal plays,
	   then fade back in slowly via the base transition duration above once
	   .wiping is removed */
	.theme-swatch.wiping {
		opacity: 0;
		transform: scale(0.8);
		transition-duration: 150ms;
	}

	@media (prefers-reduced-motion: reduce) {
		.theme-swatch {
			transition: none;
		}
	}

	/* Above lg, centre the panel on the hero logo's own vertical midpoint rather
	   than the viewport's — mirrors HeroSection's landscape sizing (a `5rem`
	   header offset plus a `clamp(400px, 100svh - 5rem, 700px)` logo height),
	   so the two move in step as the window is resized instead of drifting
	   apart once the logo's clamp hits a bound the viewport-centered value ignores. */
	@media (min-width: 1024px) {
		.panel-wrap {
			top: calc(2rem + clamp(400px, calc(100svh - 5rem), 700px) / 2);
			transform: translate(-50%, -50%);
		}
	}
</style>
