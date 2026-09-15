<script>
	import Logo from './logo.svelte'
	import ControlsNav from './controls-nav.svelte'
</script>

<header class="relative z-30">
	<nav class="mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-4">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center gap-1 sm:gap-4">
			<div class="flex items-center">
				<a href="/" class="h-8 w-8 sm:h-10 sm:w-10">
					<Logo />
				</a>
			</div>
			<div class="flex items-center justify-center gap-3 text-sm sm:gap-8 sm:text-base">
				<a href="/about" class="text-muted transition-colors hover:text-base-fg">About</a>
				<a href="/projects" class="text-muted transition-colors hover:text-base-fg">Projects</a>
				<a href="/blog" class="text-muted transition-colors hover:text-base-fg">Blog</a>
			</div>
			<div class="flex items-center justify-end">
				<ControlsNav />
			</div>
		</div>
	</nav>
</header>
