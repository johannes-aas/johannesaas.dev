<script>
	import { isSameMonth, parseISO } from 'date-fns'
	import { Tween, prefersReducedMotion } from 'svelte/motion'
	import { cubicInOut, cubicOut } from 'svelte/easing'
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right'
	import GridCard from '$lib/components/grid-card.svelte'
	import { GithubIcon } from '$lib/components/icons'
	import { ToggleGroupItem, ToggleGroupRoot } from '$lib/components/toggle-group'
	import {
		SelectContent,
		SelectItem,
		SelectPortal,
		SelectRoot,
		SelectTrigger,
		SelectValue
	} from '$lib/components/select'
	import {
		TooltipContent,
		TooltipPortal,
		TooltipProvider,
		TooltipRoot
	} from '$lib/components/tooltip'
	import { m } from '$lib/paraglide/messages'
	import { formatDateLong, formatMonthShort, weekdayShort } from '$lib/date.js'
	import { GAP, WEEKDAY_ROOM, boxAt, cameraAt, faces, project } from '$lib/contribution-graph.js'

	// weeks: Sunday-first arrays of 7 days ({ date, count, level } or null), oldest first
	let { total, weeks, years = [] } = $props()

	// mixed into the page colour rather than see-through, since 3D blocks overlap
	const LEVELS = [
		'[--block:color-mix(in_oklab,var(--color-fg)_8%,var(--color-body))]',
		'[--block:color-mix(in_oklab,var(--color-primary)_35%,var(--color-body))]',
		'[--block:color-mix(in_oklab,var(--color-primary)_65%,var(--color-body))]',
		'[--block:var(--color-primary)]',
		'[--block:var(--color-primary-text)]'
	]
	const LABELLED_DAYS = [1, 3, 5]

	const MIN_TOTAL = 20
	const BUSY_TOTAL = 100

	const MIN_HEIGHT = 0.3
	const MAX_HEIGHT = 5
	const MIN_CELL_PX = 12

	// to 3D the camera turns, then the blocks rise; to 2D plays it back
	const TURN_MS = 900
	const RISE_MS = 1300

	// the grace period keeps the tooltip open while crossing the gap to the next day
	const TOOLTIP_GLIDE_MS = 160
	const TOOLTIP_GRACE_MS = 120

	const TOGGLE_GAP_PX = 16

	const LAST_YEAR = 'last'

	const clamp = (value) => Math.min(Math.max(value, 0), 1)

	let view = $state('2d')
	const progress = new Tween(0)
	const turned = $derived(cubicInOut(clamp(progress.current / TURN_MS)))
	const risen = $derived(cubicInOut(clamp((progress.current - TURN_MS) / RISE_MS)))

	function animateTo(target) {
		progress.set(target, {
			duration: prefersReducedMotion.current ? 0 : (from, to) => Math.abs(to - from)
		})
	}

	function setView(value) {
		view = value
		active = null
		animateTo(value === '3d' ? TURN_MS + RISE_MS : 0)
	}

	// other years are fetched when picked; the one on screen stays until the picked one has loaded
	let loaded = $state.raw({})
	let picked = $state(LAST_YEAR)
	let year = $state(LAST_YEAR)
	const contributions = $derived(year === LAST_YEAR ? { total, weeks } : loaded[year])
	const yearOptions = $derived([
		{ value: LAST_YEAR, label: m.contributions_last_year() },
		...years.map((option) => ({ value: String(option), label: String(option) }))
	])
	const summary = $derived(
		year === LAST_YEAR
			? m.contributions_summary({ count: contributions.total })
			: m.contributions_summary_year({ count: contributions.total, year })
	)

	async function pickYear(value) {
		picked = value
		if (value === LAST_YEAR || loaded[value]) return showYear(value)
		try {
			const response = await fetch(`/api/contributions/${value}`)
			if (!response.ok) throw new Error(`HTTP ${response.status}`)
			loaded = { ...loaded, [value]: await response.json() }
			if (picked === value) showYear(value)
		} catch (error) {
			console.error(`Failed to load the contributions for ${value}:`, error)
			if (picked === value) picked = year
		}
	}

	function showYear(value) {
		year = value
		active = null
		// in 3D the new year's blocks rise from the floor
		if (view === '3d') {
			progress.set(Math.min(progress.current, TURN_MS), { duration: 0 })
			animateTo(TURN_MS + RISE_MS)
		}
	}

	const camera = $derived(cameraAt(turned))
	const toScreen = (x, y, z) => project(camera, x, y, z)

	// lays the labels flat on the floor
	const floor = $derived(`matrix(${[...toScreen(1, 0), ...toScreen(0, 1), 0, 0]})`)

	let width = $state()
	let headingHeight = $state(0)
	let legendHeight = $state(0)
	let toggleHeight = $state(0)

	// only the latest weeks that fit with readable cells
	const shown = $derived(
		width
			? contributions.weeks.slice(-Math.max(Math.floor(width / MIN_CELL_PX - WEEKDAY_ROOM), 8))
			: contributions.weeks
	)

	const busiest = $derived(Math.max(...contributions.weeks.flat().map((day) => day?.count ?? 0)))

	// painted back to front: in 3D the latest week and Sunday are furthest from the camera
	const days = $derived(
		shown
			.flatMap((week, x) =>
				week.map((day, y) => {
					if (!day) return null
					const height = day.count && MIN_HEIGHT + ((MAX_HEIGHT - MIN_HEIGHT) * day.count) / busiest
					return { day, x, y, height }
				})
			)
			.filter(Boolean)
			.sort((a, b) => b.x - a.x || a.y - b.y)
	)

	const blocks = $derived(
		days.map((block) => {
			const h = block.height * risen
			return { ...block, h, ...faces(camera, block.x, block.y, h) }
		})
	)

	const box = $derived(boxAt(turned, shown.length, days))
	const box2d = $derived(boxAt(0, shown.length, days))
	const box3d = $derived(boxAt(1, shown.length, days))

	// from md the heading and legend sit in the corners the 3D graph leaves empty; the room they
	// take in 2D closes as the graph grows, keeping a band clear under the toggle
	const room = $derived.by(() => {
		const ratio = ({ width, height }) => height / width
		const left = clamp((ratio(box3d) - ratio(box)) / (ratio(box3d) - ratio(box2d)))
		const band = toggleHeight + TOGGLE_GAP_PX
		return {
			above: band + left * (headingHeight - band),
			below: left * legendHeight
		}
	})

	// a point on the floor (or up a block) as a percentage of the graph, for HTML laid over it
	function place(x, y, z = 0) {
		const [px, py] = toScreen(x, y, z)
		return {
			x: ((px - box.left) / box.width) * 100,
			y: ((py - box.top) / box.height) * 100
		}
	}

	// the first month is dropped if the next one would overlap it
	const monthLabels = $derived.by(() => {
		const starts = shown.map((week) => parseISO(week.find(Boolean).date))
		const labels = starts.map((start, i) =>
			i === 0 || !isSameMonth(start, starts[i - 1]) ? formatMonthShort(start) : null
		)
		if (labels.slice(1, 3).some(Boolean)) labels[0] = null
		return labels.map((label, x) => label && { label, x }).filter(Boolean)
	})

	let graph = $state()
	let active = $state(null)
	let tooltipText = $state('')

	const hovered = $derived(active && blocks.find((block) => block.day.date === active))

	// the tooltip follows the hovered block's top face every frame, and glides over from the last one
	let face = null
	let glideFrom = null
	let anchorRect = null
	const glide = new Tween(1, { easing: cubicOut })

	const anchor = {
		getBoundingClientRect() {
			const origin = graph.getBoundingClientRect()
			const rect = face.getBoundingClientRect()
			const target = face.isConnected
				? [rect.x - origin.x, rect.y - origin.y, rect.width, rect.height]
				: anchorRect
			anchorRect = glideFrom
				? target.map((value, i) => glideFrom[i] + (value - glideFrom[i]) * glide.current)
				: target
			const [x, y, width, height] = anchorRect
			return new DOMRect(origin.x + x, origin.y + y, width, height)
		}
	}

	let leaveTimer
	$effect(() => () => clearTimeout(leaveTimer))

	function enterDay(event, day) {
		clearTimeout(leaveTimer)
		glideFrom = active && anchorRect
		if (glideFrom) {
			glide.set(0, { duration: 0 })
			glide.set(1, { duration: prefersReducedMotion.current ? 0 : TOOLTIP_GLIDE_MS })
		}
		face = event.currentTarget.lastElementChild
		active = day.date
		tooltipText = describe(day)
	}

	// touch has no hover, so a tapped day stays up until a tap somewhere else
	function leaveDay(event) {
		if (event.pointerType === 'touch') return
		clearTimeout(leaveTimer)
		leaveTimer = setTimeout(() => (active = null), TOOLTIP_GRACE_MS)
	}

	function describe({ date, count }) {
		const formatted = formatDateLong(parseISO(date))
		if (count === 0) return m.contributions_day_none({ date: formatted })
		if (count === 1) return m.contributions_day_one({ date: formatted })
		return m.contributions_day_other({ count, date: formatted })
	}
