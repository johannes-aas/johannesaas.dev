<script>
	import HeroSection from '$lib/components/hero-section/hero-section.svelte'
	import GridLine from '$lib/components/grid-line.svelte'
	import { m } from '$lib/paraglide/messages'
</script>

<HeroSection />

<GridLine />

<div class="relative z-99 py-12 px-4 bg-body text-center">
	<h2 class="mb-6 text-2xl font-light text-fg md:text-3xl">{m.home_greeting()}</h2>
	<p class="mx-auto max-w-lg text-lg leading-relaxed text-fg-muted">
		{m.home_intro()}
	</p>
</div>
