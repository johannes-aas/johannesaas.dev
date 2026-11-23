<script>
	import CaseStudy from '$lib/components/case-study.svelte'
	import { m } from '$lib/paraglide/messages'

	const shot = (name, alt, width = 1440, height = 900) => ({
		src: `/images/projects/healthtech/${name}.webp`,
		alt,
		width,
		height
	})
</script>

<CaseStudy
	title="HealthTech"
	summary={m.healthtech_summary()}
	facts={[
		{ label: m.case_client(), value: 'Aker Solutions' },
		{ label: m.case_year(), value: '2026' }
	]}
	technologies={[
		'React',
		'TypeScript',
		'TanStack Query',
		'Tailwind CSS',
		'C#',
		'.NET',
		'PostgreSQL'
	]}
	cta={{
		href: 'https://healthtech-demo-theta.vercel.app/foreman',
		label: m.healthtech_cta(),
		note: m.healthtech_cta_note()
	}}
	links={[{ href: 'https://github.com/IT2901-Group-7-2026', label: m.project_github() }]}
	hero={shot('thumbnail', m.healthtech_alt_overview(), 1440, 864)}
	sections={[
		{
			title: m.healthtech_history_title(),
			text: m.healthtech_history_text(),
			images: [shot('week', m.healthtech_alt_week()), shot('month', m.healthtech_alt_month())]
		},
		{
			title: m.healthtech_team_title(),
			text: m.healthtech_team_text(),
			images: [shot('foreman', m.healthtech_alt_foreman())]
		}
	]}
	next={{ href: '/projects/react-calendar', title: 'React Calendar' }}
/>
