<script>
	import { cn } from '$lib/utils.js'

	let { level = 1, class: className, children } = $props()
</script>

<svelte:element
	this={`h${level}`}
	class={cn(
		'border-b border-border-subtle px-8 md:px-10',
		level === 1
			? 'py-12 text-5xl font-bold md:py-16 md:text-6xl'
			: 'pt-14 pb-8 text-3xl font-medium md:pt-18 md:pb-12 md:text-4xl',
		className
	)}
>
	{@render children?.()}
</svelte:element>
