<script>
	import '../globals.css'
	import favicon from '$lib/assets/favicon.svg'
	import { dev } from '$app/environment'
	import { injectAnalytics } from '@vercel/analytics/sveltekit'
	import Header from '$lib/components/header.svelte'
	import Footer from '$lib/components/footer.svelte'
	import GridLine from '$lib/components/grid-line.svelte'
	import CustomCursor from '$lib/components/custom-cursor.svelte'
	import { openPanelCount } from '$lib/stores/panelState'

	injectAnalytics({ mode: dev ? 'development' : 'production' })

	let { children } = $props()

	// lock page scroll while any header panel (theme switcher, logo settings) is open
	$effect(() => {
		document.body.style.overflow = $openPanelCount > 0 ? 'hidden' : ''
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<CustomCursor />

<div class="flex min-h-screen flex-col overflow-x-hidden bg-base-bg">
	<div class="mx-auto flex w-full max-w-6xl flex-1 flex-col border-x border-border">
		<Header />
		<GridLine />
		<main class="flex-grow">
			{@render children?.()}
		</main>
		<GridLine />
		<Footer />
	</div>
</div>
