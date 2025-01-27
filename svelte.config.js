import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		paths: {
			base: ''
		},
		csrf: {
			checkOrigin: false
		},
		prerender: {
			handleHttpError: (error) => {
				if (error.status === 401) {
					console.log('Handled 401 error during build');
					return { status: 200, body: 'Unauthorized' };
				}
				throw error;
			}
		}
	}
};

export default config;
