import { m } from '$lib/paraglide/messages'

// getters rather than constants so the descriptions follow the current locale
export const getProjects = () => [
	{
		slug: 'healthtech',
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
		slug: 'react-calendar',
		title: 'React Calendar',
		description: m.project_react_calendar_description(),
		caseStudyUrl: '/projects/react-calendar',
		image: '/images/projects/react-calendar/thumbnail.webp',
		imageDark: '/images/projects/react-calendar/thumbnail-dark.webp',
		demoUrl: 'https://johannes-aas.github.io/react-calendar/',
		githubUrl: 'https://github.com/johannes-aas/react-calendar'
	},
	{
		slug: 'oystein-aas',
		title: 'Øystein Aas',
		description: m.project_oysteinaas_description(),
		image: '/images/projects/oystein-aas/thumbnail.webp',
		liveUrl: 'https://oysteinaas.no/',
		githubUrl: 'https://github.com/johannes-aas/oysteinaas'
	}
]

export const getContribProjects = () => [
	{
		slug: 'online',
		title: 'Online',
		description: m.project_onlineweb_description(),
		image: '/images/projects/online/thumbnail.webp',
		liveUrl: 'https://online.ntnu.no/',
		githubUrl: 'https://github.com/dotkom/monoweb'
	},
	{
		slug: 'login',
		title: 'Login',
		description: m.project_loginno_description(),
		image: '/images/projects/login/thumbnail.webp',
		imageDark: '/images/projects/login/thumbnail-dark.webp',
		liveUrl: 'https://login.no',
		githubUrl: 'https://github.com/Login-Linjeforening-for-IT/beehive'
	}
]

const SELECTED_WORKS = ['healthtech', 'react-calendar']

export const getSelectedWorks = () => {
	const projects = getProjects()
	return SELECTED_WORKS.map((slug) => projects.find((project) => project.slug === slug))
}
