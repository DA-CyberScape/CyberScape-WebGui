import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

export const load = async ({ request }) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const token = cookies['authToken'];

	// Log token for debugging purposes
	console.log('Token in page.server:', token);

	const url = new URL(request.url);
	const currentPath = url.pathname;
	const redirectTo = url.searchParams.get('redirectTo') || '/';

	// Exclude requests to /login/__data.json from redirection logic
	if (currentPath.includes('/login/__data.json')) {
		return {}; // Let the request go through without redirect
	}

	// If the user is logged in
	if (token) {
		// If they’re on the login page, redirect them to their desired path or home
		if (currentPath === '/login') {
			console.log(`Redirecting from login to ${redirectTo}`);
			throw redirect(302, redirectTo);
		}
		// If they’re already on their desired path, no redirect is needed
		return {};
	}

	// If the user is not logged in
	if (!token) {
		// Only redirect if they're trying to access a protected page (not /login)
		if (currentPath !== '/login') {
			console.log(`User not logged in; redirecting to login with redirectTo: ${currentPath}`);
			throw redirect(302, `/login?redirectTo=${encodeURIComponent(currentPath)}`);
		}
		// If they're already on /login, allow them to stay without redirecting
		return {};
	}

	// Default return if no redirect is needed
	return {};
};
