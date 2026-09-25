<script>
	import { onMount, onDestroy } from 'svelte'
	import { Dialog } from 'bits-ui'
	import Button from '$lib/components/button.svelte'
	import Slider from '$lib/components/slider.svelte'
	import { ToggleGroupRoot, ToggleGroupItem } from '$lib/components/toggle-group'
	import { DialogRoot, DialogOverlay, DialogContent, DialogTitle } from '$lib/components/dialog'

	const cards = [
		{ label: 'Body', name: 'body', bg: 'bg-body' },
		{ label: 'Panel', name: 'panel', bg: 'bg-panel' },
		{ label: 'Surface card', name: 'surface', bg: 'bg-surface' },
		{ label: 'Inset', name: 'inset', bg: 'bg-inset' }
	]

	const borderBgs = [
		{ label: 'Body', bg: 'bg-body' },
		{ label: 'Panel', bg: 'bg-panel' },
		{ label: 'Surface card', bg: 'bg-surface' }
	]

	const borderTokens = [
		{ name: 'border-subtle', border: 'border-border-subtle' },
		{ name: 'border', border: 'border-border' },
		{ name: 'border-strong', border: 'border-border-strong' }
	]

	const themeIds = [1, 2, 3, 4, 5, 6].map((n) => `theme-${n}`)
	let activeTheme = $state(themeIds[0])
	let savedTheme = null

	onMount(() => {
		savedTheme =
			themeIds.find((id) => document.documentElement.classList.contains(id)) ?? themeIds[0]
		activeTheme = savedTheme
	})

	onDestroy(() => {
		if (typeof document === 'undefined' || !savedTheme) return
		document.documentElement.classList.remove(...themeIds)
		document.documentElement.classList.add(savedTheme)
	})

	function pickTheme(id) {
		const html = document.documentElement
		html.classList.remove(...themeIds)
		html.classList.add(id)
		activeTheme = id
	}

	let spread = $state(40)
	let drift = $state(-20)
	let mode = $state('follow')
	let dialogOpen = $state(false)
	const groups = [
		{
			title: 'Backgrounds',
			tokens: [
				{ name: 'body', bg: 'bg-body' },
				{ name: 'panel', bg: 'bg-panel' },
				{ name: 'surface', bg: 'bg-surface' },
				{ name: 'inset', bg: 'bg-inset' },
				{ name: 'backdrop', bg: 'bg-backdrop' }
			]
		},
		{
			title: 'Text',
			tokens: [
				{ name: 'fg-strong', bg: 'bg-fg-strong' },
				{ name: 'fg', bg: 'bg-fg' },
				{ name: 'fg-muted', bg: 'bg-fg-muted' }
			]
		},
		{
			title: 'Borders',
			tokens: [
				{ name: 'border-subtle', bg: 'bg-border-subtle' },
				{ name: 'border', bg: 'bg-border' },
				{ name: 'border-strong', bg: 'bg-border-strong' }
			]
		},
		{
			title: 'Primary',
			tokens: [
				{ name: 'primary', bg: 'bg-primary' },
				{ name: 'primary-fg', bg: 'bg-primary-fg' },
				{ name: 'primary-text', bg: 'bg-primary-text' },
				{ name: 'primary-subtle', bg: 'bg-primary-subtle' }
			]
		},
		{
			title: 'Cursor',
			tokens: [
				{ name: 'cursor', bg: 'bg-cursor' },
				{ name: 'cursor-fg', bg: 'bg-cursor-fg' }
			]
		}
	]
</script>

