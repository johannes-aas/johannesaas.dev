<script>
	import { cn } from '$lib/utils.js'

	let { class: className } = $props()
</script>

<div
	class={cn('relative left-1/2 h-px w-screen -translate-x-1/2 bg-border-subtle', className)}
	aria-hidden="true"
></div>
