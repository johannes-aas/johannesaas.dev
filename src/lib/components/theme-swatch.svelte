<script>
	import { cn } from '$lib/utils.js'

	let { ref = $bindable(null), id, selected = false, class: className, ...restProps } = $props()
</script>

<button
	bind:this={ref}
	type="button"
	role="radio"
	aria-checked={selected}
	tabindex={selected ? 0 : -1}
	class={cn(
		'group relative grid place-items-center border border-border-subtle bg-linear-to-r from-(--swatch-from) to-(--swatch-to) outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
		className
	)}
	style:--swatch-from="var(--{id}-swatch-from)"
	style:--swatch-to="var(--{id}-swatch-to)"
	style:--swatch-mark="var(--{id}-swatch-mark)"
	{...restProps}
>
	<span
		class={[
			'size-3.5 bg-(--swatch-mark) transition-opacity duration-250',
			selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
		]}
		aria-hidden="true"
	></span>
</button>
