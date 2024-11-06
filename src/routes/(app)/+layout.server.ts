import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

export const load = async ({ request }) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const token = cookies['authToken'];

	// Get the redirectTo query parameter or default to '/'
	const url = new URL(request.url);
	const redirectTo = url.searchParams.get('redirectTo') || '/';

	if (!token) {
		// If user is not authenticated and not already on the login page, redirect to login
		const pathname = url.pathname;

		// If the user is already on the login page, allow it to load
		if (pathname === '/login') {
			return {};
		}

		// Redirect to the login page with the redirectTo query parameter
		throw redirect(302, `/login?redirectTo=${encodeURIComponent(pathname)}`);
	}

	// If the user is authenticated, allow the page to load
	return {};
};
