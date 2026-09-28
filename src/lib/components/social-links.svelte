<script>
	import Button from '$lib/components/button.svelte'
	import Mail from '@lucide/svelte/icons/mail'
	import { GithubIcon, LinkedinIcon } from '$lib/components/icons'
	import { m } from '$lib/paraglide/messages'

	const pill =
		'justify-start gap-3 rounded-sm border border-border-subtle bg-surface/50 px-6 py-3 text-fg backdrop-blur-sm hover:border-border-strong hover:bg-surface/60 hover:text-fg-strong'
</script>

<div class="flex flex-col justify-center gap-4 sm:flex-row">
	<Button
		href="https://github.com/johannes-aas"
		target="_blank"
		rel="noopener noreferrer"
		class={pill}
	>
		<GithubIcon />
		GitHub
	</Button>

	<Button
		href="https://www.linkedin.com/in/johannes-hansen-aas/"
		target="_blank"
		rel="noopener noreferrer"
		class={pill}
	>
		<LinkedinIcon />
		LinkedIn
	</Button>

	<Button email="johannes.hansen.aas@gmail.com" class={pill}>
		<Mail class="size-5" />
		{m.social_email()}
	</Button>
</div>
