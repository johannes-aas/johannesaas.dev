<script>
	import ArrowRight from '@lucide/svelte/icons/arrow-right'
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right'
	import Copy from '@lucide/svelte/icons/copy'
	import { m } from '$lib/paraglide/messages'
	import { COPIED_EVENT } from '$lib/copy-to-clipboard.js'
	import { finePointer } from '$lib/pointer.js'

	let x = $state(0)
	let y = $state(0)
	let renderX = $state(0)
	let renderY = $state(0)
	let visible = $state(false)
	let copied = $state(false)
	let variant = $state('default') // 'default' | 'hover' | 'link' | 'copy' | 'read'

	const INTERACTIVE_SELECTOR =
		'a[href], button, input, select, textarea, [role="button"], .cursor-hover'
	const LINK_SELECTOR = 'a[href]'

	const isExternalLink = (target) => {
		const link = target.closest(LINK_SELECTOR)
		return (
			link instanceof HTMLAnchorElement &&
			/^https?:$/.test(link.protocol) &&
			link.origin !== window.location.origin
		)
	}
	const READ_SELECTOR = '[data-cursor="read"]'
	const COPY_SELECTOR = '[data-cursor="copy"]'
	const COPIED_DURATION = 1500

	$effect(() => {
		if (!finePointer.current) return

		let frame
		let copiedTimeout

		const tick = () => {
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

		// capture-phase pointermove: bits-ui's slider stops propagation of drag moves on document
		window.addEventListener('pointermove', handleMove, true)
		document.addEventListener('pointerleave', handleLeave)
		window.addEventListener(COPIED_EVENT, handleCopied)

		return () => {
			cancelAnimationFrame(frame)
			clearTimeout(copiedTimeout)
			window.removeEventListener(COPIED_EVENT, handleCopied)
			window.removeEventListener('pointermove', handleMove, true)
			document.removeEventListener('pointerleave', handleLeave)
			visible = false
		}
	})
</script>

{#if finePointer.current}
	{@const content = copied ? 'copied' : variant}
	{@const sizeClass =
		content === 'copied'
			? 'h-9 w-24'
			: content === 'hover'
				? 'size-8'
				: content === 'link' || content === 'copy'
					? 'size-10'
					: content === 'read'
						? 'h-9 w-22'
						: 'size-4'}
	{@const bgClass = content === 'hover' ? 'bg-cursor/60' : 'bg-cursor'}
	{@const layer = (name) => [
		'absolute flex items-center justify-center whitespace-nowrap transition-[opacity,transform] duration-200 ease-out',
		content === name ? 'scale-100 opacity-100 delay-75' : 'scale-50 opacity-0'
	]}
	<div
		class={[
			'pointer-events-none fixed top-0 left-0 z-9999 flex items-center justify-center overflow-hidden rounded-full text-sm font-semibold tracking-widest text-cursor-fg transition-[width,height,opacity,background-color] duration-200 ease-out',
			sizeClass,
			bgClass,
			!visible && 'opacity-0'
		]}
		style:transform={`translate(${renderX}px, ${renderY}px) translate(-50%, -50%)`}
	>
		<span class={layer('link')}><ArrowUpRight class="size-5" strokeWidth={2.5} /></span>
		<span class={layer('copy')}><Copy class="size-5" strokeWidth={2.5} /></span>
		<span class={[layer('read'), 'gap-1']}
			>{m.cursor_read()}<ArrowRight class="size-4" strokeWidth={2.5} /></span
		>
		<span class={layer('copied')}>{m.cursor_copied()}</span>
	</div>
{/if}
