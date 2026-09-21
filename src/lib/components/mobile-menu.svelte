<script>
	import { page } from '$app/state'
	import { mobileMenuOpen, menuNav } from '$lib/stores/panelState'

	let { links } = $props()

	const enterDelays = [
		'[animation-delay:250ms]',
		'[animation-delay:330ms]',
		'[animation-delay:410ms]'
	]

	let hasOpened = $state(false)
	// set once a link click hands the menu to the page-nav wipe, which erases it
	// itself — so it must vanish instantly instead of playing its own close
	let leftViaNav = $state(false)

	$effect.pre(() => {
		if ($mobileMenuOpen) {
			hasOpened = true
			leftViaNav = false
		}
	})

	$effect.pre(() => {
		if ($menuNav) leftViaNav = true
	})

	$effect(() => {
		document.body.style.overflow = $mobileMenuOpen ? 'hidden' : ''
		return () => {
			document.body.style.overflow = ''
		}
	})

	function onWindowKeyDown(event) {
		if (event.key === 'Escape') $mobileMenuOpen = false
	}

	function onAnimationEnd(event) {
		if (event.target === event.currentTarget && !$mobileMenuOpen) hasOpened = false
	}

	function onLinkClick(href) {
		if (href === page.url.pathname) $mobileMenuOpen = false
	}
</script>

<svelte:window onkeydown={onWindowKeyDown} />

<div
	id="mobile-menu"
	inert={!$mobileMenuOpen}
	onanimationend={onAnimationEnd}
	class={[
		'fixed inset-x-px top-[calc(4rem+2px)] bottom-0 z-20 flex flex-col justify-center bg-base-bg px-6 pb-[calc(4rem+2px)] sm:hidden',
		$mobileMenuOpen
			? 'animate-menu-in'
			: hasOpened && !leftViaNav
				? 'animate-menu-out'
				: 'invisible',
		$menuNav && '[view-transition-name:page-content]'
	]}
>
	{#key $mobileMenuOpen}
		<div
			class={[
				'absolute inset-x-0 h-px animate-menu-line bg-border-subtle',
				$mobileMenuOpen && '-translate-y-px'
			]}
			aria-hidden="true"
		></div>
	{/key}
	<nav class="flex flex-col gap-5">
		{#each links as { href, label }, i (href)}
			<div class="overflow-hidden">
				<a
					{href}
					onclick={() => onLinkClick(href)}
					class={[
						'block py-1 pl-2 font-display text-6xl leading-[1.15] font-bold tracking-tight text-base-fg italic',
						$mobileMenuOpen && ['animate-menu-link', enterDelays[i]]
					]}
				>
					{label}
				</a>
			</div>
		{/each}
	</nav>
</div>
