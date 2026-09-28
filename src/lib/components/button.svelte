<script>
	import { Button as ButtonPrimitive } from 'bits-ui'
	import { cn } from '$lib/utils.js'
	import { copyToClipboard } from '$lib/copy-to-clipboard.js'
	import { finePointer } from '$lib/pointer.js'

	// copy: copies the value on click. email: copies on cursor devices, opens mailto: on touch
	let {
		ref = $bindable(null),
		class: className,
		variant,
		copy,
		email,
		children,
		...restProps
	} = $props()

	const cell =
		'border border-border-subtle text-fg hover:text-fg-strong [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.75] sm:[&_svg]:size-5'

	const variants = {
		cell,
		header: [cell, '-my-px -mr-px w-16 flex-none self-stretch sm:w-18'],
		outline:
			'border border-border px-4 py-2 text-sm text-fg hover:border-border-strong hover:text-fg-strong',
		primary: 'bg-primary px-4 py-2 text-sm font-medium text-primary-fg'
	}

	let copyValue = $derived(copy ?? (finePointer.current ? email : undefined))

	let behavior = $derived(
		copyValue
			? { type: 'button', 'data-cursor': 'copy', onclick: () => copyToClipboard(copyValue) }
			: email
				? { href: `mailto:${email}` }
				: {}
	)
</script>

<ButtonPrimitive.Root
	bind:ref
	class={cn(
		'inline-flex items-center justify-center gap-1.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50',
		variants[variant],
		className
	)}
	{...restProps}
	{...behavior}
>
	{@render children?.()}
</ButtonPrimitive.Root>
