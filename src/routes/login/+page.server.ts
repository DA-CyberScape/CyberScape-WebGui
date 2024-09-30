import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

export const load = async ({ request }) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const token = cookies['authToken'];

	if (token) {
		const redirectTo = new URLSearchParams(window.location.search).get('redirectTo') || '/';
		throw redirect(302, redirectTo);
	}

	return {};
};
