<script>
	import Logo from './Logo.svelte'
	import ControlsNav from './ControlsNav.svelte'
</script>

<header class="relative z-10">
	<nav class="mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-4">
		<div class="grid grid-cols-[1fr_auto_1fr] items-center gap-1 sm:gap-4">
			<div class="flex items-center">
				<a href="/" class="h-8 w-8 sm:h-10 sm:w-10">
					<Logo />
				</a>
			</div>
      <div class="flex items-center justify-center gap-3 text-sm sm:gap-8 sm:text-base">
        <a href="/about" class="text-[var(--muted)] hover:text-[var(--base-fg)] transition-colors">About</a>
        <a href="/projects" class="text-[var(--muted)] hover:text-[var(--base-fg)] transition-colors">Projects</a>
        <a href="/blog" class="text-[var(--muted)] hover:text-[var(--base-fg)] transition-colors">Blog</a>
      </div>
      <div class="flex items-center justify-end">
        <ControlsNav />
      </div>
		</div>
	</nav>
</header>
