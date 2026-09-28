<script>
	import { getLocale, localizeHref } from '$lib/paraglide/runtime'

	let { slug, title, date, cover = '' } = $props()
</script>

<!-- -mt-px / md:even:-ml-px collapse neighbouring borders into one line; hover:z-10 lifts the stronger border above them -->
<a
	href={localizeHref(`/blog/${slug}`)}
	data-cursor="read"
	class="relative -mt-px block border border-border-subtle transition-colors hover:z-10 hover:border-border-strong md:even:-ml-px"
>
	<div class="p-8 md:p-10">
		{#if cover}
			<img src={cover} alt={title} class="mb-6 h-48 w-full object-cover" />
		{/if}
		<h2 class="mb-3 text-2xl font-semibold text-fg md:text-3xl">{title}</h2>
		<time datetime={date} class="text-fg-muted">
			{new Date(date).toLocaleDateString(getLocale(), {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			})}
		</time>
	</div>
</a>
