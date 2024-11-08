import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

export const load = async ({ request }) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const token = cookies['authToken'];

	console.log('layout.server');

	console.log('Token in layout.server:', token);

	const url = new URL(request.url);
	const pathname = url.pathname;

	// Exclude requests to /login/__data.json and any other data fetching routes
	if (pathname.includes('__data.json') || pathname === '/login') {
		return {}; // Let the request go through without redirect
	}

	// If the user is not logged in
	if (!token) {
		// Redirect the user to the login page if they are not logged in and accessing a protected page
		const relevantPartMatch = pathname.match(/\/([^/]+)/);
		const relevantPart = relevantPartMatch ? relevantPartMatch[1] : '';
		console.log(`User not logged in; redirecting to login with redirectTo: ${relevantPart}`);
		throw redirect(302, `/login?redirectTo=${encodeURIComponent(relevantPart)}`);
	}

	// If the user is logged in, return an empty object to allow them to proceed
	return {};
};
