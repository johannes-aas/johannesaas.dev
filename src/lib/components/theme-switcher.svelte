<script>
	import { onMount, flushSync } from 'svelte'
	import { Dialog } from 'bits-ui'
	import { fade } from 'svelte/transition'
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
	let toggleEl = $state(null)
	let buttonEls = $state(Array(ids.length).fill(null))
	let mobileButtonEls = $state(Array(ids.length).fill(null))
	let transitionTimer
	let jumpTimer
	let transitioning = $state(false)
	// set synchronously on click; themeIndex only changes inside the view transition callback
	let locked = false
	// only after a real switch, so the jump doesn't play when the panel just opens
	let justRevealed = $state(false)

	const revealDuration = (i) => 400 + i * 40

	function triggerJump() {
		justRevealed = true
		clearTimeout(jumpTimer)
		jumpTimer = setTimeout(() => {
			justRevealed = false
		}, revealDuration(last))
	}

	onMount(() => {
		const saved = localStorage.getItem('theme')
		if (saved && ids.includes(saved)) {
			themeIndex = ids.indexOf(saved)
		} else {
			themeIndex = window.matchMedia('(prefers-color-scheme: dark)').matches ? last : 0
		}
		applyTheme(themeIndex, false)

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

	function crossFadeTheme(i) {
		const html = document.documentElement
		html.classList.add('theme-transition')
		clearTimeout(transitionTimer)
		transitionTimer = setTimeout(() => {
			html.classList.remove('theme-transition')
			transitioning = false
			locked = false
			triggerJump()
		}, 1800)
		transitioning = true
		themeIndex = i
		swapTheme()
	}

	// percentages, not px: Chrome misplaces px clip-paths on fractional display scaling
	function buttonClipPaths(buttonRect, vw, vh) {
		const toX = (px) => `${(px / vw) * 100}%`
		const toY = (py) => `${(py / vh) * 100}%`
		const point = (px, py) => `${toX(px)} ${toY(py)}`
		const x = buttonRect.left + buttonRect.width / 2
		const y = buttonRect.top + buttonRect.height / 2
		const scale = Math.max((2 * Math.max(x, vw - x)) / vw, (2 * Math.max(y, vh - y)) / vh) * 1.05
		const halfW = (scale * vw) / 2
		const halfH = (scale * vh) / 2
		const collapsed = `polygon(${[
			point(buttonRect.left, buttonRect.top),
			point(buttonRect.right, buttonRect.top),
			point(buttonRect.right, buttonRect.bottom),
			point(buttonRect.left, buttonRect.bottom)
		].join(', ')})`
		const expanded = `polygon(${[
			point(x - halfW, y - halfH),
			point(x + halfW, y - halfH),
			point(x + halfW, y + halfH),
			point(x - halfW, y + halfH)
		].join(', ')})`
		return [collapsed, expanded]
	}

	function revealTheme(i, originRect) {
		const html = document.documentElement
		const [from, to] = buttonClipPaths(originRect, window.innerWidth, window.innerHeight)

		html.style.setProperty('--theme-reveal-clip-from', from)
		html.classList.add('theme-reveal')

		let anim
		const transition = document.startViewTransition(() => {
			flushSync(() => {
				transitioning = true
				themeIndex = i
			})
			swapTheme()
		})
		transition.ready
			.then(
				() =>
					(anim = html.animate(
						{ clipPath: [from, to] },
						{
							duration: 1000,
							easing: 'ease-in-out',
							fill: 'forwards',
							pseudoElement: '::view-transition-new(root)'
						}
					)).finished
			)
			.catch(() => {})
			// waits on our own animation: Safari resolves transition.finished as soon as `ready` settles
			.finally(() => {
				anim?.cancel()
				html.classList.remove('theme-reveal')
				html.style.removeProperty('--theme-reveal-clip-from')
				transitioning = false
				locked = false
				triggerJump()
			})
	}

	function applyTheme(i, animate = true, originRect = null) {
		if (!animate) {
			themeIndex = i
			return swapTheme()
		}

		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		if (reduced || !document.startViewTransition) {
			crossFadeTheme(i)
			return
		}
		revealTheme(i, originRect ?? toggleEl.getBoundingClientRect())
	}

	// mobile browsers tint their chrome from <meta name="theme-color">, which CSS can't reach
	function syncThemeColor(html) {
		const meta = document.querySelector('meta[name="theme-color"]')
		if (!meta) return
		const bg = getComputedStyle(html).getPropertyValue('--color-body').trim()
		if (bg) meta.setAttribute('content', bg)
	}

	function setTheme(i) {
		if (locked || i === themeIndex) return
		locked = true
		localStorage.setItem('theme', ids[i])
		applyTheme(i, true, buttonEls[i]?.getBoundingClientRect())
	}

	function setThemeImmediate(i) {
		if (i === themeIndex) return
		localStorage.setItem('theme', ids[i])
		applyTheme(i, false)
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
	function onButtonKeyDown(event, i, setFn, els) {
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
		setFn(next)
		els[next]?.focus()
	}

	function onWindowPointerDown(event) {
		// the view transition overlay hit-tests to <html>, so clicks would look like outside clicks
		if (transitioning || isMobile) return
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
		bind:ref={toggleEl}
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
								onclick={() => setThemeImmediate(i)}
								onkeydown={(event) => onButtonKeyDown(event, i, setThemeImmediate, mobileButtonEls)}
							/>
						{/each}
					</div>

					<Moon class="size-6 flex-none stroke-fg-strong stroke-[1.5]" aria-hidden="true" />
				</div>
			</DialogContent>
		</Dialog.Portal>
	</DialogRoot>

	{#if open}
		<div class="absolute inset-x-0 top-full z-50 -mx-px hidden sm:block">
			<div
				class="flex h-18 w-full items-center border border-border-subtle bg-panel"
				transition:fade={{ duration: 160 }}
			>
				<span class="grid w-[calc(--spacing(18)-1px)] flex-none place-items-center">
					<Sun class="size-5 stroke-fg-strong stroke-[1.5]" aria-hidden="true" />
				</span>

				<div class="flex flex-1 items-center gap-2" role="radiogroup" aria-label={m.theme_label()}>
					{#each ids as id, i (id)}
						{@const selected = i === themeIndex}
						<ThemeSwatch
							{id}
							{selected}
							aria-disabled={transitioning}
							class={[
								'h-6 flex-1 transition-opacity motion-reduce:animate-none motion-reduce:transition-none',
								transitioning && !selected
									? 'opacity-0 duration-150'
									: 'delay-(--stagger-delay) duration-450',
								justRevealed &&
									!selected &&
									'animate-swatch-jump [animation-delay:var(--stagger-delay)]'
							]}
							style="--stagger-delay: {i * 40}ms"
							bind:ref={buttonEls[i]}
							onclick={() => setTheme(i)}
							onkeydown={(event) => onButtonKeyDown(event, i, setTheme, buttonEls)}
						/>
					{/each}
				</div>

				<span class="grid w-[calc(--spacing(18)-1px)] flex-none place-items-center">
					<Moon class="size-5 stroke-fg-strong stroke-[1.5]" aria-hidden="true" />
				</span>
			</div>
		</div>
	{/if}
</div>
