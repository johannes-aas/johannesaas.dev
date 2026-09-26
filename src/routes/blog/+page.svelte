<script>
	import { getPosts } from '$lib/posts/index.js'
	import { getLocale, localizeHref } from '$lib/paraglide/runtime'
	import { m } from '$lib/paraglide/messages'

	const posts = $derived(getPosts())
</script>

<h1 class="border-b border-border-subtle px-8 py-12 text-5xl font-bold md:px-10 md:py-16 md:text-6xl">
	{m.blog_title()}
</h1>

<div class="-mx-px grid md:grid-cols-2">
	{#each posts as post}
		<a
			href={localizeHref(`/blog/${post.slug}`)}
			data-cursor="read"
			class="relative -mt-px block border border-border-subtle transition-colors hover:z-10 hover:border-border-strong md:even:-ml-px"
		>
			<div class="p-8 md:p-10">
				{#if post.meta.cover}
					<img src={post.meta.cover} alt={post.meta.title} class="mb-6 h-48 w-full object-cover" />
				{/if}
				<h2 class="mb-3 text-2xl font-semibold text-fg md:text-3xl">{post.meta.title}</h2>
				<time datetime={post.meta.date} class="text-fg-muted">
					{new Date(post.meta.date).toLocaleDateString(getLocale(), {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					})}
				</time>
			</div>
		</a>
	{/each}
</div>
