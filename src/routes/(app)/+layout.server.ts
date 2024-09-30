import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

export const load = async ({ request }) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const token = cookies['authToken'];

	// If there is no authentication token, check the path
	if (!token) {
		const url = new URL(request.url);
		const pathname = url.pathname;

		console.log('pathname', pathname);

		if (pathname === '/login') {
			return {};
		}

		// For all other routes, capture only the relevant part of the path
		const relevantPartMatch = pathname.match(/\/([^/]+)/);
		const relevantPart = relevantPartMatch ? relevantPartMatch[1] : '';

		if (pathname == "/__data.json") {
			throw redirect(302, `/login`);
		}

		throw redirect(302, `/login?redirectTo=${encodeURIComponent(relevantPart)}`);
	}

	// If the user is authenticated, continue loading the page
	return {};
};
