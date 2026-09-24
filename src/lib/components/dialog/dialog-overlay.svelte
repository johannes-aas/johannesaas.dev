<script>
	import { Dialog } from 'bits-ui'
	import { cn } from '$lib/utils.js'

	let { ref = $bindable(null), class: className, ...restProps } = $props()
</script>

<Dialog.Overlay
	bind:ref
	class={cn(
		'fixed inset-0 z-40 bg-backdrop backdrop-blur-[1px] data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in motion-reduce:animate-none',
		className
	)}
	{...restProps}
/>
