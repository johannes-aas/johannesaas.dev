<script>
	import Button from '$lib/components/button.svelte'
	import Mail from '@lucide/svelte/icons/mail'
	import { GithubIcon, LinkedinIcon } from '$lib/components/icons'
</script>

<div class="flex flex-col justify-center gap-4 sm:flex-row">
	<a
		href="https://github.com/johannes-aas"
		target="_blank"
		rel="noopener noreferrer"
		class="group flex items-center space-x-3 border border-border bg-surface/50 px-6 py-3 backdrop-blur-sm transition-colors duration-200 hover:border-border-strong hover:bg-surface/60"
	>
		<GithubIcon class="text-fg-muted transition-colors group-hover:text-fg-strong" />
		<span class="text-fg transition-colors group-hover:text-fg-strong">GitHub</span>
	</a>

	<a
		href="https://www.linkedin.com/in/johannes-hansen-aas/"
		target="_blank"
		rel="noopener noreferrer"
		class="group flex items-center space-x-3 border border-border bg-surface/50 px-6 py-3 backdrop-blur-sm transition-colors duration-200 hover:border-border-strong hover:bg-surface/60"
	>
		<LinkedinIcon class="text-fg-muted transition-colors group-hover:text-fg-strong" />
		<span class="text-fg transition-colors group-hover:text-fg-strong">LinkedIn</span>
	</a>

	<Button
		variant="copy"
		value="johannes.hansen.aas@gmail.com"
		class="group flex items-center space-x-3 border border-border bg-surface/50 px-6 py-3 backdrop-blur-sm transition-colors duration-200 hover:border-border-strong hover:bg-surface/60"
	>
		<Mail class="h-5 w-5 text-fg-muted transition-colors group-hover:text-fg-strong" />
		<span class="text-fg transition-colors group-hover:text-fg-strong">Email</span>
	</Button>
</div>
