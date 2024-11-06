import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

export const load = async ({ request }) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const token = cookies['authToken'];

	// If no token and not already on the login page, redirect to login
	const url = new URL(request.url);
	const pathname = url.pathname;

	if (!token) {
		// If user is on the login page, don't redirect to itself
		if (pathname === '/login') {
			return {}; // Allow login page to load
		}

		// For all other routes, redirect to login with the redirectTo parameter
		const relevantPartMatch = pathname.match(/\/([^/]+)/);
		const relevantPart = relevantPartMatch ? relevantPartMatch[1] : '';

		// Redirect to login page with redirectTo query parameter
		throw redirect(302, `/login?redirectTo=${encodeURIComponent(relevantPart)}`);
	}

	// If the user is authenticated, allow the page to load
	return {};
};
