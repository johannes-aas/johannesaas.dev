<script>
	import '../globals.css'
	import favicon from '$lib/assets/favicon.svg'
	import { dev } from '$app/environment'
	import { injectAnalytics } from '@vercel/analytics/sveltekit'
	import Header from '$lib/components/Header.svelte'
	import Footer from '$lib/components/Footer.svelte'
	import CustomCursor from '$lib/components/CustomCursor.svelte'
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

<div class="flex min-h-screen flex-col bg-base-bg">
	<Header />
	<main class="flex-grow">
		{@render children?.()}
	</main>
	<Footer />
</div>
