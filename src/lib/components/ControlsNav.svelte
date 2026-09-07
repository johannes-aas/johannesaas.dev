<script>
	import ThemeSwitcher from './ThemeSwitcher.svelte'
	import LogoSettings from './LogoSettings.svelte'
	import { logoSettingsActive } from '$lib/stores/logoControls'
</script>

<nav class="relative flex items-center gap-[0.35rem]" aria-label="Site controls">
	<ThemeSwitcher />
	{#if $logoSettingsActive}
		<div class="hidden sm:block">
			<LogoSettings />
		</div>
	{/if}
</nav>
