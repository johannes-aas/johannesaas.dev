<script>
	import { page } from '$app/state'
	import { getLocale, locales, localizeHref } from '$lib/paraglide/runtime'
	import { m } from '$lib/paraglide/messages'
	import Button from '$lib/components/button.svelte'

	const other = $derived(locales.find((l) => l !== getLocale()))
</script>

<Button
	href={localizeHref(page.url.pathname + page.url.search, { locale: other })}
	hreflang={other}
	lang={other}
	data-sveltekit-reload
	onclick={(e) =>
		sessionStorage.setItem('skip-intro', e.detail ? `${e.clientX},${e.clientY}` : '1')}
	aria-label={m.language_label()}
	variant="header"
	class="font-mono text-sm tracking-[0.16em] uppercase"
>
	{other}
</Button>
