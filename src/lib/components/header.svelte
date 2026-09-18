<script>
	import Logo from './logo.svelte'
	import ThemeSwitcher from './theme-switcher.svelte'
</script>

<header class="relative z-30 flex items-center">
	<nav class="flex flex-1 items-center gap-1 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4">
		<div class="flex items-center">
			<a href="/" class="h-8 w-8 sm:h-10 sm:w-10">
				<Logo />
			</a>
		</div>
		<div class="flex flex-1 items-center justify-center gap-3 text-sm sm:gap-8 sm:text-base">
			<a href="/about" class="text-muted transition-colors hover:text-base-fg">About</a>
			<a href="/projects" class="text-muted transition-colors hover:text-base-fg">Projects</a>
			<a href="/blog" class="text-muted transition-colors hover:text-base-fg">Blog</a>
		</div>
	</nav>
	<div class="flex items-center self-stretch">
		<ThemeSwitcher />
	</div>
</header>