</script>

{#snippet floorLabel(text, at, position, opacity)}
	<span
		style:--x="{at.x}%"
		style:--y="{at.y}%"
		style:opacity
		class="absolute top-(--y) left-(--x) origin-top-left transform-(--floor)"
	>
		<span class={['absolute leading-none whitespace-nowrap', position]}>{text}</span>
	</span>
{/snippet}

{#if total >= MIN_TOTAL}
	<section class="-mx-px mb-32">
		<GridCard>
			<div bind:clientWidth={width} class="relative">
				<div
					class="mb-8 flex flex-wrap items-start justify-between gap-x-6 gap-y-4 max-md:items-center max-md:gap-y-0 md:pointer-events-none md:absolute md:inset-x-0 md:top-0 md:z-10 md:mb-0 md:flex-nowrap"
				>
					<!-- below md its lines join the row, so the GitHub link and the toggle share the last one -->
					<div
						bind:clientHeight={headingHeight}
						class="min-w-0 max-md:contents md:pb-8 md:*:pointer-events-auto"
					>
						<h2
							class="text-2xl font-medium text-fg-strong max-md:basis-full max-sm:whitespace-pre-line md:text-3xl"
						>
							{total >= BUSY_TOTAL ? m.contributions_title_busy() : m.contributions_title()}
						</h2>
						<p class="mt-1 text-fg-muted max-md:basis-full md:text-lg">{summary}</p>
						<a
							href="https://github.com/johannes-aas"
							target="_blank"
							rel="noopener noreferrer"
							class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-fg hover:text-fg-strong max-md:mt-2"
						>
							<GithubIcon class="size-4" />
							johannes-aas
							<ArrowUpRight class="-ml-1 size-4" />
						</a>
					</div>
					<div
						bind:clientHeight={toggleHeight}
						class="flex shrink-0 items-center gap-3 max-md:mt-2 md:pointer-events-auto md:pt-2"
					>
						<SelectRoot type="single" value={picked} onValueChange={pickYear} items={yearOptions}>
							<SelectTrigger aria-label={m.contributions_year()} class="max-sm:hidden">
								<!-- as wide as the longest option, in any language, so picking one never resizes it -->
								<span class="grid text-left">
									{#each yearOptions as { value, label } (value)}
										<span aria-hidden="true" class="invisible col-start-1 row-start-1">{label}</span
										>
									{/each}
									<SelectValue class="col-start-1 row-start-1" />
								</span>
							</SelectTrigger>
							<SelectPortal>
								<SelectContent>
									{#each yearOptions as { value, label } (value)}
										<SelectItem {value} {label} />
									{/each}
								</SelectContent>
							</SelectPortal>
						</SelectRoot>
						<ToggleGroupRoot
							label={m.contributions_view()}
							value={view}
							onValueChange={setView}
							class="w-22"
						>
							<ToggleGroupItem value="2d">2D</ToggleGroupItem>
							<ToggleGroupItem value="3d">3D</ToggleGroupItem>
						</ToggleGroupRoot>
					</div>
				</div>

				<div
					style:--above="{room.above}px"
					style:--below="{room.below}px"
					class="md:pt-(--above) md:pb-(--below)"
				>
					<div
						bind:this={graph}
						role="img"
						aria-label={summary}
						aria-busy={picked !== year}
						style:--floor={floor}
						class={[
							'relative font-mono text-xs text-fg-muted transition-opacity',
							picked !== year && 'opacity-50'
						]}
					>
						<svg
							viewBox="{box.left} {box.top} {box.width} {box.height}"
							class="w-full overflow-visible"
						>
							{#each blocks as block (block.day.date)}
								<g
									data-day
									class={LEVELS[block.day.level]}
									onpointerenter={(event) => enterDay(event, block.day)}
									onpointerleave={leaveDay}
								>
									{#if block.left}
										<polygon
											points={block.left}
											class="fill-[color-mix(in_oklab,var(--block),black_4%)]"
										/>
										<polygon
											points={block.front}
											class="fill-[color-mix(in_oklab,var(--block),black_10%)]"
										/>
									{/if}
									<polygon points={block.top} class="fill-(--block)" />
								</g>
							{/each}

							{#if hovered}
								<g class="pointer-events-none fill-none stroke-fg-strong" stroke-linejoin="round">
									{#each [hovered.top, hovered.left, hovered.front].filter(Boolean) as points (points)}
										<polygon {points} stroke-width="1.5" vector-effect="non-scaling-stroke" />
									{/each}
								</g>
							{/if}
						</svg>

						<!-- month names sit above the grid in 2D and fade over to its front edge in 3D -->
						<div class="pointer-events-none absolute inset-0">
							{#each LABELLED_DAYS as day (day)}
								{@render floorLabel(
									weekdayShort(day),
									place(-0.4, day + 0.5),
									'right-0 -translate-y-1/2'
								)}
							{/each}
							{#each monthLabels as { label, x } (x)}
								{@render floorLabel(
									label,
									place(x + GAP / 2, -0.3),
									'bottom-0 left-0',
									clamp(1 - 2 * turned)
								)}
								{@render floorLabel(
									label,
									place(x + GAP / 2, 7.3),
									'top-0 left-0',
									clamp(2 * turned - 1)
								)}
							{/each}
						</div>

						<TooltipProvider>
							<TooltipRoot
								open={Boolean(hovered)}
								onOpenChange={(open) => {
									if (!open) active = null
								}}
								disableHoverableContent
							>
								<TooltipPortal>
									<!-- a tap on another day moves the tooltip there instead of closing it -->
									<TooltipContent
										customAnchor={anchor}
										updatePositionStrategy="always"
										collisionPadding={8}
										class="pointer-events-none"
										onInteractOutside={(event) => {
											if (event.target.closest?.('[data-day]')) event.preventDefault()
										}}
									>
										{tooltipText}
									</TooltipContent>
								</TooltipPortal>
							</TooltipRoot>
						</TooltipProvider>
					</div>
				</div>

				<div
					bind:clientHeight={legendHeight}
					class="pointer-events-none flex items-center justify-end gap-1 pt-6 font-mono text-xs text-fg-muted md:absolute md:right-0 md:bottom-0 md:z-10"
					aria-hidden="true"
				>
					<span class="mr-1">{m.contributions_less()}</span>
					{#each LEVELS as level (level)}
						<span class={['size-3 rounded-xs bg-(--block)', level]}></span>
					{/each}
					<span class="ml-1">{m.contributions_more()}</span>
				</div>
			</div>
		</GridCard>
	</section>
{/if}
