import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { execSync } from 'node:child_process'

const isProd = process.env.VERCEL_ENV === 'production'
const commitSha = isProd ? (process.env.VERCEL_GIT_COMMIT_SHA ?? '') : ''
const commitMessage = isProd ? (process.env.VERCEL_GIT_COMMIT_MESSAGE ?? '').split('\n')[0] : ''
const commitDate = isProd ? readCommitDate() : ''

function readCommitDate() {
	try {
		return execSync('git log -1 --format=%cI', { encoding: 'utf8' }).trim()
	} catch {
		return new Date().toISOString()
	}
}

export default defineConfig({
	define: {
		'import.meta.env.VITE_COMMIT_SHA': JSON.stringify(commitSha),
		'import.meta.env.VITE_COMMIT_MESSAGE': JSON.stringify(commitMessage),
		'import.meta.env.VITE_COMMIT_DATE': JSON.stringify(commitDate)
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
