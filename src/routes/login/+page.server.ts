import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

export const load = async ({ request }) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const token = cookies['authToken'];

	// Get the redirectTo query parameter or default to '/'
	const url = new URL(request.url);
	const redirectTo = url.searchParams.get('redirectTo') || '/';

	// If user is already logged in, redirect to the target page
	if (token) {
		// Avoid redirecting to the login page if already logged in
		if (redirectTo === '/login') {
			return {}; // Allow the login page to load
		}
		throw redirect(302, redirectTo); // Redirect to the intended page
	}

	// If not logged in, allow login page to load
	return {};
};
