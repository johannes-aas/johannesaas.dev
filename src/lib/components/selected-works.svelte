<script>
	import ArrowRight from '@lucide/svelte/icons/arrow-right'
	import { resolve } from '$app/paths'
	import { localizeHref } from '$lib/paraglide/runtime'
	import { m } from '$lib/paraglide/messages'
	import { getSelectedWorks } from '$lib/projects.js'
	import ProjectCard from '$lib/components/project-card.svelte'
	import PageHeading from '$lib/components/page-heading.svelte'

	const projects = getSelectedWorks()
</script>

{#snippet seeAll(className)}
	<a
		href={resolve(localizeHref('/projects'))}
		class={['group flex-none items-center gap-1.5 text-fg hover:text-fg-strong', className]}
	>
		{m.selected_works_see_all()}
		<ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
	</a>
{/snippet}

<div
	class="flex items-baseline-last justify-between gap-6 border-b border-border-subtle pr-6 sm:pr-10"
>
	<PageHeading level={2} class="border-b-0 px-6 pt-18 sm:px-10 md:pt-24">
		{m.selected_works_title()}
	</PageHeading>
	{@render seeAll('hidden md:inline-flex')}
</div>

<!-- -mx-px so the outer card borders sit exactly on the layout's side lines -->
<div class="-mx-px grid md:mb-32 md:grid-cols-2">
	{#each projects as project (project.slug)}
		<ProjectCard {...project} />
	{/each}
</div>

<div class="mb-32 flex justify-end px-6 pt-8 sm:px-10 md:hidden">
	{@render seeAll('inline-flex')}
</div>
