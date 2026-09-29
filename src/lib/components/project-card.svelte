<script>
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right'
	import { m } from '$lib/paraglide/messages'
	import GridCard from '$lib/components/grid-card.svelte'

	let { title, description, technologies = [], liveUrl, demoUrl, githubUrl } = $props()

	const links = $derived(
		[
			{ href: liveUrl, label: m.project_visit() },
			{ href: demoUrl, label: m.project_demo() },
			{ href: githubUrl, label: m.project_github() }
		].filter((link) => link.href)
	)
</script>

<GridCard>
	<h3 class="mb-3 text-2xl font-semibold text-fg md:text-3xl">{title}</h3>
	<p class="mb-4 text-fg">{description}</p>

	<div class="mb-4 flex flex-wrap gap-2">
		{#each technologies as tech (tech)}
			<span class="border border-border bg-body px-2 py-1 text-sm text-fg-strong">
				{tech}
			</span>
		{/each}
	</div>

	<div class="flex gap-4">
		{#each links as { href, label } (href)}
			<a
				{href}
				target="_blank"
				class="inline-flex items-center gap-1 font-medium text-fg hover:text-fg-strong"
			>
				{label}
				<ArrowUpRight class="size-4" />
			</a>
		{/each}
	</div>
</GridCard>
