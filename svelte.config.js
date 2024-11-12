import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		prerender: {
			handleHttpError: (error) => {
				if (error.status === 401) {
					// Log and handle 401 error
					console.log('Handled 401 error during build');
					return { status: 200, body: 'Unauthorized' }; // Return a fallback response
				}
				// Re-throw the error for other status codes
				throw error;
			}
		}
	}
};

export default config;
