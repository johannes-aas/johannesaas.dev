<script>
	import { cn } from '$lib/utils.js'

	// interactive: the card is clickable through a link inside it, so it gets the hover border too
	let { href, interactive = false, class: className, children, ...restProps } = $props()
</script>

<!-- -mt-px / md:even:-ml-px collapse neighbouring borders; hover:z-10 lifts the stronger border above them -->
<svelte:element
	this={href ? 'a' : 'div'}
	{href}
	class={cn(
		'relative -mt-px block border border-border-subtle p-8 md:p-10 md:even:-ml-px',
		(href || interactive) && 'transition-colors hover:z-10 hover:border-border-strong',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
