<script>
	import { onMount } from 'svelte'
	import { Dialog } from 'bits-ui'
	import { fly } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import { openPanelCount } from '$lib/stores/panelState'
	import { m } from '$lib/paraglide/messages'
	import Button from '$lib/components/button.svelte'
	import ThemeSwatch from '$lib/components/theme-swatch.svelte'
	import { DialogRoot, DialogOverlay, DialogContent, DialogTitle } from '$lib/components/dialog'
	import Sun from '@lucide/svelte/icons/sun'
	import Moon from '@lucide/svelte/icons/moon'
	import X from '@lucide/svelte/icons/x'
	import Palette from '@lucide/svelte/icons/palette'

	// ordered lightest to darkest
	const ids = ['theme-1', 'theme-2', 'theme-3', 'theme-4', 'theme-5', 'theme-6']
	const last = ids.length - 1

	let themeIndex = $state(0)
	let open = $state(false)
	// JS state, not a CSS breakpoint: bits-ui's dialog layers swallow pointer events even when hidden
	let isMobile = $state(false)
	let container
	let buttonEls = $state(Array(ids.length).fill(null))
	let mobileButtonEls = $state(Array(ids.length).fill(null))
	let fadeTimer
	// the 600ms fade in theme.css, plus a little margin
	const FADE_MS = 700

	onMount(() => {
		const saved = ids.indexOf(localStorage.getItem('theme'))
		const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? last : 0
		applyTheme(saved === -1 ? preferred : saved, false)

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

	function applyTheme(i, animate = true) {
		themeIndex = i
		if (!animate) return swapTheme()

		const html = document.documentElement
		// hold the old color-scheme until the fade ends: flipping it as the transitions start makes
		// Chrome restart them every frame, so text crawls to grey and then snaps
		html.style.colorScheme ||= getComputedStyle(html).colorScheme
		html.classList.add('theme-transition')
		swapTheme()
		clearTimeout(fadeTimer)
		fadeTimer = setTimeout(() => {
			html.classList.remove('theme-transition')
			html.style.removeProperty('color-scheme')
		}, FADE_MS)
	}

	// mobile browsers tint their chrome from <meta name="theme-color">, which CSS can't reach
	function syncThemeColor(html) {
		const meta = document.querySelector('meta[name="theme-color"]')
		if (!meta) return
		const bg = getComputedStyle(html).getPropertyValue('--color-body').trim()
		if (bg) meta.setAttribute('content', bg)
	}

	function setTheme(i) {
		if (i === themeIndex) return
		localStorage.setItem('theme', ids[i])
		applyTheme(i)
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

	// roving tabindex: arrow keys move focus and pick the theme (ARIA radiogroup pattern)
	function onButtonKeyDown(event, i, els) {
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
		setTheme(next)
		els[next]?.focus()
	}

	function onWindowPointerDown(event) {
		if (isMobile) return
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
		variant="header"
		class={open && 'bg-panel text-fg-strong'}
		onclick={toggle}
		aria-label={m.theme_label()}
		aria-expanded={open}
	>
		<span class="relative grid size-4 place-items-center sm:size-5">
			<!-- the icon only swaps at sm+; the mobile dialog has its own close button -->
			<span
				class={[
					'absolute inset-0 grid scale-100 place-items-center opacity-100 transition-all duration-200 ease-out',
					open && 'sm:scale-75 sm:opacity-0'
				]}
			>
				<Palette aria-hidden="true" />
			</span>
			<span
				class={[
					'absolute inset-0 grid scale-75 place-items-center opacity-0 transition-all duration-200 ease-out',
					open && 'sm:scale-100 sm:opacity-100'
				]}
			>
				<X aria-hidden="true" />
			</span>
		</span>
	</Button>

	<!-- portalled: the header's backdrop-blur would otherwise be the containing block for `fixed` -->
	<DialogRoot open={open && isMobile} onOpenChange={setOpen}>
		<Dialog.Portal>
			<DialogOverlay />
			<DialogContent
				class="fixed top-1/2 left-1/2 flex w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center border border-border-subtle bg-panel shadow-lg"
			>
				<DialogTitle class="sr-only">{m.theme_label()}</DialogTitle>

				<Button
					class="w-full border-b border-border-subtle py-4 text-fg-strong outline-none"
					aria-label={m.theme_close()}
					onclick={() => setOpen(false)}
				>
					<X class="size-6 stroke-[1.5]" aria-hidden="true" />
				</Button>

				<div class="flex w-full flex-col items-center gap-3 px-3 py-4">
					<Sun class="size-6 flex-none stroke-fg-strong stroke-[1.5]" aria-hidden="true" />

					<div
						class="flex w-full flex-col items-center gap-1"
						role="radiogroup"
						aria-label={m.theme_label()}
					>
						{#each ids as id, i (id)}
							<ThemeSwatch
								{id}
								selected={i === themeIndex}
								class="h-9 w-full flex-none"
								bind:ref={mobileButtonEls[i]}
								onclick={() => setTheme(i)}
								onkeydown={(event) => onButtonKeyDown(event, i, mobileButtonEls)}
							/>
						{/each}
					</div>

					<Moon class="size-6 flex-none stroke-fg-strong stroke-[1.5]" aria-hidden="true" />
				</div>
			</DialogContent>
		</Dialog.Portal>
	</DialogRoot>

	{#if open}
		<!-- 100% is the header's height. clip, not hidden: focusing a swatch would scroll a hidden box and skip the slide -->
		<div
			class="absolute top-full right-0 z-50 hidden h-[calc(100dvh-100%-1px)] w-[calc(9rem-2px)] overflow-clip sm:block"
		>
			<div
				class="flex h-full flex-col overflow-y-auto overscroll-contain border-t border-l border-border-subtle bg-panel"
				transition:fly={{ x: '100%', opacity: 1, duration: 400, easing: cubicOut }}
			>
				<!-- my-auto, not justify-center: keeps the top reachable when it overflows -->
				<div class="my-auto flex flex-col items-center gap-4 py-6">
					<Sun class="size-5 flex-none stroke-fg-strong stroke-[1.5]" aria-hidden="true" />

					<div
						class="flex flex-col items-center gap-2"
						role="radiogroup"
						aria-label={m.theme_label()}
					>
						{#each ids as id, i (id)}
							<ThemeSwatch
								{id}
								selected={i === themeIndex}
								class="h-12 w-28 flex-none"
								bind:ref={buttonEls[i]}
								onclick={() => setTheme(i)}
								onkeydown={(event) => onButtonKeyDown(event, i, buttonEls)}
							/>
						{/each}
					</div>

					<Moon class="size-5 flex-none stroke-fg-strong stroke-[1.5]" aria-hidden="true" />
				</div>
			</div>
		</div>
	{/if}
</div>
