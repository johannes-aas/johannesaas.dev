<script>
	import { posts } from '$lib/posts/index.js'
	import { page } from '$app/state'

	const slug = page.params.slug
	const post = posts.find((p) => p.slug === slug)
	const Component = post.component
</script>

<section class="mx-auto max-w-3xl px-4 py-16">
	<article
		class="mx-auto max-w-[65ch] text-base leading-[1.6] [&_h1]:mb-8 [&_h1]:text-5xl [&_h1]:leading-none"
	>
		<Component />
	</article>
</section>
