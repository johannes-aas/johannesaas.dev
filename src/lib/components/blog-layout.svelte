<script>
	import { getLocale } from '$lib/paraglide/runtime'

	let { title, date, description, children } = $props()
</script>

<article class="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
	<header class="mb-10">
		<h1 class="mb-4 text-4xl font-bold text-fg">{title}</h1>
		{#if description}
			<p class="mb-3 text-xl text-fg">{description}</p>
		{/if}
		{#if date}
			<time datetime={date} class="text-sm font-medium tracking-wide text-fg-muted uppercase">
				{new Date(date).toLocaleDateString(getLocale(), {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</time>
		{/if}
	</header>

	<div
		class="prose prose-lg max-w-none [--tw-prose-body:var(--color-fg)] [--tw-prose-bold:var(--color-fg-strong)] [--tw-prose-bullets:var(--color-fg-muted)] [--tw-prose-captions:var(--color-fg-muted)] [--tw-prose-code:var(--color-fg)] [--tw-prose-counters:var(--color-fg-muted)] [--tw-prose-headings:var(--color-fg-strong)] [--tw-prose-hr:var(--color-border)] [--tw-prose-lead:var(--color-fg)] [--tw-prose-links:var(--color-fg-strong)] [--tw-prose-pre-bg:var(--color-inset)] [--tw-prose-pre-code:var(--color-fg)] [--tw-prose-quote-borders:var(--color-border)] [--tw-prose-quotes:var(--color-fg)] [--tw-prose-td-borders:var(--color-border-subtle)] [--tw-prose-th-borders:var(--color-border)]"
	>
		{@render children?.()}
	</div>
</article>
