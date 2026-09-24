<script>
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
				{new Date(date).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</time>
		{/if}
	</header>

	<div
		class="prose prose-lg max-w-none prose-invert prose-headings:text-fg prose-blockquote:text-fg-muted prose-strong:text-fg prose-code:text-fg"
	>
		{@render children?.()}
	</div>
</article>
