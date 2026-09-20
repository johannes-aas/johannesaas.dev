<script>
	import ProjectCard from '$lib/components/project-card.svelte'

	const projects = [
		{
			title: 'React Calendar',
			description: 'A modern, responsive calendar built with React, TypeScript, and Tailwind CSS',
			technologies: ['React', 'Tailwind CSS', 'TypeScript'],
			liveUrl: 'https://johannes-aas.github.io/react-calendar/',
			githubUrl: 'https://github.com/johannes-aas/react-calendar'
		},
		{
			title: 'oysteinaas.no',
			description: 'Landingpage for triathlete Øystein Aas',
			technologies: ['Nextjs', 'Tailwind CSS'],
			liveUrl: 'https://oysteinaas.no/',
			githubUrl: 'https://github.com/johannes-aas/oysteinaas'
		},
		{
			title: 'Portfolio',
			description: 'This website',
			technologies: ['SvelteKit', 'Tailwind CSS'],
			githubUrl: 'https://github.com/johannes-aas/johannesaas.dev'
		}
	]

	const projectContrib = [
		{
			title: 'Onlineweb',
			description: "Website of NTNU's informatics student association",
			technologies: ['Nextjs', 'React', 'Tailwind CSS', 'TypeScript'],
			liveUrl: 'https://online.ntnu.no/',
			githubUrl: 'https://github.com/dotkom/monoweb'
		},
		{
			title: 'Login.no',
			description: 'Website of student association for IT at  NTNU in Gjøvik',
			technologies: ['Nextjs', 'React', 'Tailwind CSS', 'TypeScript'],
			liveUrl: 'https://login.no',
			githubUrl: 'https://github.com/Login-Linjeforening-for-IT/beehive'
		},
		{
			title: 'HealthTech',
			description:
				"Bachelor's thesis project built with a student group for Aker Solutions. A web application that visualizes workplace health data — noise, vibration, and dust exposure.",
			technologies: ['React', 'Tailwind CSS', 'TypeScript'],
			liveUrl: 'http://129.241.100.43/foreman',
			githubUrl: 'https://github.com/IT2901-Group-7-2026'
		}
	]
</script>

<!-- grids use -mx-px so the outer card borders sit exactly on the layout's side lines -->
<h1 class="border-b border-border-subtle p-8 text-4xl font-bold md:p-10">My Projects</h1>

<div class="-mx-px grid md:grid-cols-2">
	{#each projects as project}
		<ProjectCard {...project} />
	{/each}
</div>

<h1 class="border-b border-border-subtle p-8 text-4xl font-bold md:p-10">Things I worked on</h1>

<div class="-mx-px grid md:grid-cols-2">
	{#each projectContrib as project}
		<ProjectCard {...project} />
	{/each}
</div>
