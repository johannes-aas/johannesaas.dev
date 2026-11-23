<script>
	import ProjectCard from '$lib/components/project-card.svelte'
	import PageHeading from '$lib/components/page-heading.svelte'
	import { m } from '$lib/paraglide/messages'

	const projects = [
		{
			title: 'HealthTech',
			description: m.project_healthtech_description(),
			caseStudyUrl: '/projects/healthtech',
			image: '/images/projects/healthtech/thumbnail.webp',
			imageDark: '/images/projects/healthtech/thumbnail-dark.webp',
			imagePosition: 'bottom',
			demoUrl: 'https://healthtech-demo-theta.vercel.app/foreman',
			githubUrl: 'https://github.com/IT2901-Group-7-2026'
		},
		{
			title: 'React Calendar',
			description: m.project_react_calendar_description(),
			caseStudyUrl: '/projects/react-calendar',
			image: '/images/projects/react-calendar/thumbnail.webp',
			imageDark: '/images/projects/react-calendar/thumbnail-dark.webp',
			demoUrl: 'https://johannes-aas.github.io/react-calendar/',
			githubUrl: 'https://github.com/johannes-aas/react-calendar'
		},
		{
			title: 'Øystein Aas',
			description: m.project_oysteinaas_description(),
			image: '/images/projects/oystein-aas/thumbnail.webp',
			liveUrl: 'https://oysteinaas.no/',
			githubUrl: 'https://github.com/johannes-aas/oysteinaas'
		}
	]

	const projectContrib = [
		{
			title: 'Online',
			description: m.project_onlineweb_description(),
			image: '/images/projects/online/thumbnail.webp',
			liveUrl: 'https://online.ntnu.no/',
			githubUrl: 'https://github.com/dotkom/monoweb'
		},
		{
			title: 'Login',
			description: m.project_loginno_description(),
			image: '/images/projects/login/thumbnail.webp',
			imageDark: '/images/projects/login/thumbnail-dark.webp',
			liveUrl: 'https://login.no',
			githubUrl: 'https://github.com/Login-Linjeforening-for-IT/beehive'
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
