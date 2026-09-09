<script>
	import ProjectCard from '$lib/components/ProjectCard.svelte'

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
			githubUrl: 'https://github.com/johannes-aas/react-calendar'
		},
		{
			title: 'Login.no',
			description: "Website of student association for IT at  NTNU in Gjøvik",
			technologies: ['Nextjs', 'React', 'Tailwind CSS', 'TypeScript'],
			liveUrl: 'https://login.no',
			githubUrl: 'https://github.com/Login-Linjeforening-for-IT/beehive'
		},
		{
			title: 'HealthTech',
			description: "Bachelor's thesis project built with a student group for Aker Solutions. A web application that visualizes workplace health data — noise, vibration, and dust exposure.",
			technologies: ['React', 'Tailwind CSS', 'TypeScript'],
			liveUrl: 'http://129.241.100.43/foreman',
			githubUrl: 'https://github.com/johannes-aas/react-calendar'
		}
	]
</script>

<div class="mx-auto max-w-6xl px-4 py-16">
	<h1 class="mb-8 text-4xl font-bold">My Projects</h1>

	<div class="grid gap-8 md:grid-cols-2">
		{#each projects as project}
			<ProjectCard {...project} />
		{/each}
	</div>

	<h1 class="mt-10 mb-8 text-4xl font-bold">Things I worked on</h1>

	<div class="grid gap-8 md:grid-cols-2">
		{#each projectContrib as project}
			<ProjectCard {...project} />
		{/each}
	</div>
</div>
