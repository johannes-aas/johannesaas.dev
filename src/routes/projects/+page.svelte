<script>
	import ProjectCard from '$lib/components/project-card.svelte'
	import { m } from '$lib/paraglide/messages'

	const projects = [
		{
			title: 'React Calendar',
			description: m.project_react_calendar_description(),
			technologies: ['React', 'Tailwind CSS', 'TypeScript'],
			liveUrl: 'https://johannes-aas.github.io/react-calendar/',
			githubUrl: 'https://github.com/johannes-aas/react-calendar'
		},
		{
			title: 'oysteinaas.no',
			description: m.project_oysteinaas_description(),
			technologies: ['Nextjs', 'Tailwind CSS'],
			liveUrl: 'https://oysteinaas.no/',
			githubUrl: 'https://github.com/johannes-aas/oysteinaas'
		},
		{
			title: m.project_portfolio_title(),
			description: m.project_portfolio_description(),
			technologies: ['SvelteKit', 'Tailwind CSS'],
			githubUrl: 'https://github.com/johannes-aas/johannesaas.dev'
		}
	]

	const projectContrib = [
		{
			title: 'Onlineweb',
			description: m.project_onlineweb_description(),
			technologies: ['Nextjs', 'React', 'Tailwind CSS', 'TypeScript'],
			liveUrl: 'https://online.ntnu.no/',
			githubUrl: 'https://github.com/dotkom/monoweb'
		},
		{
			title: 'Login.no',
			description: m.project_loginno_description(),
			technologies: ['Nextjs', 'React', 'Tailwind CSS', 'TypeScript'],
			liveUrl: 'https://login.no',
			githubUrl: 'https://github.com/Login-Linjeforening-for-IT/beehive'
		},
		{
			title: 'HealthTech',
			description: m.project_healthtech_description(),
			technologies: ['React', 'Tailwind CSS', 'TypeScript'],
			liveUrl: 'http://129.241.100.43/foreman',
			githubUrl: 'https://github.com/IT2901-Group-7-2026'
		}
	]
</script>

<!-- grids use -mx-px so the outer card borders sit exactly on the layout's side lines -->
<h1 class="border-b border-border-subtle p-8 text-4xl font-bold md:p-10">{m.projects_title()}</h1>

<div class="-mx-px grid md:grid-cols-2">
	{#each projects as project}
		<ProjectCard {...project} />
	{/each}
</div>

<h1 class="border-b border-border-subtle p-8 text-4xl font-bold md:p-10">{m.projects_contrib_title()}</h1>

<div class="-mx-px grid md:grid-cols-2">
	{#each projectContrib as project}
		<ProjectCard {...project} />
	{/each}
</div>
