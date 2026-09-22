<script>
	import { cn } from '$lib/utils.js'

	let { src, alt, mirrored = false, class: className, ...restProps } = $props()
</script>

<div class={cn('relative overflow-hidden', className)} {...restProps}>
	<img
		{src}
		{alt}
		class={cn('h-full w-full object-cover grayscale-80 contrast-110', mirrored && '-scale-x-100')}
	/>
	<div class="absolute inset-0 bg-accent mix-blend-color opacity-30"></div>
</div>
