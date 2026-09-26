<script>
	import { getPosts } from '$lib/posts/index.js'
	import { page } from '$app/state'
	import BlogLayout from '$lib/components/blog-layout.svelte'

	const post = $derived(getPosts().find((p) => p.slug === page.params.slug))
	const Component = $derived(post.component)
</script>

<BlogLayout date={post.meta.date}>
	<Component />
</BlogLayout>
