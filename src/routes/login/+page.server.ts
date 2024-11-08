import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

export const load = async ({ request }) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const token = cookies['authToken'];

	const url = new URL(request.url);
	const redirectTo = url.searchParams.get('redirectTo') || '/';

	console.log('Token in login page:', token);

	if (token) {
		if (redirectTo === '/login') {
			return {};
		}
		throw redirect(302, redirectTo);
	}

	return {};
};
