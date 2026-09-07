<script>
  import SocialLinks from "$lib/components/SocialLinks.svelte"
</script>

<section class="mx-auto max-w-4xl px-4 py-20">
	<div class="flex flex-col md:flex-row gap-20 items-center mx-auto">
		<div class="">
      <h1 class="mb-6 text-6xl font-bold">About me</h1>
			<div class="max-w-md">
				<p>I'm Johannes and I'm currently studying computer science at the Norwegian University of Science and Technology in Trondheim. I'm a developer with a passion for frontend. I love building stuff, especially if I get to make it look cool.</p>
			</div>
      <h2 class="mt-6 mb-4 text-2xl font-semibold">Get in touch</h2>
      <SocialLinks/>
		</div>
		<div class="order-1 md:order-2 md:col-span-2">
			<img
				src="/images/johannes.jpeg"
				alt="Johannes"
				class="w-80 h-80 object-cover border border-[var(--border)]"
			/>
		</div>
	</div>
</section>