<script>
	import Mail from '@lucide/svelte/icons/mail'
	import { GithubIcon, LinkedinIcon } from '$lib/components/icons'
</script>

<div class="flex flex-col justify-center gap-4 sm:flex-row">
	<a
		href="https://github.com/johannes-aas"
		target="_blank"
		rel="noopener noreferrer"
		class="group flex items-center space-x-3 border border-border bg-surface-bg/50 px-6 py-3 backdrop-blur-sm transition-colors duration-200 hover:border-muted hover:bg-surface-bg/60"
	>
		<GithubIcon class="text-muted transition-colors group-hover:text-base-fg" />
		<span class="text-surface-fg transition-colors group-hover:text-base-fg">GitHub</span>
	</a>

	<a
		href="https://www.linkedin.com/in/johannes-hansen-aas/"
		target="_blank"
		rel="noopener noreferrer"
		class="group flex items-center space-x-3 border border-border bg-surface-bg/50 px-6 py-3 backdrop-blur-sm transition-colors duration-200 hover:border-muted hover:bg-surface-bg/60"
	>
		<LinkedinIcon class="text-muted transition-colors group-hover:text-base-fg" />
		<span class="text-surface-fg transition-colors group-hover:text-base-fg">LinkedIn</span>
	</a>

	<a
		href={`mailto:johannes.hansen.aas@gmail.com`}
		class="group flex items-center space-x-3 border border-border bg-surface-bg/50 px-6 py-3 backdrop-blur-sm transition-colors duration-200 hover:border-muted hover:bg-surface-bg/60"
	>
		<Mail class="h-5 w-5 text-muted transition-colors group-hover:text-base-fg" />
		<span class="text-surface-fg transition-colors group-hover:text-base-fg">Email</span>
	</a>
</div>
