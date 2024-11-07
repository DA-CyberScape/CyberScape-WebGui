import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

export const load = async ({ request }) => {
	// Parse cookies from the request headers
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const token = cookies['authToken'];

	// If token exists, the user is authenticated
	if (token) {
		return {}; // No redirection needed, allow the user to access the page
	} else {
		const url = new URL(request.url);
		const pathname = url.pathname;

		// If the user is already on the login page, no need for redirection
		if (pathname === '/login') {
			return {}; // User can stay on the login page
		}

		// Determine the page the user was trying to access
		const relevantPartMatch = pathname.match(/\/([^/]+)/);
		const relevantPart = relevantPartMatch ? relevantPartMatch[1] : '';

		// If the request is for internal data (`/__data.json`), send them to login
		if (pathname === '/__data.json') {
			throw redirect(302, '/login');
		}

		// Redirect the user to the login page with a `redirectTo` query parameter
		// This will store the page they were trying to access and allow redirection post-login
		throw redirect(302, `/login?redirectTo=${encodeURIComponent(relevantPart)}`);
	}
};
