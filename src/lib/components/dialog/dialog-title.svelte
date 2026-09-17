<script>
	import { Dialog } from 'bits-ui'
	import { cn } from '$lib/utils.js'

	let { ref = $bindable(null), class: className, children, ...restProps } = $props()
</script>

<Dialog.Title bind:ref class={cn(className)} {...restProps}>
	{@render children?.()}
</Dialog.Title>
