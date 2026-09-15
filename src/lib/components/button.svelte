<script>
	import { Button as ButtonPrimitive } from 'bits-ui'
	import { cn } from '$lib/utils.js'

	let { ref = $bindable(null), class: className, children, ...restProps } = $props()
</script>

<ButtonPrimitive.Root
	bind:ref
	class={cn(
		'inline-flex cursor-pointer items-center justify-center gap-1.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</ButtonPrimitive.Root>
