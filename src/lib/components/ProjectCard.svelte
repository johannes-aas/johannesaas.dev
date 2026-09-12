<script>
	export let title
	export let description
	export let technologies = []
	export let liveUrl = ''
	export let githubUrl = ''
</script>

<div class="border border-border bg-surface-bg">
	<div class="p-6">
		<h3 class="mb-2 text-xl font-semibold text-surface-fg">{title}</h3>
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
