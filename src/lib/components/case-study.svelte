<script>
	import ArrowLeft from '@lucide/svelte/icons/arrow-left'
	import ArrowRight from '@lucide/svelte/icons/arrow-right'
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right'
	import Button from '$lib/components/button.svelte'
	import PageHeading from '$lib/components/page-heading.svelte'
	import { m } from '$lib/paraglide/messages'
	import { localizeHref } from '$lib/paraglide/runtime'

	// cta: { href, label, note }, the link the page pushes. links: { href, label, topOnly }, topOnly
	// links are left out of the closing section. images: { src, alt, width, height };
	// a section shows one image full width, more in two columns. next: { href, title }.
	let {
		title,
		summary,
		facts = [],
		technologies = [],
		cta,
		links = [],
		hero,
		sections = [],
		next
	} = $props()
</script>

{#snippet screenshot(image, loading = 'lazy')}
	<img
		{...image}
		{loading}
		decoding="async"
		class="w-full rounded-sm border border-border-subtle"
	/>
{/snippet}

{#snippet actions(items, className)}
	<div class={['flex flex-wrap items-center gap-x-8 gap-y-4', className]}>
		<Button
			variant="primary"
			href={cta.href}
			target="_blank"
			rel="noopener noreferrer"
			class="gap-2 px-6 py-3 text-base"
		>
			{cta.label}
			<ArrowUpRight class="size-5" />
		</Button>
		{#each items as { href, label } (href)}
			<a
				{href}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1 font-medium text-fg hover:text-fg-strong"
			>
				{label}
				<ArrowUpRight class="size-4" />
			</a>
		{/each}
	</div>
{/snippet}

<article class="mb-32">
	<div
		class="flex flex-col items-start border-b border-border-subtle sm:flex-row sm:justify-between"
	>
		<Button
			href={localizeHref('/projects')}
			class="group mt-8 ml-8 shrink-0 text-sm text-fg-muted hover:text-fg-strong md:mt-10 md:ml-10"
		>
			<ArrowLeft class="size-4 transition-transform group-hover:-translate-x-0.5" />
			{m.nav_projects()}
		</Button>
		<PageHeading class="border-b-0 pt-6 sm:pt-12 sm:text-right lg:pr-24">{title}</PageHeading>
	</div>

	<!-- gap-px over a border-coloured background draws the cell dividers at every breakpoint -->
	<div class="grid gap-px border-b border-border-subtle bg-border-subtle lg:grid-cols-3">
		<div class="flex flex-col gap-8 bg-body p-8 md:p-10 lg:col-span-2">
			<p class="max-w-xl text-lg text-fg-strong">{summary}</p>
			<div class="flex flex-wrap gap-2">
				{#each technologies as tech (tech)}
					<span class="rounded-sm border border-border bg-body px-2 py-1 text-sm text-fg-strong"
						>{tech}</span
					>
				{/each}
			</div>
			{@render actions(links, 'mt-auto')}
		</div>
		<dl class="grid grid-flow-col auto-rows-fr gap-px lg:grid-flow-row">
			{#each facts as { label, value } (label)}
				<div class="bg-body px-8 py-6 md:px-10">
					<dt class="font-mono text-xs tracking-widest text-fg-muted uppercase">{label}</dt>
					<dd class="mt-2 text-lg text-fg-strong">{value}</dd>
				</div>
			{/each}
		</dl>
	</div>

	<div class="border-b border-border-subtle p-4 sm:p-8 md:p-10">
		{@render screenshot(hero, 'eager')}
	</div>

	{#each sections as { title, text, images } (title)}
		<section class="border-b border-border-subtle">
			<div class="grid gap-3 px-8 pt-12 pb-8 md:grid-cols-2 md:gap-10 md:px-10 md:pt-16 md:pb-10">
				<h2 class="text-3xl font-semibold md:text-4xl">{title}</h2>
				<p class="max-w-md text-fg md:pt-2 md:text-lg">{text}</p>
			</div>
			<div
				class={[
					'grid gap-4 px-4 pb-4 sm:px-8 sm:pb-8 md:gap-6 md:px-10 md:pb-10',
					images.length > 1 && 'sm:grid-cols-2'
				]}
			>
				{#each images as image (image.src)}
					{@render screenshot(image)}
				{/each}
			</div>
		</section>
	{/each}

	<section
		class="mt-16 flex flex-col items-start gap-8 border-y border-border-subtle bg-primary-subtle px-8 py-16 md:mt-24 md:flex-row md:items-end md:justify-between md:px-10 md:py-20"
	>
		<div>
			<h2 class="text-4xl font-semibold md:text-5xl">{m.case_cta_title()}</h2>
			{#if cta.note}
				<p class="mt-4 max-w-md text-fg md:text-lg">{cta.note}</p>
			{/if}
		</div>
		{@render actions(links.filter((link) => !link.topOnly))}
	</section>

	<nav class="grid border-b border-border-subtle sm:grid-cols-3">
		<Button
			href={localizeHref('/projects')}
			class={[
				'group flex justify-start p-8 text-sm text-fg-muted hover:bg-surface/50 hover:text-fg-strong md:p-10',
				!next && 'sm:col-span-3'
			]}
		>
			<ArrowLeft class="size-4 transition-transform group-hover:-translate-x-0.5" />
			{m.nav_projects()}
		</Button>
		{#if next}
			<Button
				href={localizeHref(next.href)}
				class="group flex justify-between gap-8 border-t border-border-subtle p-8 text-left hover:bg-surface/50 sm:col-span-2 sm:border-t-0 sm:border-l md:p-10"
			>
				<span>
					<span class="block font-mono text-xs tracking-widest text-fg-muted uppercase">
						{m.case_next_project()}
					</span>
					<span class="mt-2 block text-3xl font-semibold md:text-4xl">
						{next.title}
					</span>
				</span>
				<ArrowRight
					class="size-5 shrink-0 text-fg transition-transform group-hover:translate-x-0.5"
				/>
			</Button>
		{/if}
	</nav>
</article>
