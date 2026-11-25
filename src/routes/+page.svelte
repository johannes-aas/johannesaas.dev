<script>
	import HeroSection from '$lib/components/hero-section/hero-section.svelte'
	import GridLine from '$lib/components/grid-line.svelte'
	import SelectedWorks from '$lib/components/selected-works.svelte'
	import ContributionGraph from '$lib/components/contribution-graph.svelte'

	let { data } = $props()
</script>

<HeroSection />

<GridLine />

<div class="relative z-99 bg-body">
	<SelectedWorks />
	{#if data.contributions}
		<ContributionGraph {...data.contributions} />
	{/if}
</div>
