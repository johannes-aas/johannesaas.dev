<script>
	import Check from '@lucide/svelte/icons/check'
	import Copy from '@lucide/svelte/icons/copy'
	import GitCommitHorizontal from '@lucide/svelte/icons/git-commit-horizontal'
	import Button from '$lib/components/button.svelte'
	import Logo from '$lib/components/logo.svelte'
	import { GithubIcon, LinkedinIcon } from '$lib/components/icons'
	import { copyToClipboard } from '$lib/copy-to-clipboard.js'
	import { m } from '$lib/paraglide/messages'
	import { relativeTime } from '$lib/relative-time.js'

	const email = 'johannes.hansen.aas@gmail.com'
	const sha = import.meta.env.VITE_COMMIT_SHA
	const message = import.meta.env.VITE_COMMIT_MESSAGE
	const date = import.meta.env.VITE_COMMIT_DATE

	// touch only: on cursor devices the email itself copies, with the cursor as feedback
	let copied = $state(false)
	let copiedTimeout

	async function copyEmail() {
		if (!(await copyToClipboard(email))) return
		copied = true
		clearTimeout(copiedTimeout)
		copiedTimeout = setTimeout(() => (copied = false), 1500)
	}
</script>

<footer
	class="relative -mx-px overflow-hidden border-x border-border-subtle bg-body [view-transition-name:site-footer]"
>
	<div class="relative flex flex-col items-start gap-2 p-7 md:min-h-96 md:p-10">
		<div
			class="absolute inset-y-0 right-0 hidden aspect-square p-12 md:block [&_path]:fill-primary-subtle [&_path]:stroke-primary [&_path]:[stroke-dasharray:1] [&_path]:[stroke-dashoffset:1] [&_path]:[transition:fill_300ms_ease-out,stroke-dashoffset_800ms_ease-in-out_150ms] [&_path]:hover:fill-primary/40 [&_path]:hover:[stroke-dashoffset:0] [&_path]:hover:[transition:stroke-dashoffset_800ms_ease-in-out,fill_500ms_ease-out_500ms]"
			aria-hidden="true"
		>
			<Logo />
		</div>
		<p class="relative font-mono text-sm tracking-widest text-fg-muted uppercase lg:text-base">
			{m.about_get_in_touch()}
		</p>
		<div
			class="relative mt-auto text-base font-medium text-fg-strong min-[400px]:text-lg min-[830px]:text-2xl lg:text-4xl"
		>
			<Button
				copy={email}
				class="hidden break-all hover:text-primary-text fine-pointer:inline-flex"
			>
				{email}
			</Button>
			<div class="flex items-center gap-4 sm:gap-6 fine-pointer:hidden">
				<span class="break-all">{email}</span>
				<Button
					variant="cell"
					onclick={copyEmail}
					aria-label={m.hero_copy_email()}
					class="relative size-10 shrink-0 rounded-sm bg-surface sm:size-12"
				>
					<Copy
						class={[
							'transition-[opacity,scale] duration-200 ease-out',
							copied && 'scale-50 opacity-0'
						]}
					/>
					<Check
						class={[
							'absolute transition-[opacity,scale] duration-200 ease-out',
							!copied && 'scale-50 opacity-0'
						]}
					/>
				</Button>
			</div>
		</div>
		<div class="relative mt-4 flex gap-6 text-base text-fg-muted">
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
		class="relative flex flex-col items-start gap-10 border-t border-border-subtle p-7 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:p-10"
	>
		{#if sha}
			<div class="flex max-w-full flex-wrap items-center gap-x-3 gap-y-1.5">
				<a
					href="https://github.com/johannes-aas/personal-website/commit/{sha}"
					target="_blank"
					rel="noopener noreferrer"
					class="group flex min-w-0 items-center overflow-hidden rounded-sm border border-border-subtle bg-panel font-mono text-xs text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
				>
					<span
						class="flex items-center gap-1.5 border-r border-border-subtle bg-inset px-2 py-1 text-fg transition-colors group-hover:border-border-strong group-hover:text-fg-strong"
					>
						<GitCommitHorizontal class="size-3.5 shrink-0" />
						{sha.slice(0, 7)}
					</span>
					{#if message}
						<span class="min-w-24 truncate px-2 py-1 sm:max-w-64">{message}</span>
					{/if}
				</a>
				{#if date}
					<time
						datetime={date}
						title={new Date(date).toLocaleString()}
						class="shrink-0 pl-1 font-mono text-xs whitespace-nowrap text-fg-muted/70"
					>
						{m.footer_updated({ time: relativeTime(date) })}
					</time>
				{/if}
			</div>
		{/if}
		<p class="text-sm text-fg-muted">{m.footer_built_with()}</p>
	</div>
</footer>
