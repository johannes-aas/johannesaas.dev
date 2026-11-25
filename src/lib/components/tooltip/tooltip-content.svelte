<script>
	import { Tooltip } from 'bits-ui'
	import { cn } from '$lib/utils.js'

	let { ref = $bindable(null), class: className, sideOffset = 8, children, ...restProps } = $props()
</script>

<Tooltip.Content
	bind:ref
	{sideOffset}
	class={cn(
		'z-50 origin-(--bits-tooltip-content-transform-origin) animate-popover-in rounded-sm bg-fg-strong px-2.5 py-1.5 text-xs whitespace-nowrap text-body data-[state=closed]:animate-popover-out motion-reduce:animate-none',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</Tooltip.Content>
