<script>
	import { Select } from 'bits-ui'
	import ChevronDown from '@lucide/svelte/icons/chevron-down'
	import { cn } from '$lib/utils.js'

	let { ref = $bindable(null), class: className, children, ...restProps } = $props()
</script>

<Select.Trigger
	bind:ref
	class={cn(
		'group inline-flex items-center justify-between gap-2 rounded-sm border border-border-subtle py-1 pr-2 pl-3 text-sm text-fg transition-colors duration-200 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary data-[state=open]:border-border-strong',
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<ChevronDown
		class="size-4 shrink-0 text-fg-muted transition-transform duration-200 group-data-[state=open]:rotate-180"
	/>
</Select.Trigger>
