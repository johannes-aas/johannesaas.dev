import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		allowedHosts: ['8519-2001-2020-8369-bccd-e8b5-f783-2260-2c1c.ngrok-free.app'],
	},
});
