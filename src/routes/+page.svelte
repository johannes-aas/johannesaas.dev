<script>
	import HeroSection from '$lib/components/hero-section/hero-section.svelte'
	import GridLine from '$lib/components/grid-line.svelte'
	import Projects from '$lib/components/projects.svelte'
	// import { m } from '$lib/paraglide/messages'
</script>

<HeroSection />

<GridLine />

<!-- Temporarily showing projects while job hunting; restore the intro below later -->
<div class="relative z-99 bg-body">
	<Projects />
</div>

<!-- <div class="relative z-99 bg-body px-4 py-12 text-center">
	<h2 class="mb-6 text-2xl font-light text-fg md:text-3xl">{m.home_greeting()}</h2>
	<p class="mx-auto max-w-lg text-lg leading-relaxed text-fg">
		{m.home_intro()}
	</p>
</div> -->
