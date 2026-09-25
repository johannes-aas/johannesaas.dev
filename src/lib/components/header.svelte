<script>
	import MobileMenu from './mobile-menu.svelte'
	import Logo from './logo.svelte'
	import ThemeSwitcher from './theme-switcher.svelte'
	import LanguageSwitcher from './language-switcher.svelte'
	import { m } from '$lib/paraglide/messages'
	import { localizeHref } from '$lib/paraglide/runtime'
	import Button from '$lib/components/button.svelte'
	import { mobileMenuOpen } from '$lib/stores/panelState'

	const links = [
		{ href: localizeHref('/about'), label: m.nav_about() },
		{ href: localizeHref('/projects'), label: m.nav_projects() },
		{ href: localizeHref('/blog'), label: m.nav_blog() }
	]

	function toggleMenu() {
		if (!$mobileMenuOpen) window.scrollTo({ top: 0, behavior: 'instant' })
		$mobileMenuOpen = !$mobileMenuOpen
	}
</script>

<header class="relative z-30 flex items-center backdrop-blur-md">
	<a href={localizeHref('/')} class="box-border h-16 w-16 flex-none p-3.5 sm:h-[4.5rem] sm:w-[4.5rem] sm:p-4">
		<Logo />
	</a>
	<nav class="hidden flex-1 items-center justify-center gap-8 text-base sm:flex">
		{#each links as { href, label } (href)}
			<a {href} class="text-fg-muted transition-colors hover:text-fg-strong">{label}</a>
		{/each}
	</nav>
	<div class="ml-auto flex items-center self-stretch">
		<LanguageSwitcher />
		<ThemeSwitcher />
		<Button
			class={[
				'-mt-px -mr-px -mb-px grid w-16 flex-none place-items-center self-stretch border border-border-subtle text-fg-muted hover:text-fg-strong sm:hidden',
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
