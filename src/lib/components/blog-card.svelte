<script>
	import { localizeHref } from '$lib/paraglide/runtime'
	import { formatDate } from '$lib/date.js'
	import GridCard from '$lib/components/grid-card.svelte'

	let { slug, title, date, cover = '' } = $props()
</script>

<GridCard href={localizeHref(`/blog/${slug}`)} data-cursor="read">
	{#if cover}
		<img src={cover} alt={title} class="mb-6 h-48 w-full object-cover" />
	{/if}
	<h2 class="mb-3 text-2xl font-semibold text-fg md:text-3xl">{title}</h2>
	<time datetime={date} class="text-fg-muted">
		{formatDate(date)}
	</time>
</GridCard>
