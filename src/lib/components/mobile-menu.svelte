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
	// the page-nav wipe erases the menu itself, so skip its own close animation
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

	// Android positions `fixed` against the layout viewport, which ignores the URL bar.
	// Not reset on close, so the close animation doesn't jump mid-play.
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
		'fixed inset-x-px top-[calc(--spacing(16)+2px)] bottom-0 z-20 flex flex-col justify-center bg-body px-6 pb-[calc(--spacing(16)+2px)] sm:hidden',
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
						'block py-1 pl-2 font-display text-6xl leading-[1.15] font-bold tracking-tight text-fg-strong italic',
						$mobileMenuOpen && ['animate-menu-link', enterDelays[i]]
					]}
				>
					{label}
				</a>
			</div>
		{/each}
	</nav>
</div>
