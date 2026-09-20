<script>
	import { Dialog } from 'bits-ui'
	import { cn } from '$lib/utils.js'

	let { ref = $bindable(null), class: className, children, ...restProps } = $props()
</script>

<Dialog.Content
	bind:ref
	class={cn(
		'z-50 outline-none data-[state=closed]:animate-dialog-out data-[state=open]:animate-dialog-in motion-reduce:animate-none',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</Dialog.Content>
