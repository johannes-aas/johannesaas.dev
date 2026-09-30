<script>
	import GitCommitVertical from '@lucide/svelte/icons/git-commit-vertical'
	import Button from '$lib/components/button.svelte'
	import Logo from '$lib/components/logo.svelte'
	import { GithubIcon, LinkedinIcon } from '$lib/components/icons'
	import { m } from '$lib/paraglide/messages'

	const email = 'johannes.hansen.aas@gmail.com'
	const sha = import.meta.env.VITE_COMMIT_SHA
	const message = import.meta.env.VITE_COMMIT_MESSAGE
</script>

<footer
	class="relative -mx-px overflow-hidden border-x border-border-subtle bg-body [view-transition-name:site-footer]"
>
	<div class="relative flex flex-col items-start gap-6 p-8 md:p-10 md:min-h-96">
		<div
			class="absolute inset-y-0 right-0 hidden aspect-square p-12 md:block [&_path]:fill-primary-subtle [&_path]:stroke-primary [&_path]:[stroke-dasharray:1] [&_path]:[stroke-dashoffset:1] [&_path]:[transition:fill_300ms_ease-out,stroke-dashoffset_800ms_ease-in-out_150ms] [&_path]:hover:fill-primary/40 [&_path]:hover:[stroke-dashoffset:0] [&_path]:hover:[transition:stroke-dashoffset_800ms_ease-in-out,fill_500ms_ease-out_500ms]"
			aria-hidden="true"
		>
			<Logo />
		</div>
		<div class="relative flex flex-col items-start gap-2">
			<p class="font-mono text-xs tracking-widest text-fg-muted uppercase">
				{m.about_get_in_touch()}
			</p>
			<Button
				{email}
				class="text-lg font-medium break-all text-fg-strong hover:text-primary-text sm:text-2xl"
			>
				{email}
			</Button>
		</div>
		<div class="relative flex gap-6 text-base text-fg-muted">
			<a
				href="https://github.com/johannes-aas"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-2 transition-colors hover:text-fg-strong"
			>
				<GithubIcon class="size-5" />
				GitHub
			</a>
			<a
				href="https://www.linkedin.com/in/johannes-hansen-aas/"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-2 transition-colors hover:text-fg-strong"
			>
				<LinkedinIcon class="size-5" />
				LinkedIn
			</a>
		</div>
	</div>

	<div
		class="relative flex flex-col items-start gap-4 border-t border-border-subtle p-8 md:p-10 sm:flex-row sm:items-center sm:justify-between"
	>
		{#if sha}
			<a
				href="https://github.com/johannes-aas/personal-website/commit/{sha}"
				target="_blank"
				rel="noopener noreferrer"
				class="group flex max-w-full items-center overflow-hidden rounded-sm border border-border-subtle bg-panel font-mono text-xs text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
			>
				<span
					class="flex items-center gap-1.5 border-r border-border-subtle bg-inset px-2 py-1 text-fg transition-colors group-hover:border-border-strong group-hover:text-fg-strong"
				>
					<GitCommitVertical class="size-3.5 shrink-0" />
					{sha.slice(0, 7)}
				</span>
				{#if message}
					<span class="truncate px-2 py-1 sm:max-w-64">{message}</span>
				{/if}
			</a>
		{/if}
		<p class="text-sm text-fg-muted">{m.footer_built_with()}</p>
	</div>
</footer>
