import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

export const load = async ({ request }) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const token = cookies['authToken'];

	if (!token) {
		const url = new URL(request.url);
		const redirectTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(302, `/login?redirectTo=${redirectTo}`);
	}

	return {};
};
