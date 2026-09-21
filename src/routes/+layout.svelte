<script>
	import '../globals.css'
	import favicon from '$lib/assets/favicon.svg'
	import { dev } from '$app/environment'
	import { injectAnalytics } from '@vercel/analytics/sveltekit'
	import { onNavigate, afterNavigate } from '$app/navigation'
	import { flushSync } from 'svelte'
	import Header from '$lib/components/header.svelte'
	import Footer from '$lib/components/footer.svelte'
	import GridLine from '$lib/components/grid-line.svelte'
	import CustomCursor from '$lib/components/custom-cursor.svelte'
	import { openPanelCount, mobileMenuOpen, menuNav } from '$lib/stores/panelState'

	injectAnalytics({ mode: dev ? 'development' : 'production' })

	let { children } = $props()
	let mainEl

	// lock page scroll while any header panel (theme switcher, logo settings) is open
	$effect(() => {
		document.body.style.overflow = $openPanelCount > 0 ? 'hidden' : ''
	})

	/*
		Page nav reveal: a line sweeps down erasing the old page, then the new
		page fades in — confined to `main` via its own `page-content`
		view-transition-name so header/footer/borders stay put.
		Both the clip-path (old page) and the line's position are driven off
		ONE custom property, --wipe-progress, updated per rAF here and read
		back via calc() in globals.css — kept as one value in one style
		recalc so clip-path's heavier repaint and the line's cheap transform
		can't drift apart under load, as two separately-scheduled animations
		would. --wipe-height (old/new's max) gives both a shared "100%" for
		the percentage-based clip-path, via object-fit: none in globals.css so
		neither snapshot gets rescaled against it.
		Reuses the View Transition approach from theme-switcher.svelte's
		revealTheme(); globals.css sets `animation: none` on both
		view-transition groups so the browser's default morph doesn't fight
		these explicit anims.
	*/
	const WIPE_DURATION = 900
	const FADE_DURATION = 500
	// fade starts slightly before the wipe finishes so they read as one motion
	const FADE_DELAY = WIPE_DURATION - 300
	// new content rises into place from just above rest, alongside the fade
	const FADE_RISE = '-16px'

	// eases the wipe's linear rAF progress into a standard ease-in-out curve
	const easeInOutCubic = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

	afterNavigate(() => {
		$mobileMenuOpen = false
	})

	/*
		Navigating from the open mobile menu: the menu takes over main's
		`page-content` name (see header.svelte / the `menuNav` store) so the
		menu itself is what the wipe erases, starting from the header line
		it's anchored under. The name only ever exists on one of the two at a
		time — hence the flush before capture and the two-step close inside
		the transition callback.
	*/
	onNavigate((navigation) => {
		if (
			!document.startViewTransition ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		) {
			$mobileMenuOpen = false
			return
		}

		const fromMenu = $mobileMenuOpen
		if (fromMenu) {
			$menuNav = true
			flushSync()
		}

		// measured before the DOM swap: pins the line to the same spot every
		// nav; only height varies between old and new
		const mainRect = mainEl?.getBoundingClientRect()
		const oldSource = fromMenu ? document.getElementById('mobile-menu') : mainEl
		const oldHeight = oldSource?.getBoundingClientRect().height ?? 0

		return new Promise((resolve) => {
			const html = document.documentElement
			// wipe-line has no real old/new geometry of its own, so pin it via
			// CSS vars read back in globals.css
			html.style.setProperty('--wipe-left', `${mainRect?.left ?? 0}px`)
			// -1px matches the real element's own -top-px offset
			html.style.setProperty('--wipe-top', `${(mainRect?.top ?? 0) - 1}px`)
			html.style.setProperty('--wipe-width', `${mainRect?.width ?? 0}px`)
			html.style.setProperty('--wipe-progress', '0')

			let rafId
			const transition = document.startViewTransition(async () => {
				resolve()
				await navigation.complete
				if (fromMenu) {
					$mobileMenuOpen = false
					flushSync()
					$menuNav = false
					flushSync()
				}
			})
			transition.finished.finally(() => {
				cancelAnimationFrame(rafId)
				$menuNav = false
				html.style.removeProperty('--wipe-left')
				html.style.removeProperty('--wipe-top')
				html.style.removeProperty('--wipe-width')
				html.style.removeProperty('--wipe-height')
				html.style.removeProperty('--wipe-progress')
			})
			transition.ready
				.then(() => {
					// DOM has swapped by now, so mainEl reflects the new page —
					// sweep to whichever of old/new is taller
					const newHeight = mainEl?.getBoundingClientRect().height ?? 0
					const wipeHeight = Math.max(oldHeight, newHeight)
					html.style.setProperty('--wipe-height', `${wipeHeight}px`)

					let start = null
					const tick = (now) => {
						if (start === null) start = now
						const progress = Math.min(1, (now - start) / WIPE_DURATION)
						html.style.setProperty('--wipe-progress', String(easeInOutCubic(progress)))
						if (progress < 1) rafId = requestAnimationFrame(tick)
					}
					rafId = requestAnimationFrame(tick)

					html.animate(
						{ opacity: [0, 1], transform: [`translateY(${FADE_RISE})`, 'translateY(0)'] },
						{
							duration: FADE_DURATION,
							delay: FADE_DELAY,
							easing: 'ease-in-out',
							fill: 'both',
							pseudoElement: '::view-transition-new(page-content)'
						}
					)
				})
				.catch(() => {})
		})
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<CustomCursor />

<div class="flex min-h-screen flex-col overflow-x-hidden bg-base-bg">
	<div class="mx-auto flex w-full max-w-6xl flex-1 flex-col border-x border-border-subtle">
		<GridLine />
		<Header />
		<GridLine />
		<main
			bind:this={mainEl}
			class={[
				'relative flex-grow',
				$menuNav ? '[view-transition-name:none]' : '[view-transition-name:page-content]'
			]}
		>
			<div
				class="pointer-events-none absolute inset-x-0 -top-px h-px bg-border-subtle [view-transition-name:wipe-line]"
				aria-hidden="true"
			></div>
			{@render children?.()}
		</main>
		<GridLine class="[view-transition-name:footer-divider]" />
		<Footer />
		<GridLine />
	</div>
</div>
