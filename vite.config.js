import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

const isProd = process.env.VERCEL_ENV === 'production'
const commitSha = isProd ? (process.env.VERCEL_GIT_COMMIT_SHA ?? '') : ''
const commitMessage = isProd ? (process.env.VERCEL_GIT_COMMIT_MESSAGE ?? '').split('\n')[0] : ''

export default defineConfig({
	define: {
		'import.meta.env.VITE_COMMIT_SHA': JSON.stringify(commitSha),
		'import.meta.env.VITE_COMMIT_MESSAGE': JSON.stringify(commitMessage)
	},
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			emitTsDeclarations: true,
			strategy: ['url', 'cookie', 'baseLocale']
		})
	]
})
