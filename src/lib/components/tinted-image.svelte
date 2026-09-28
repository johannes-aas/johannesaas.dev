<script>
	import { cn } from '$lib/utils.js'

	let { src, alt, mirrored = false, class: className, ...restProps } = $props()
</script>

<div class={cn('relative overflow-hidden rounded-sm', className)} {...restProps}>
	<img
		{src}
		{alt}
		class={cn('size-full object-cover contrast-110 grayscale-80', mirrored && '-scale-x-100')}
	/>
	<div class="absolute inset-0 bg-primary opacity-20 mix-blend-color"></div>
</div>
