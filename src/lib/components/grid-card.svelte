<script>
	import { cn } from '$lib/utils.js'

	let { href, class: className, children, ...restProps } = $props()
</script>

<!-- -mt-px / md:even:-ml-px collapse neighbouring borders; hover:z-10 lifts the stronger border above them -->
<svelte:element
	this={href ? 'a' : 'div'}
	{href}
	class={cn(
		'relative -mt-px block border border-border-subtle p-8 transition-colors hover:z-10 hover:border-border-strong md:p-10 md:even:-ml-px',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
