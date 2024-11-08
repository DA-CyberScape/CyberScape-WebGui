import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

export const load = async ({ request }) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const token = cookies['authToken'];

	console.log('Token in page.server:', token);

	const url = new URL(request.url);
	const currentPath = url.pathname;
	const redirectTo = url.searchParams.get('redirectTo') || '/';

	if (token) {
		if (currentPath === '/login') {
			console.log(`Redirecting from /login to ${redirectTo}`);
			throw redirect(302, redirectTo);
		}
		return {};
	}

	if (!token && currentPath !== '/login') {
		console.log(`No token; redirecting to login from ${currentPath}`);
		throw redirect(302, `/login?redirectTo=${encodeURIComponent(currentPath)}`);
	}

	return {};
};
