import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: '0.0.0.0', // Bind to all IPs
		port: 3000 // Port to run the app on
	}
});
