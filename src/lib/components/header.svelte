<script>
	import { onMount } from 'svelte'
	import MobileMenu from './mobile-menu.svelte'
	import Logo from './logo.svelte'
	import ThemeSwitcher from './theme-switcher.svelte'
	import LanguageSwitcher from './language-switcher.svelte'
	import { page } from '$app/state'
	import { m } from '$lib/paraglide/messages'
	import { localizeHref } from '$lib/paraglide/runtime'
	import Button from '$lib/components/button.svelte'
	import { mobileMenuOpen } from '$lib/stores/panelState'

	const links = [
		{ href: localizeHref('/about'), label: m.nav_about() },
		{ href: localizeHref('/projects'), label: m.nav_projects() },
		{ href: localizeHref('/blog'), label: m.nav_blog() }
	]

	let nav = $state()
	let linkEls = $state([])
	let indicatorX = $state(0)
	let indicatorVisible = $state(false)
	let slide = $state(false)
	let ready = $state(false)

	function measure() {
		const el = linkEls[links.findIndex((l) => l.href === page.url.pathname)]
		if (!el || !nav) {
			indicatorVisible = false
			return
		}
		slide = indicatorVisible
		indicatorX = el.offsetLeft + el.offsetWidth / 2 - 8
		indicatorVisible = true
	}

	$effect(() => {
		page.url.pathname
		measure()
	})

	onMount(() => {
		const observer = new ResizeObserver(measure)
		observer.observe(nav)
		let frame
		document.fonts.ready.then(() => {
			measure()
			frame = requestAnimationFrame(() => (ready = true))
		})
		return () => {
			observer.disconnect()
			cancelAnimationFrame(frame)
		}
	})

	function toggleMenu() {
		if (!$mobileMenuOpen) window.scrollTo({ top: 0, behavior: 'instant' })
		$mobileMenuOpen = !$mobileMenuOpen
	}
</script>

<svelte:window onresize={measure} />

<header class="relative z-30 flex items-center backdrop-blur-md">
	<a
		href={page.url.pathname === localizeHref('/') ? undefined : localizeHref('/')}
		aria-current={page.url.pathname === localizeHref('/') ? 'page' : undefined}
		class="box-border h-16 w-16 flex-none p-3.5 sm:h-[4.5rem] sm:w-[4.5rem] sm:p-4">
		<Logo />
	</a>
	<nav bind:this={nav} class="relative hidden flex-1 items-center justify-center gap-8 text-base sm:flex">
		{#each links as { href, label }, i (href)}
			{@const current = href === page.url.pathname}
			<a
				bind:this={linkEls[i]}
				href={current ? undefined : href}
				aria-current={current ? 'page' : undefined}
				aria-disabled={current || undefined}
				class={current ? 'text-fg-strong' : 'text-fg hover:text-fg-strong hover:transition-colors'}
			>
				{label}
			</a>
		{/each}
		<span
			aria-hidden="true"
			style:transform={`translateX(${indicatorX}px)`}
			class={[
				'pointer-events-none absolute bottom-[-0.6rem] left-0 h-[3px] w-4 bg-primary',
				indicatorVisible ? 'opacity-100' : 'opacity-0',
				ready &&
					(slide ? 'transition-[transform,opacity]' : 'transition-opacity') +
						' duration-300 ease-in-out'
			]}
		></span>
	</nav>
	<div class="ml-auto flex items-center self-stretch">
		<LanguageSwitcher />
		<ThemeSwitcher />
		<Button
			class={[
				'-mt-px -mr-px -mb-px grid w-16 flex-none place-items-center self-stretch border border-border-subtle text-fg hover:text-fg-strong sm:hidden',
				$mobileMenuOpen && 'bg-panel text-fg-strong'
			]}
			onclick={toggleMenu}
			aria-label={$mobileMenuOpen ? m.nav_close_menu() : m.nav_open_menu()}
			aria-expanded={$mobileMenuOpen}
			aria-controls="mobile-menu"
		>
			<span class="relative block h-6 w-6" aria-hidden="true">
				<span
					class={[
						'absolute top-1/2 left-0 h-px w-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]',
						$mobileMenuOpen ? 'translate-y-0 rotate-45' : '-translate-y-[4px]'
					]}
				></span>
				<span
					class={[
						'absolute top-1/2 left-0 h-px w-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]',
						$mobileMenuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-[4px]'
					]}
				></span>
			</span>
		</Button>
	</div>
</header>

<MobileMenu {links} />
