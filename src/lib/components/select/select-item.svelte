<script>
	import { Select } from 'bits-ui'
	import Check from '@lucide/svelte/icons/check'
	import { cn } from '$lib/utils.js'

	let {
		ref = $bindable(null),
		class: className,
		value,
		label,
		children: content,
		...restProps
	} = $props()
</script>

<Select.Item
	bind:ref
	{value}
	{label}
	class={cn(
		'relative flex items-center rounded-xs py-1.5 pr-8 pl-2 text-sm text-fg outline-none select-none data-disabled:opacity-50 data-highlighted:bg-inset data-highlighted:text-fg-strong data-selected:text-primary-text',
		className
	)}
	{...restProps}
>
	{#snippet children({ selected, highlighted })}
		{#if content}
			{@render content({ selected, highlighted })}
		{:else}
			{label ?? value}
		{/if}
		{#if selected}
			<Check class="absolute right-2 size-4" />
		{/if}
	{/snippet}
</Select.Item>
