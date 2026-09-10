<script>
	import { onMount } from 'svelte'

	let x = $state(0)
	let y = $state(0)
	let renderX = $state(0)
	let renderY = $state(0)
	let visible = $state(false)
	let enabled = $state(false)
	let variant = $state('default') // 'default' | 'hover' | 'read'

	const INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, [role="button"], .cursor-hover'
	const read_SELECTOR = '[data-cursor="read"]'

	onMount(() => {
		const pointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
		if (!pointerFine) return
		enabled = true

		let frame

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
			if (target instanceof Element && target.closest(read_SELECTOR)) {
				variant = 'read'
			} else if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR)) {
				variant = 'hover'
			} else {
				variant = 'default'
			}
		}

		const handleLeave = () => {
			visible = false
		}

		window.addEventListener('mousemove', handleMove)
		document.addEventListener('mouseleave', handleLeave)

		return () => {
			cancelAnimationFrame(frame)
			window.removeEventListener('mousemove', handleMove)
			document.removeEventListener('mouseleave', handleLeave)
		}
	})
</script>

{#if enabled}
	{@const sizeClass =
		variant === 'hover' ? 'h-8 w-8' : variant === 'read' ? 'h-9 w-18' : 'h-4 w-4'}
	{@const bgClass = variant === 'hover' ? 'bg-[var(--cursor)]/60' : 'bg-[var(--cursor)]'}
	<div
		class="pointer-events-none fixed top-0 left-0 z-[9999] flex items-center justify-center rounded-full text-sm font-semibold tracking-widest text-[var(--base-bg)] transition-[width,height,opacity,background-color] duration-200 ease-out {sizeClass} {bgClass}"
		class:opacity-0={!visible}
		style:transform={`translate(${renderX}px, ${renderY}px) translate(-50%, -50%)`}
	>
		{#if variant === 'read'}
			READ
		{/if}
	</div>
{/if}
