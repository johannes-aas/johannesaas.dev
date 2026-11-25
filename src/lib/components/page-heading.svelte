<script>
	import { cn } from '$lib/utils.js'

	let { level = 1, class: className, children } = $props()
</script>

<svelte:element
	this={`h${level}`}
	class={cn(
		'border-b border-border-subtle px-8 md:px-10',
		level === 1
			? 'py-12 font-display text-5xl font-bold italic md:py-16 md:text-6xl'
			: 'pt-8 pb-6 text-2xl font-medium md:pt-12 md:pb-10 md:text-3xl',
		className
	)}
>
	{@render children?.()}
</svelte:element>
