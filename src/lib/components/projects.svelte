<script>
	import ProjectCard from '$lib/components/project-card.svelte'
	import PageHeading from '$lib/components/page-heading.svelte'
	import { m } from '$lib/paraglide/messages'

	const projects = [
		{
			title: 'React Calendar',
			description: m.project_react_calendar_description(),
			technologies: ['React', 'TypeScript', 'Tailwind CSS'],
			demoUrl: 'https://johannes-aas.github.io/react-calendar/',
			githubUrl: 'https://github.com/johannes-aas/react-calendar'
		},
		{
			title: 'oysteinaas.no',
			description: m.project_oysteinaas_description(),
			technologies: ['Next.js', 'Tailwind CSS'],
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
			technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
			liveUrl: 'https://online.ntnu.no/',
			githubUrl: 'https://github.com/dotkom/monoweb'
		},
		{
			title: 'Login.no',
			description: m.project_loginno_description(),
			technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Go', 'PostgreSQL'],
			liveUrl: 'https://login.no',
			githubUrl: 'https://github.com/Login-Linjeforening-for-IT/beehive'
		},
		{
			title: 'HealthTech',
			description: m.project_healthtech_description(),
			technologies: [
				'React',
				'TypeScript',
				'TanStack Query',
				'Tailwind CSS',
				'C#',
				'.NET',
				'PostgreSQL'
			],
			demoUrl: 'http://129.241.100.43/foreman',
			githubUrl: 'https://github.com/IT2901-Group-7-2026'
		}
	]
</script>

<!-- grids use -mx-px so the outer card borders sit exactly on the layout's side lines -->
<PageHeading>{m.projects_title()}</PageHeading>

<div class="-mx-px grid md:grid-cols-2">
	{#each projects as project (project.title)}
		<ProjectCard {...project} />
	{/each}
</div>

<PageHeading level={2} class="pt-18 md:pt-22">{m.projects_contrib_title()}</PageHeading>

<div class="-mx-px mb-32 grid md:grid-cols-2">
	{#each projectContrib as project (project.title)}
		<ProjectCard {...project} />
	{/each}
</div>
