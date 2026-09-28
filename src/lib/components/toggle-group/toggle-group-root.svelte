<script>
	import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui'
	import { setToggleGroupContext } from './context.js'
	import { cn } from '$lib/utils.js'

	let {
		ref = $bindable(null),
		class: className,
		value,
		onValueChange,
		label = undefined,
		disabled = false,
		children,
		...restProps
	} = $props()

	let thumbVisible = $state(false)
	let thumbLeft = $state(0)
	let thumbWidth = $state(0)

	// plain Map with imperative measure(): a reactive version formed an update loop
	const items = new Map()

	function measure() {
		const el = items.get(value)
		if (!el) {
			thumbVisible = false
			return
		}
		thumbLeft = el.offsetLeft
		thumbWidth = el.offsetWidth
		thumbVisible = true
	}

	function registerItem(itemValue, el) {
		items.set(itemValue, el)
		measure()
		return () => {
			items.delete(itemValue)
			measure()
		}
	}

	setToggleGroupContext({
		get value() {
			return value
		},
		registerItem
	})

	$effect(() => {
		value
		measure()
	})

	$effect(() => {
		if (!ref) return
		const observer = new ResizeObserver(measure)
		observer.observe(ref)
		return () => observer.disconnect()
	})
</script>

<ToggleGroupPrimitive.Root
	type="single"
	bind:ref
	{value}
	{disabled}
	aria-label={label}
	onValueChange={(v) => {
		// bits-ui deselects to "" on a repeat click; keep one option selected like a radio group
		if (v) onValueChange(v)
	}}
	class={cn(
		'relative flex w-full overflow-hidden rounded-sm border border-border-subtle',
		className
	)}
	{...restProps}
>
	{#if thumbVisible}
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-y-0 rounded-sm bg-primary transition-[transform,width] duration-200 ease-in-out"
			style:width="{thumbWidth}px"
			style:transform="translateX({thumbLeft}px)"
		></div>
	{/if}
	{@render children()}
</ToggleGroupPrimitive.Root>
