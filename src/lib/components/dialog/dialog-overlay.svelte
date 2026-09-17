<script>
	import { Dialog } from 'bits-ui'
	import { cn } from '$lib/utils.js'

	let { ref = $bindable(null), class: className, ...restProps } = $props()
</script>

<Dialog.Overlay
	bind:ref
	class={cn(
		'fixed inset-0 z-40 bg-[color-mix(in_srgb,var(--base-bg)_25%,transparent)] backdrop-blur-[1px]',
		className
	)}
	{...restProps}
/>
