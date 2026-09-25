<script>
	import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui'
	import { getToggleGroupContext } from './context.js'
	import { cn } from '$lib/utils.js'

	let {
		ref = $bindable(null),
		class: className,
		value,
		disabled = false,
		children,
		...restProps
	} = $props()

	const ctx = getToggleGroupContext()

	$effect(() => {
		if (!ref) return
		return ctx.registerItem(value, ref)
	})
</script>

<ToggleGroupPrimitive.Item
	{value}
	{disabled}
	bind:ref
	class={cn(
		'relative z-10 w-full py-1 text-center text-sm transition-colors duration-200',
		ctx.value === value ? 'text-primary-fg' : 'text-fg',
		className
	)}
	{...restProps}
>
	{@render children()}
</ToggleGroupPrimitive.Item>
