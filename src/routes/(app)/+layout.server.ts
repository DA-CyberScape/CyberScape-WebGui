import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

export const load = async ({ request }) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	const token = cookies['authToken'];

	if (!token) {
		const url = new URL(request.url);
		const pathname = url.pathname;

		if (!token) {
			if (pathname === '/login') {
				return {};
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
