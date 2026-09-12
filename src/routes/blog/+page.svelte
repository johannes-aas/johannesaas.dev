<script>
	import { posts } from '$lib/posts/index.js'
</script>

<section class="mx-auto max-w-6xl px-4 py-16">
	<h1 class="mb-6 text-4xl font-bold text-base-fg">Blog</h1>
	<div class="grid gap-8 md:grid-cols-2">
		{#each posts as post}
			<a
				href={`/blog/${post.slug}`}
				data-cursor="read"
				class="block overflow-hidden border border-border bg-surface-bg transition-colors hover:border-muted"
			>
				{#if post.meta.cover}
					<img src={post.meta.cover} alt={post.meta.title} class="h-48 w-full object-cover" />
				{/if}
				<div class="p-4">
					<h2 class="mb-2 text-2xl font-semibold text-surface-fg">{post.meta.title}</h2>
					<time
						datetime={post.meta.date}
						class="text-sm font-medium tracking-wide text-muted"
					>
						{new Date(post.meta.date).toLocaleDateString('en-US', { 
							year: 'numeric', 
							month: 'short', 
							day: 'numeric' 
						})}
					</time>
				</div>
			</a>
		{/each}
	</div>
</section>
