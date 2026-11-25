<script>
	import { Select } from 'bits-ui'
	import { cn } from '$lib/utils.js'

	let { ref = $bindable(null), class: className, ...restProps } = $props()
</script>

<Select.Value bind:ref class={cn('truncate', className)} {...restProps} />
