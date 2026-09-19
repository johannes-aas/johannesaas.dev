<script>
	import { Button as ButtonPrimitive } from 'bits-ui'
	import { cn } from '$lib/utils.js'
	import { copyToClipboard } from '$lib/copy-to-clipboard.js'

	// variant="copy" turns the button into a copy-to-clipboard button: clicking it
	// copies `value` and the custom cursor shows a "copied" confirmation
	let { ref = $bindable(null), class: className, variant, value, children, ...restProps } = $props()

	const baseClass =
		'inline-flex cursor-pointer items-center justify-center gap-1.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50'
</script>

{#if variant === 'copy'}
	<ButtonPrimitive.Root
		bind:ref
		type="button"
		data-cursor="copy"
		class={cn(baseClass, className)}
		onclick={() => copyToClipboard(value)}
		{...restProps}
	>
		{@render children?.()}
	</ButtonPrimitive.Root>
{:else}
	<ButtonPrimitive.Root bind:ref class={cn(baseClass, className)} {...restProps}>
		{@render children?.()}
	</ButtonPrimitive.Root>
{/if}
