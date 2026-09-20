<script>
	let { title, description, technologies = [], liveUrl = '', githubUrl = '' } = $props()
</script>

<!-- -mt-px / md:even:-ml-px collapse neighbouring borders into one line; hover:z-10 lifts the stronger border above them -->
<div
	class="relative -mt-px border border-border-subtle transition-colors hover:z-10 hover:border-border md:even:-ml-px"
>
	<div class="p-8 md:p-10">
		<h3 class="mb-3 text-2xl font-semibold md:text-3xl text-surface-fg">{title}</h3>
		<p class="mb-4 text-muted">{description}</p>

		<div class="mb-4 flex flex-wrap gap-2">
			{#each technologies as tech}
				<span class="border border-border bg-base-bg px-2 py-1 text-sm text-base-fg">
					{tech}
				</span>
			{/each}
		</div>

		<div class="flex space-x-4">
			{#if liveUrl}
				<a href={liveUrl} target="_blank" class="font-medium text-surface-fg hover:text-base-fg">
					Visit →
				</a>
			{/if}
			{#if githubUrl}
				<a href={githubUrl} target="_blank" class="font-medium text-muted hover:text-base-fg">
					GitHub →
				</a>
			{/if}
		</div>
	</div>
</div>
