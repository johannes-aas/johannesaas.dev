<script>
	import BlogCard from '$lib/components/blog-card.svelte'
	import { getPosts } from '$lib/posts/index.js'
	import { m } from '$lib/paraglide/messages'

	const posts = $derived(getPosts())
</script>

<h1 class="border-b border-border-subtle px-8 py-12 text-5xl font-bold md:px-10 md:py-16 md:text-6xl">
	{m.blog_title()}
</h1>

<div class="-mx-px grid md:grid-cols-2">
	{#each posts as post}
		<BlogCard slug={post.slug} {...post.meta} />
	{/each}
</div>
