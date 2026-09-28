<script>
	import { resolve } from '$app/paths'
	import { page } from '$app/state'
	import { locales, localizeHref } from '$lib/paraglide/runtime'
	import '../app.css'
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

	// lock page scroll while any header panel is open
	$effect(() => {
		document.body.style.overflow = $openPanelCount > 0 ? 'hidden' : ''
	})

	/*
		Page-nav wipe: a line sweeps down erasing the old `main`, then the new page fades in.
		Clip and line both read --wipe-progress (set per rAF) so they can't drift apart under load.
		See src/styles/view-transitions.css.
	*/
	const WIPE_DURATION = 900
	const FADE_DURATION = 500
	const FADE_DELAY = WIPE_DURATION - 300
	const FADE_RISE = '-16px'

	const easeInOutCubic = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

	afterNavigate(() => {
		$mobileMenuOpen = false
	})

	// From the open mobile menu, the menu takes over `page-content` so the wipe erases it.
	// The name must live on only one element at a time, hence the flushes.
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

		const wipeWidth = mainEl?.getBoundingClientRect().width ?? 0
		const oldSource = fromMenu ? document.getElementById('mobile-menu') : mainEl
		const oldHeight = oldSource?.getBoundingClientRect().height ?? 0

		return new Promise((resolve) => {
			const html = document.documentElement
			html.style.setProperty('--wipe-width', `${wipeWidth}px`)
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
				html.style.removeProperty('--wipe-width')
				html.style.removeProperty('--wipe-height')
				html.style.removeProperty('--wipe-progress')
			})
			transition.ready
				.then(() => {
					// DOM has swapped, so mainEl is the new page; sweep the taller of the two
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

<div class="flex min-h-screen flex-col overflow-x-clip bg-body">
	<div class="mx-auto flex w-full max-w-6xl flex-1 flex-col border-x border-border-subtle">
		<GridLine />
		<Header />
		<GridLine />
		<main
			bind:this={mainEl}
			class={[
				'relative grow',
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

<div class="hidden">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }))}>{locale}</a>
	{/each}
</div>
