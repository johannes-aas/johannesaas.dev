<script>
	import { onMount, flushSync } from 'svelte'
	import { fade } from 'svelte/transition'
	import { openPanelCount } from '$lib/stores/panelState'
	import Button from '$lib/components/button.svelte'
	import { DialogRoot, DialogOverlay, DialogContent, DialogTitle } from '$lib/components/dialog'
	import Sun from '@lucide/svelte/icons/sun'
	import Moon from '@lucide/svelte/icons/moon'
	import X from '@lucide/svelte/icons/x'
	import Palette from '@lucide/svelte/icons/palette'

	/* ordered lightest to darkest — colours themselves live in globals.css as
     --theme-N-swatch (read directly per-button below via var(--{id}-swatch)),
     so a button can show any theme's preview colour without applying that
     theme's full class (which would also repaint its own border/etc the rest
     of the time). The selected swatch shows a filled square at full opacity;
     the same square fades faintly in on hover for unselected swatches. */
	const ids = ['theme-1', 'theme-2', 'theme-3', 'theme-4', 'theme-5', 'theme-6']
	const last = ids.length - 1

	let themeIndex = $state(0)
	let open = $state(false)
	/* which panel implementation is mounted — kept as JS state (not just a
	   `sm:` CSS breakpoint on both) so the mobile dialog's bits-ui layers
	   (focus trap, dismiss-on-outside-click) never mount at desktop widths;
	   those layers act on document-level listeners regardless of CSS
	   visibility, so a merely-hidden-by-CSS dialog was still swallowing
	   pointer events meant for the sm+ panel's swatch buttons */
	let isMobile = $state(false)
	let container
	let toggleEl = $state(null)
	let buttonEls = $state(Array(ids.length).fill(null))
	let mobileButtonEls = $state(Array(ids.length).fill(null))
	let transitionTimer
	let jumpTimer
	/* true for the duration of the reveal/cross-fade animation — swatches are
     inert while it plays so a second pick can't stack a new wipe on top of
     one still running */
	let transitioning = $state(false)
	/* plain (non-reactive) re-entry guard — set synchronously the instant a
	   swatch is clicked, before any $state write. themeIndex/transitioning
	   themselves are only assigned once inside the view transition's update
	   callback (see revealTheme/crossFadeTheme) so the DOM never shows the new
	   selection until it's part of the transition's own snapshot; this guard
	   exists to block a second click during the window before that happens. */
	let locked = false
	/* true only for the brief window right after a real wipe/reveal cycle ends,
     so the per-swatch jump plays on a theme switch but not when the panel is
     merely opened (which also freshly inserts these buttons into the DOM) */
	let justRevealed = $state(false)

	/* the swatch stagger/jump both key off this, longest at the last swatch —
     kept in one place so the reveal timer below can't drift out of sync with it */
	const revealDuration = (i) => 400 + i * 40

	function triggerJump() {
		justRevealed = true
		clearTimeout(jumpTimer)
		jumpTimer = setTimeout(() => {
			justRevealed = false
		}, revealDuration(last))
	}

	onMount(() => {
		const saved = localStorage.getItem('theme')
		if (saved && ids.includes(saved)) {
			themeIndex = ids.indexOf(saved)
		} else {
			themeIndex = window.matchMedia('(prefers-color-scheme: dark)').matches ? last : 0
		}
		applyTheme(themeIndex, false)

		const mql = window.matchMedia('(min-width: 640px)')
		isMobile = !mql.matches
		const onMqlChange = () => (isMobile = !mql.matches)
		mql.addEventListener('change', onMqlChange)
		return () => mql.removeEventListener('change', onMqlChange)
	})

	function swapTheme() {
		const html = document.documentElement
		html.classList.remove(...ids)
		html.classList.add(ids[themeIndex])
		syncThemeColor(html)
	}

	/* the property-by-property cross-fade — the fallback path */
	function crossFadeTheme(i) {
		const html = document.documentElement
		html.classList.add('theme-transition')
		clearTimeout(transitionTimer)
		transitionTimer = setTimeout(() => {
			html.classList.remove('theme-transition')
			transitioning = false
			locked = false
			triggerJump()
		}, 1800)
		transitioning = true
		themeIndex = i
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
	function revealTheme(i, originRect) {
		const html = document.documentElement
		const [from, to] = buttonClipPaths(originRect, window.innerWidth, window.innerHeight)

		/* pinned via CSS so the new snapshot stays clipped to a point between the
       snapshot and the ready.then() below, instead of flashing in unclipped */
		html.style.setProperty('--theme-reveal-clip-from', from)
		html.classList.add('theme-reveal')

		let anim
		/* themeIndex/transitioning are assigned in here, not before this call —
       the browser flushes the resulting DOM update (checkmark move, swatch
       wipe) as part of this same callback before it captures the "new" state
       snapshot, so that update can never paint on the live page a frame
       ahead of the transition covering it */
		const transition = document.startViewTransition(() => {
			flushSync(() => {
				transitioning = true
				themeIndex = i
			})
			swapTheme()
		})
		transition.ready
			.then(
				() =>
					(anim = html.animate(
						{ clipPath: [from, to] },
						{
							duration: 1000,
							easing: 'ease-in-out',
							fill: 'forwards',
							pseudoElement: '::view-transition-new(root)'
						}
					)).finished
			)
			.catch(() => {})
			/* cleanup waits on our own clip-path animation finishing, not on
		   transition.finished — Safari resolves the native promise as soon as
		   `ready` settles since ::view-transition-new(root)'s own animation is
		   disabled (see globals.css), well before this 600ms wipe is actually
		   done. Hanging cleanup off that native promise there un-hides the
		   swatches while they're still covered by the in-progress wipe, so
		   they're already fully visible the instant it uncovers them — the
		   flash this replaces. */
			.finally(() => {
				anim?.cancel()
				html.classList.remove('theme-reveal')
				html.style.removeProperty('--theme-reveal-clip-from')
				transitioning = false
				locked = false
				triggerJump()
			})
	}

	function applyTheme(i, animate = true, originRect = null) {
		if (!animate) {
			themeIndex = i
			return swapTheme()
		}

		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		if (reduced || !document.startViewTransition) {
			crossFadeTheme(i)
			return
		}
		revealTheme(i, originRect ?? toggleEl.getBoundingClientRect())
	}

	function startTransition(i, originRect) {
		applyTheme(i, true, originRect)
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
		if (locked || i === themeIndex) return
		locked = true
		localStorage.setItem('theme', ids[i])
		startTransition(i, buttonEls[i]?.getBoundingClientRect())
	}

	/* small-screen panel skips the view-transition wipe / cross-fade entirely —
	   just applies the theme immediately, no wipe/reveal/jump animation */
	function setThemeImmediate(i) {
		if (i === themeIndex) return
		localStorage.setItem('theme', ids[i])
		applyTheme(i, false)
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
			const els = isMobile ? mobileButtonEls : buttonEls
			els[themeIndex]?.focus()
		}
	}

	/* roving tabindex within the radiogroup — arrow keys both move focus and
     pick the theme, matching the ARIA APG radiogroup pattern */
	function onButtonKeyDown(event, i, setFn, els) {
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
		setFn(next)
		els[next]?.focus()
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

<svelte:window onpointerdown={onWindowPointerDown} onkeydown={onWindowKeyDown} />

<div class="flex items-center justify-center self-stretch" bind:this={container}>
	<Button
		class={[
			/* height comes from self-stretch cascading up through header.svelte
			   and this component's own wrapper div to the header row's own height —
			   width stays independently fixed (not aspect-ratio-derived), so this
			   doesn't hit the old aspect-ratio+stretch bug where the pre-stretch
			   (unstretched, content-sized) height picked the wrong width during the
			   row's initial layout pass. Stretch is what lets the negative -mt-px/
			   -mb-px margins below actually overlap the header's own top/bottom
			   grid lines — with align-items:center, symmetric vertical margins have
			   no visual effect at all, since the box re-centers on its margin box
			   regardless of the margin's sign or size */
			'grid w-14 flex-none place-items-center self-stretch border border-border -mr-px -mt-px -mb-px text-muted transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--muted)_14%,transparent)] hover:text-base-fg sm:w-[4.5rem]',
			open && 'bg-[color-mix(in_srgb,var(--muted)_14%,transparent)] text-base-fg'
		]}
		bind:ref={toggleEl}
		onclick={toggle}
		aria-label="Colour theme"
		aria-expanded={open}
	>
		<span class="relative grid h-5 w-5 place-items-center sm:h-6 sm:w-6">
			<!-- palette -> X only crossfades at sm+ — the base scale-100/opacity-100
			     here always wins below that breakpoint since the sm: overrides
			     below don't apply yet, so the trigger icon never changes on the
			     small-screen panel (which has its own explicit close button) -->
			<span
				class={[
					'absolute inset-0 grid place-items-center scale-100 opacity-100 transition-all duration-200 ease-out',
					open && 'sm:scale-75 sm:opacity-0'
				]}
			>
				<Palette class="h-5 w-5 stroke-[1.75] sm:h-6 sm:w-6" aria-hidden="true" />
			</span>
			<span
				class={[
					'absolute inset-0 grid place-items-center scale-75 opacity-0 transition-all duration-200 ease-out',
					open && 'sm:scale-100 sm:opacity-100'
				]}
			>
				<X class="h-5 w-5 stroke-[1.75] sm:h-6 sm:w-6" aria-hidden="true" />
			</span>
		</span>
	</Button>

	{#if open}
		<!-- small screens: floating vertical dialog, centered on screen, instant
		     theme switch with no wipe/reveal animation. Both this and the sm+
		     panel below stay mounted together and are toggled purely by the
		     `sm:hidden`/`hidden sm:block` CSS below — but bits-ui's focus trap
		     and dismiss-on-outside-click layers act via document-level
		     listeners regardless of CSS visibility, so a CSS-hidden dialog was
		     still swallowing pointer events meant for the sm+ panel's swatch
		     buttons. Passing `open && isMobile` (rather than just `open`) into
		     DialogRoot keeps those layers genuinely inert at desktop widths
		     without touching which markup is mounted. -->
		<div class="sm:hidden" transition:fade={{ duration: 160 }}>
			<DialogRoot open={open && isMobile} onOpenChange={setOpen}>
				<DialogOverlay />
				<DialogContent
					class="fixed top-1/2 left-1/2 flex w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-none border border-border bg-surface-bg shadow-lg"
				>
					<DialogTitle class="sr-only">Colour theme</DialogTitle>

					<Button
						type="button"
						class="flex w-full items-center justify-center border-b border-border py-4 text-base-fg outline-none"
						aria-label="Close"
						onclick={() => setOpen(false)}
					>
						<X class="h-6 w-6 stroke-[1.5]" aria-hidden="true" />
					</Button>

					<div class="flex w-full flex-col items-center gap-3 px-3 py-4">
						<Sun class="h-6 w-6 flex-none stroke-base-fg stroke-[1.5]" aria-hidden="true" />

						<div
							class="flex w-full flex-col items-center gap-1"
							role="radiogroup"
							aria-label="Colour theme"
						>
							{#each ids as id, i (id)}
								<Button
									type="button"
									role="radio"
									aria-checked={i === themeIndex}
									tabindex={i === themeIndex ? 0 : -1}
									class={[
										'relative h-9 w-full flex-none border border-border outline-none',
										i === themeIndex && 'selected'
									]}
									style="background-image: linear-gradient(to right, var(--{id}-swatch-from), var(--{id}-swatch-to)); --swatch-mark: var(--{id}-swatch-mark);"
									bind:ref={mobileButtonEls[i]}
									onclick={() => setThemeImmediate(i)}
									onkeydown={(event) =>
										onButtonKeyDown(event, i, setThemeImmediate, mobileButtonEls)}
								>
									<span
										class={[
											'h-3.5 w-3.5 bg-[var(--swatch-mark)]',
											i === themeIndex ? 'opacity-100' : 'opacity-0'
										]}
										aria-hidden="true"
									></span>
								</Button>
							{/each}
						</div>

						<Moon class="h-6 w-6 flex-none stroke-base-fg stroke-[1.5]" aria-hidden="true" />
					</div>
				</DialogContent>
			</DialogRoot>
		</div>

		<!-- sm and up: animated wipe/reveal panel -->
		<div class="absolute inset-x-0 top-full z-50 -mx-px hidden sm:block">
			<div
				class="flex w-full flex-row items-center gap-2 rounded-none border border-border bg-surface-bg px-4 py-4 sm:h-[4.5rem] sm:gap-3 sm:px-6 sm:py-0"
				transition:fade={{ duration: 160 }}
			>
				<Sun
					class="hidden h-4 w-4 flex-none stroke-base-fg stroke-[1.5] sm:block sm:h-5 sm:w-5"
					aria-hidden="true"
				/>

				<div
					class="flex flex-1 items-center gap-1 sm:gap-2"
					role="radiogroup"
					aria-label="Colour theme"
				>
					{#each ids as id, i (id)}
						<Button
							type="button"
							role="radio"
							aria-checked={i === themeIndex}
							tabindex={i === themeIndex ? 0 : -1}
							aria-disabled={transitioning}
							class={[
								'theme-swatch group relative h-16 flex-1 border border-border outline-none motion-reduce:animate-none motion-reduce:transition-none sm:h-6',
								i === themeIndex && 'selected',
								i !== themeIndex && 'hover:border-[var(--swatch-mark)]',
								transitioning && i !== themeIndex && 'opacity-0 delay-0 duration-150',
								justRevealed && i !== themeIndex && 'jump'
							]}
							style="--swatch-from: var(--{id}-swatch-from); --swatch-to: var(--{id}-swatch-to); --swatch-mark: var(--{id}-swatch-mark); --stagger-delay: {i * 40}ms;"
							bind:ref={buttonEls[i]}
							onclick={() => setTheme(i)}
							onkeydown={(event) => onButtonKeyDown(event, i, setTheme, buttonEls)}
						>
							<span
								class={[
									'h-3.5 w-3.5 bg-[var(--swatch-mark)] transition-opacity duration-150',
									i === themeIndex ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'
								]}
								aria-hidden="true"
							></span>
						</Button>
					{/each}
				</div>

				<Moon
					class="hidden h-4 w-4 flex-none stroke-base-fg stroke-[1.5] sm:block sm:h-5 sm:w-5"
					aria-hidden="true"
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	/* :global — the swatch is now the Button component's own root element
	   rather than one Svelte scopes CSS onto directly here */
	:global(.theme-swatch) {
		/* --swatch-from/-to (set inline, per-button) mirror that theme's
		   --theme-N-swatch-from/-to values from globals.css, so every button
		   shows its own place on the light-to-dark spectrum at all times, not
		   just on hover — as a subtle left-to-right gradient rather than a flat
		   fill, so a row of swatches reads a little smoother end to end */
		background-image: linear-gradient(to right, var(--swatch-from), var(--swatch-to));
		/* fade-in duration for when opacity-0/duration-150/delay-0 (applied via the
		   class array while transitioning) are removed — deliberately slower than
		   the wipe-out, so the other swatches settle back in gently once the
		   reveal has finished rather than snapping back with it.
		   --stagger-delay (set inline, per-button, proportional to its left-to-right
		   index) staggers that fade-in so the buttons reappear in order left to
		   right regardless of which one was picked; the class array zeroes it via
		   delay-0 while wiping so the wipe-out itself still happens for every
		   button at once */
		transition:
			opacity 450ms ease var(--stagger-delay, 0ms),
			filter 150ms ease;
	}

	/* .jump is only applied by JS for the brief window right after a real
	   wipe/reveal cycle — same --stagger-delay as the opacity fade above gives
	   every swatch a tiny hop as it reappears, left to right. Driven by a class
	   rather than a :not(.wiping) selector match so it doesn't also fire when
	   the panel is simply opened (which freshly inserts these buttons too) */
	:global(.theme-swatch.jump) {
		animation: swatch-jump 400ms var(--stagger-delay, 0ms) ease-out both;
	}

	@keyframes swatch-jump {
		0% {
			transform: translateY(0);
		}
		35% {
			transform: translateY(-6px);
		}
		65% {
			transform: translateY(2px);
		}
		100% {
			transform: translateY(0);
		}
	}
</style>
