import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

export const load = async ({ request }) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const token = cookies['authToken'];

	const url = new URL(request.url);
	const currentPath = url.pathname;
	const redirectTo = url.searchParams.get('redirectTo') || '/';

	console.log('Token in page.server:', token);
	console.log('Current path:', currentPath);
	console.log('Redirect target:', redirectTo);

	if (token) {
		if (currentPath === '/login/__data.json') {
			console.log(`Redirecting from login to ${redirectTo}`);
			throw redirect(302, redirectTo);
		}
		return {};
	}

	if (!token) {
		if (currentPath !== '/login') {
			console.log(`User not logged in; redirecting to login with redirectTo: ${currentPath}`);
			throw redirect(302, `/login?redirectTo=${encodeURIComponent(currentPath)}`);
		}
		return {};
	}

	return {};
};
