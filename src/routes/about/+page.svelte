<script>
	import SocialLinks from '$lib/components/social-links.svelte'
	import TintedImage from '$lib/components/tinted-image.svelte'
	import { m } from '$lib/paraglide/messages'
</script>

<section class="mx-auto max-w-4xl px-4 py-20">
	<div class="mx-auto flex flex-col items-center gap-20 md:flex-row">
		<div>
			<h1 class="mb-6 text-6xl font-bold">{m.about_title()}</h1>
			<div class="max-w-md">
				<p class="text-fg">{m.about_bio()}</p>
			</div>
			<h2 class="mt-6 mb-4 text-2xl font-semibold">{m.about_get_in_touch()}</h2>
			<SocialLinks />
		</div>
		<div>
			<TintedImage
				src="/images/johannes.jpeg"
				alt={m.about_photo_alt()}
				class="size-80 border border-border"
			/>
		</div>
	</div>
</section>
