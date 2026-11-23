<script>
	import ArrowRight from '@lucide/svelte/icons/arrow-right'
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right'
	import { m } from '$lib/paraglide/messages'
	import { resolve } from '$app/paths'
	import { localizeHref } from '$lib/paraglide/runtime'
	import GridCard from '$lib/components/grid-card.svelte'
	import Button from '$lib/components/button.svelte'

	let {
		title,
		description,
		image,
		imageDark,
		imagePosition = 'top',
		caseStudyUrl,
		liveUrl,
		demoUrl,
		githubUrl
	} = $props()

	const links = $derived(
		[
			{ href: liveUrl, label: m.project_visit() },
			{ href: demoUrl, label: m.project_demo() },
			{ href: githubUrl, label: m.project_github() }
		].filter((link) => link.href)
	)
</script>

{#snippet thumbnail(src, className)}
	<img
		{src}
		alt=""
		loading="lazy"
		decoding="async"
		class={[
			'size-full object-cover object-(--image-position)',
			caseStudyUrl &&
				'transition-transform duration-700 ease-out motion-safe:group-hover:scale-105',
			className
		]}
	/>
{/snippet}

<!-- isolate + -z-10 keep the masked (and zooming) image behind the text that overlaps its faded end -->
<GridCard interactive={Boolean(caseStudyUrl)} class="group isolate flex flex-col">
	<div
		style:--image-position={imagePosition}
		class="relative -z-10 -mb-8 aspect-2/1 overflow-hidden border border-border-subtle mask-b-from-40% md:-mb-10"
	>
		{#if imageDark}
			{@render thumbnail(image, 'dark:hidden')}
			{@render thumbnail(imageDark, 'hidden dark:block')}
		{:else}
			{@render thumbnail(image)}
		{/if}
	</div>

	<div class="flex flex-1 flex-col px-2 pb-2 md:px-10 md:pb-4">
		<h3 class="mb-3 text-3xl font-semibold text-fg md:text-4xl">{title}</h3>
		<p class="mb-4 text-fg">{description}</p>

		<div class="mt-auto flex flex-wrap items-center gap-4">
			{#each links as { href, label } (href)}
				<a
					{href}
					target="_blank"
					class="relative z-10 inline-flex items-center gap-1 font-medium text-fg hover:text-fg-strong"
				>
					{label}
					<ArrowUpRight class="size-4" />
				</a>
			{/each}
			{#if caseStudyUrl}
				<!-- after:inset-0 stretches this link over the whole card; the external links sit above it -->
				<Button
					variant="primary"
					href={resolve(localizeHref(caseStudyUrl))}
					data-cursor="read"
					aria-label="{m.project_read_more()}: {title}"
					class="ml-auto after:absolute after:inset-0"
				>
					{m.project_read_more()}
					<ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
				</Button>
			{/if}
		</div>
	</div>
</GridCard>
