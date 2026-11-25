<script>
	import { Select } from 'bits-ui'
	import { cn } from '$lib/utils.js'

	let { ref = $bindable(null), class: className, sideOffset = 4, children, ...restProps } = $props()
</script>

<Select.Content
	bind:ref
	{sideOffset}
	class={cn(
		'z-50 flex max-h-(--bits-select-content-available-height) min-w-(--bits-select-anchor-width) origin-(--bits-select-content-transform-origin) flex-col rounded-sm border border-border-subtle bg-panel p-1 shadow-lg outline-none data-[state=closed]:animate-popover-out data-[state=open]:animate-popover-in motion-reduce:animate-none',
		className
	)}
	{...restProps}
>
	<Select.Viewport class="min-h-0">
		{@render children?.()}
	</Select.Viewport>
</Select.Content>
