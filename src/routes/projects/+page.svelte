<script>
	import ProjectCard from '$lib/components/project-card.svelte'
	import PageHeading from '$lib/components/page-heading.svelte'
	import { m } from '$lib/paraglide/messages'
	import { getContribProjects, getProjects } from '$lib/projects.js'

	const projects = getProjects()
	const contribProjects = getContribProjects()
</script>

<!-- grids use -mx-px so the outer card borders sit exactly on the layout's side lines -->
<PageHeading class="px-6 sm:px-10">{m.projects_title()}</PageHeading>

<div class="-mx-px grid md:grid-cols-2">
	{#each projects as project (project.slug)}
		<ProjectCard {...project} />
	{/each}
</div>

<PageHeading level={2} class="px-6 pt-18 sm:px-10 md:pt-22"
	>{m.projects_contrib_title()}</PageHeading
>

<div class="-mx-px mb-32 grid md:grid-cols-2">
	{#each contribProjects as project (project.slug)}
		<ProjectCard {...project} />
	{/each}
</div>
