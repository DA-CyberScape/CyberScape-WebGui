import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

export const load = async ({ request }) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const token = cookies['authToken'];

	if (token) {
		console.log('login successfull');
		console.log('token', token);
	} else {
		console.log('login failed');
		const url = new URL(request.url);
		const pathname = url.pathname;
		console.log('pathname', pathname);

		if (!token) {
			if (pathname === '/login') {
				throw redirect(302, `/login`);
			}
			const relevantPartMatch = pathname.match(/\/([^/]+)/);
			const relevantPart = relevantPartMatch ? relevantPartMatch[1] : '';

			if (pathname == '/__data.json') {
				throw redirect(302, `/login`);
			}
			throw redirect(302, `/login?redirectTo=${encodeURIComponent(relevantPart)}`);
		}

		return {};
	}
};
