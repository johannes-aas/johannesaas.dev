<script>
	import { cn } from '$lib/utils.js'

	let { level = 1, class: className, children } = $props()
</script>

<svelte:element
	this={`h${level}`}
	class={cn(
		'border-b border-border-subtle px-8 py-12 md:px-10 md:py-16',
		level === 1 ? 'text-5xl font-bold md:text-6xl' : 'text-4xl font-medium md:text-5xl',
		className
	)}
>
	{@render children?.()}
</svelte:element>
