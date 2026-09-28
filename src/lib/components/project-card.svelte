<script>
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right'
	import { m } from '$lib/paraglide/messages'
	import GridCard from '$lib/components/grid-card.svelte'

	let { title, description, technologies = [], liveUrl = '', githubUrl = '' } = $props()
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
		{#if liveUrl}
			<a
				href={liveUrl}
				target="_blank"
				class="inline-flex items-center gap-1 font-medium text-fg hover:text-fg-strong"
			>
				{m.project_visit()}
				<ArrowUpRight class="size-4" />
			</a>
		{/if}
		{#if githubUrl}
			<a
				href={githubUrl}
				target="_blank"
				class="inline-flex items-center gap-1 font-medium text-fg hover:text-fg-strong"
			>
				{m.project_github()}
				<ArrowUpRight class="size-4" />
			</a>
		{/if}
	</div>
</GridCard>