<div class="flex items-stretch">
	<section class="min-w-0 flex-1 px-4 py-20 sm:px-10 lg:px-[max(2.5rem,calc((100%-56rem)/2))]">
		<h1 class="mb-10 text-6xl font-bold">Colors</h1>
		<div class="flex flex-col gap-10">
			{#each groups as { title, tokens }}
				<div>
					<h2 class="mb-4 text-2xl font-semibold">{title}</h2>
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
						{#each tokens as { name, bg }}
							<div class="border border-border-subtle bg-panel">
								<div
									class="h-24 border-b border-border-subtle {name === 'backdrop'
										? 'bg-[repeating-linear-gradient(45deg,var(--color-fg-muted)_0_6px,transparent_6px_12px)]'
										: ''}"
								>
									<div class="h-full {bg}"></div>
								</div>
								<p class="px-3 py-2 font-mono text-sm text-fg-strong">{name}</p>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
		<h2 class="mt-16 mb-4 text-2xl font-semibold">Borders on backgrounds</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			{#each borderBgs as { label, bg }}
				<div class="flex flex-col gap-4">
					<p class="font-mono text-xs text-fg-muted">{label} · {bg}</p>
					{#each borderTokens as { name, border }}
						<div class="flex h-28 border p-3 {bg} {border}">
							<div class="flex flex-1 items-end border p-2 {border}">
								<p class="font-mono text-sm text-fg-strong">{name}</p>
							</div>
						</div>
					{/each}
				</div>
			{/each}
		</div>

		<h2 class="mt-16 mb-4 text-2xl font-semibold">In use</h2>
		<div class="grid gap-4 md:grid-cols-2">
			<div class="flex flex-col gap-3 border border-border-subtle bg-panel p-6">
				<p class="font-mono text-xs text-fg-muted">Panel · bg-panel</p>
				<h3 class="text-xl font-semibold text-fg-strong">Text and buttons</h3>
				<p class="text-fg">Regular text in fg, for articles and body copy.</p>
				<p class="text-sm text-fg-muted">Muted text in fg-muted for captions and details.</p>
				<div class="h-px bg-border-subtle"></div>
				<div class="flex flex-wrap gap-2">
					<Button class="bg-primary px-4 py-2 text-sm font-medium text-primary-fg">Primary</Button>
					<Button
						class="border border-border px-4 py-2 text-sm text-fg hover:border-border-strong hover:text-fg-strong"
					>
						Outlined
					</Button>
					<Button
						variant="copy"
						value="johannes@example.com"
						class="border border-border px-4 py-2 text-sm text-fg hover:border-border-strong hover:text-fg-strong"
					>
						Copy
					</Button>
				</div>
			</div>

			<div class="flex flex-col gap-4 border border-border-subtle bg-panel p-6">
				<p class="font-mono text-xs text-fg-muted">Panel · bg-panel</p>
				<h3 class="text-xl font-semibold text-fg-strong">Controls</h3>
				<Slider
					label="Spread"
					min={0}
					max={100}
					step={1}
					value={spread}
					onchange={(v) => (spread = v)}
					onreset={() => (spread = 40)}
				/>
				<Slider
					label="Drift"
					min={-100}
					max={100}
					step={5}
					bipolar
					value={drift}
					onchange={(v) => (drift = v)}
					onreset={() => (drift = -20)}
				/>
				<div class="flex items-center gap-6">
					<span class="text-sm text-fg-muted">Mode</span>
					<ToggleGroupRoot label="Mode" value={mode} onValueChange={(v) => (mode = v)}>
						<ToggleGroupItem value="follow">Follow</ToggleGroupItem>
						<ToggleGroupItem value="avoid">Avoid</ToggleGroupItem>
					</ToggleGroupRoot>
				</div>
			</div>

			<div class="flex flex-col items-start gap-3 border border-border-subtle bg-panel p-6">
				<p class="font-mono text-xs text-fg-muted">Panel · bg-panel</p>
				<h3 class="text-xl font-semibold text-fg-strong">Dialog</h3>
				<p class="text-fg-muted">Opens a panel over the backdrop.</p>
				<Button
					class="bg-primary px-4 py-2 text-sm font-medium text-primary-fg"
					onclick={() => (dialogOpen = true)}
				>
					Open dialog
				</Button>
				<DialogRoot bind:open={dialogOpen}>
					<Dialog.Portal>
						<DialogOverlay />
						<DialogContent
							class="fixed top-1/2 left-1/2 flex w-80 max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 border border-border-subtle bg-panel p-6 shadow-lg"
						>
							<p class="font-mono text-xs text-fg-muted">Panel · bg-panel</p>
							<DialogTitle class="text-xl font-semibold text-fg-strong">Dialog</DialogTitle>
							<p class="text-fg">A panel on the backdrop, with the page blurred behind.</p>
							<p class="text-sm text-fg-muted">Click outside or press Escape to close.</p>
							<Button
								class="mt-2 self-start border border-border px-4 py-2 text-sm text-fg hover:border-border-strong hover:text-fg-strong"
								onclick={() => (dialogOpen = false)}
							>
								Close
							</Button>
						</DialogContent>
					</Dialog.Portal>
				</DialogRoot>
			</div>

			<div class="flex flex-col items-start gap-3 border border-border bg-surface p-6">
				<p class="font-mono text-xs text-fg-muted">Surface card · bg-surface</p>
				<h3 class="text-xl font-semibold text-fg-strong">Card</h3>
				<p class="text-fg">A card with a border and hover state, as used for blog posts.</p>
				<Button
					class="border border-border px-4 py-2 text-sm text-fg hover:border-border-strong hover:text-fg-strong"
				>
					Read more
				</Button>
			</div>
		</div>
		<h3 class="mt-10 mb-4 text-xl font-semibold">Text on backgrounds</h3>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each cards as { label, name, bg }}
				<div class="flex flex-col gap-2 border border-border-subtle p-6 {bg}">
					<p class="font-mono text-xs text-fg-muted">{label} · bg-{name}</p>
					<p class="text-2xl font-semibold text-fg-strong">Heading in fg-strong</p>
					<p class="text-fg">Regular text in fg. The quick brown fox jumps over the lazy dog.</p>
					<p class="text-sm text-fg-muted">Muted text in fg-muted for captions and details.</p>
					<p class="text-primary-text">Link or accent in primary-text</p>
				</div>
			{/each}
			<div class="flex flex-col gap-2 bg-primary p-6">
				<p class="font-mono text-xs text-primary-fg">bg-primary</p>
				<p class="text-2xl font-semibold text-primary-fg">Heading in primary-fg</p>
				<p class="text-primary-fg">
					Regular text in primary-fg. The quick brown fox jumps over the lazy dog.
				</p>
				<p class="text-sm text-primary-fg">Small text in primary-fg.</p>
			</div>
			<div class="flex flex-col gap-2 bg-cursor p-6">
				<p class="font-mono text-xs text-cursor-fg">bg-cursor</p>
				<p class="text-2xl font-semibold text-cursor-fg">Heading in cursor-fg</p>
				<p class="text-sm font-semibold tracking-widest text-cursor-fg">VIEW / COPIED</p>
			</div>
		</div>
	</section>
	<aside class="w-24 flex-none border-l border-border-subtle pt-20 sm:w-40">
		<div class="sticky top-6 flex flex-col items-center gap-3" role="radiogroup" aria-label="Theme">
			{#each themeIds as id, i}
				<button
					type="button"
					role="radio"
					aria-checked={id === activeTheme}
					aria-label="Theme {i + 1}"
					class="group grid h-12 w-16 cursor-pointer place-items-center border outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-14 sm:w-28 {id ===
					activeTheme
						? 'border-border-strong'
						: 'border-border-subtle hover:border-border'}"
					style="background: linear-gradient(90deg, var(--{id}-swatch-from), var(--{id}-swatch-to))"
					onclick={() => pickTheme(id)}
				>
					<span
						class="h-4 w-4 transition-opacity {id === activeTheme
							? 'opacity-100'
							: 'opacity-0 group-hover:opacity-70'}"
						style="background: var(--{id}-swatch-mark)"
					></span>
				</button>
			{/each}
		</div>
	</aside>
</div>
