<script>
	import { getLocale, localizeHref } from '$lib/paraglide/runtime'
	import { m } from '$lib/paraglide/messages'
	import Button from '$lib/components/button.svelte'
	import ArrowLeft from '@lucide/svelte/icons/arrow-left'

	let { date, children } = $props()
</script>

<section class="mx-auto max-w-3xl px-4 py-16">
	<article
		class="relative mx-auto flex max-w-[65ch] flex-col text-base leading-[1.6] [&_h1]:mb-3 [&_h1]:text-4xl [&_h1]:leading-none [&_h1]:font-bold [&>:not(a):not(time):not(h1)]:order-3 [&>h1]:order-1"
	>
		<Button
			href={localizeHref('/blog')}
			class="group mb-10 self-start text-sm text-fg-muted hover:text-fg-strong lg:absolute lg:top-2 lg:right-full lg:mr-16 lg:mb-0"
		>
			<ArrowLeft class="size-4 transition-transform group-hover:-translate-x-0.5" />
			{m.nav_blog()}
		</Button>
		{#if date}
			<time datetime={date} class="order-2 mt-2 mb-6 text-sm tracking-wide text-fg-muted">
				{m.blog_published()}
				{new Date(date).toLocaleDateString(getLocale(), {
					year: 'numeric',
					month: 'short',
					day: 'numeric'
				})}
			</time>
		{/if}
		{@render children?.()}
	</article>
</section>
