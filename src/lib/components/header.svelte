<script>
	import Logo from './logo.svelte'
	import ThemeSwitcher from './theme-switcher.svelte'
</script>

<header class="relative z-30 flex items-center backdrop-blur-md">
	<a href="/" class="box-border h-14 w-14 flex-none p-3 sm:h-[4.5rem] sm:w-[4.5rem] sm:p-4">
		<Logo />
	</a>
	<nav
		class="flex flex-1 items-center justify-center gap-3 text-sm sm:gap-8 sm:text-base"
	>
		<a href="/about" class="text-muted transition-colors hover:text-base-fg">About</a>
		<a href="/projects" class="text-muted transition-colors hover:text-base-fg">Projects</a>
		<a href="/blog" class="text-muted transition-colors hover:text-base-fg">Blog</a>
	</nav>
	<div class="flex items-center self-stretch">
		<ThemeSwitcher />
	</div>
</header>
