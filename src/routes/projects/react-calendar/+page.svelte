<script>
	import CaseStudy from '$lib/components/case-study.svelte'
	import { m } from '$lib/paraglide/messages'

	const shot = (name, alt, width, height) => ({
		src: `/images/projects/react-calendar/${name}.webp`,
		alt,
		width,
		height
	})
	const phone = (name, alt) => shot(name, alt, 390, 438)
</script>

<CaseStudy
	title="React Calendar"
	summary={m.react_calendar_summary()}
	facts={[
		{ label: m.case_built_for(), value: m.react_calendar_built_for() },
		{ label: m.case_year(), value: '2025' }
	]}
	technologies={['React', 'TypeScript', 'Tailwind CSS', 'Floating UI']}
	cta={{ href: 'https://johannes-aas.github.io/react-calendar/', label: m.react_calendar_cta() }}
	links={[
		{ href: 'https://github.com/johannes-aas/react-calendar', label: m.project_github() },
		{
			href: 'https://online.ntnu.no/arrangementer?view=month',
			label: 'online.ntnu.no',
			topOnly: true
		}
	]}
	hero={shot('demo', m.react_calendar_alt_demo(), 1177, 699)}
	sections={[
		{
			title: m.react_calendar_multiday_title(),
			text: m.react_calendar_multiday_text(),
			images: [shot('online', m.react_calendar_alt_online(), 987, 709)]
		},
		{
			title: m.react_calendar_responsive_title(),
			text: m.react_calendar_responsive_text(),
			images: [
				phone('mobile', m.react_calendar_alt_mobile()),
				phone('mobile-dark', m.react_calendar_alt_mobile_dark())
			]
		}
	]}
/>
