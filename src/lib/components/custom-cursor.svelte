<script>
	import { onMount } from 'svelte'
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right'
	import Copy from '@lucide/svelte/icons/copy'
	import { COPIED_EVENT } from '$lib/copy-to-clipboard.js'

	let x = $state(0)
	let y = $state(0)
	let renderX = $state(0)
	let renderY = $state(0)
	let visible = $state(false)
	let enabled = $state(false)
	let copied = $state(false)
	let variant = $state('default') // 'default' | 'hover' | 'link' | 'copy' | 'read'

	const INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, [role="button"], .cursor-hover'
	const LINK_SELECTOR = 'a[href]'

	const isExternalLink = (target) => {
		const link = target.closest(LINK_SELECTOR)
		return link instanceof HTMLAnchorElement && /^https?:$/.test(link.protocol) && link.origin !== window.location.origin
	}
	const READ_SELECTOR = '[data-cursor="read"]'
	const COPY_SELECTOR = '[data-cursor="copy"]'
	const COPIED_DURATION = 1500

	onMount(() => {
		const pointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
		if (!pointerFine) return
		enabled = true

		let frame
		let copiedTimeout

		const tick = () => {
			// light easing so the box has a touch of glide without feeling laggy
			renderX += (x - renderX) * 0.35
			renderY += (y - renderY) * 0.35
			frame = requestAnimationFrame(tick)
		}
		frame = requestAnimationFrame(tick)

		const handleMove = (e) => {
			x = e.clientX
			y = e.clientY
			if (!visible) {
				renderX = x
				renderY = y
				visible = true
			}

			const target = e.target
			if (copied) {
				// keep the confirmation up until the timeout, wherever the pointer goes
			} else if (target instanceof Element && target.closest(COPY_SELECTOR)) {
				variant = 'copy'
			} else if (target instanceof Element && target.closest(READ_SELECTOR)) {
				variant = 'read'
			} else if (target instanceof Element && isExternalLink(target)) {
				variant = 'link'
			} else if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR)) {
				variant = 'hover'
			} else {
				variant = 'default'
			}
		}

		const handleCopied = () => {
			copied = true
			clearTimeout(copiedTimeout)
			copiedTimeout = setTimeout(() => {
				copied = false
				variant = 'default'
			}, COPIED_DURATION)
		}

		const handleLeave = () => {
			visible = false
		}

		// pointermove (not mousemove) in the capture phase: a dragged element (e.g.
		// the logo playground's bits-ui slider) handles pointermove on `document`
		// and calls both preventDefault() (which suppresses the browser's
		// synthesized mousemove compat event) and stopPropagation() (which stops
		// the event before it would reach a bubble-phase listener on `window`).
		// Capturing on `window` runs before either of those can fire.
		window.addEventListener('pointermove', handleMove, true)
		document.addEventListener('pointerleave', handleLeave)
		window.addEventListener(COPIED_EVENT, handleCopied)

		return () => {
			cancelAnimationFrame(frame)
			clearTimeout(copiedTimeout)
			window.removeEventListener(COPIED_EVENT, handleCopied)
			window.removeEventListener('pointermove', handleMove, true)
			document.removeEventListener('pointerleave', handleLeave)
		}
	})
</script>

{#if enabled}
	{@const content = copied ? 'copied' : variant}
	{@const sizeClass = content === 'copied' ? 'h-9 w-24' : content === 'hover' ? 'h-8 w-8' : content === 'link' || content === 'copy' ? 'h-10 w-10' : content === 'read' ? 'h-9 w-18' : 'h-4 w-4'}
	{@const bgClass = content === 'hover' ? 'bg-cursor/60' : 'bg-cursor'}
	{@const layer = (name) => [
		'absolute flex items-center justify-center whitespace-nowrap transition-[opacity,transform] duration-200 ease-out',
		content === name ? 'scale-100 opacity-100 delay-75' : 'scale-50 opacity-0'
	]}
	<div
		class={[
			'pointer-events-none fixed top-0 left-0 z-[9999] flex items-center justify-center overflow-hidden rounded-full text-sm font-semibold tracking-widest text-base-bg transition-[width,height,opacity,background-color] duration-200 ease-out',
			sizeClass,
			bgClass,
			!visible && 'opacity-0'
		]}
		style:transform={`translate(${renderX}px, ${renderY}px) translate(-50%, -50%)`}
	>
		<span class={layer('link')}><ArrowUpRight class="size-5" strokeWidth={2.5} /></span>
		<span class={layer('copy')}><Copy class="size-5" strokeWidth={2.5} /></span>
		<span class={layer('read')}>READ</span>
		<span class={layer('copied')}>COPIED</span>
	</div>
{/if}
