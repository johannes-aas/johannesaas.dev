<script>
	import BlogCard from '$lib/components/blog-card.svelte'
	import { getPosts } from '$lib/posts/index.js'
	import PageHeading from '$lib/components/page-heading.svelte'
	import { m } from '$lib/paraglide/messages'

	const posts = $derived(getPosts())
</script>

<PageHeading>{m.blog_title()}</PageHeading>

<div class="-mx-px grid md:grid-cols-2">
	{#each posts as post (post.slug)}
		<BlogCard slug={post.slug} {...post.meta} />
	{/each}
</div>
