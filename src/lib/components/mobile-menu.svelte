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

	/*
		Android Chrome positions `fixed` elements against the layout viewport,
		whose origin doesn't move when the URL bar shows — unlike normal-flow
		content (the header), which always renders below it. With the bar
		visible that leaves this panel, and the line inside it, shifted up
		relative to what's actually on screen. visualViewport.offsetTop is the
		live gap between the two viewports; nudging the panel down by that much
		is the standard fix (not reset on close, so the close animation doesn't
		snap back to the wrong spot mid-play).
	*/
	let vvOffsetTop = $state(0)

	$effect(() => {
		if (!$mobileMenuOpen || !window.visualViewport) return
		const vv = window.visualViewport
		const update = () => {
			vvOffsetTop = vv.offsetTop
		}
		update()
		vv.addEventListener('resize', update)
		vv.addEventListener('scroll', update)
		return () => {
			vv.removeEventListener('resize', update)
			vv.removeEventListener('scroll', update)
		}
	})

	function onWindowKeyDown(event) {
		if (event.key === 'Escape') $mobileMenuOpen = false
	}

	function onAnimationEnd(event) {
		if (event.target === event.currentTarget && !$mobileMenuOpen) hasOpened = false
	}

	function onLinkClick(event, href) {
		// already on this page — nothing to navigate to, so skip the page-nav
		// transition entirely and just close the menu like any other close
		if (href === page.url.pathname) {
			event.preventDefault()
			$mobileMenuOpen = false
		}
	}
</script>

<svelte:window onkeydown={onWindowKeyDown} />

<div
	id="mobile-menu"
	inert={!$mobileMenuOpen}
	onanimationend={onAnimationEnd}
	style:transform={vvOffsetTop ? `translateY(${vvOffsetTop}px)` : undefined}
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
					onclick={(event) => onLinkClick(event, href)}
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
