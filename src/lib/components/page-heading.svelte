<script>
	import { cn } from '$lib/utils.js'

	let { level = 1, class: className, children } = $props()
</script>

<svelte:element
	this={`h${level}`}
	class={cn(
		'border-b border-border-subtle px-8 md:px-10 font-display italic',
		level === 1
			? 'py-12 text-5xl font-bold md:py-16 md:text-6xl'
			: 'py-8 text-4xl font-bold md:py-12 md:text-5xl',
		className
	)}
>
	{@render children?.()}
</svelte:element>
