<script>
	import { getPosts } from '$lib/posts/index.js'
	import { page } from '$app/state'

	const post = $derived(getPosts().find((p) => p.slug === page.params.slug))
	const Component = $derived(post.component)
</script>

<section class="mx-auto max-w-3xl px-4 py-16">
	<article
		class="mx-auto max-w-[65ch] text-base leading-[1.6] [&_h1]:mb-8 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:leading-none"
	>
		<Component />
	</article>
</section>
