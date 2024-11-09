import type { Handle } from '@sveltejs/kit';
import { parse } from 'svelte/compiler';
import jwt from 'jsonwebtoken';
import { db } from '$lib/db';

export const handle: Handle = async ({ event, resolve }) => {
	const { headers } = event.request;
	const cookies = parse(headers.get('cookie') ?? '');

	if (cookies.AuthorizationToken) {
		// Remove Bearer prefix
		const token = cookies.AuthorizationToken.split(' ')[1];

		try {
			const jwtUser = jwt.verify(token, import.meta.env.VITE_JWT_ACCESS_SECRET);
			if (typeof jwtUser === 'string') {
				throw new Error('Something went wrong');
			}

			const user = await db.user.findUnique({
				where: {
					id: jwtUser.id
				}
			});

			if (!user) {
				throw new Error('User not found');
			}

			const sessionUser: SessionUser = {
				id: user.id,
				username: user.username
			};

			event.locals.user = sessionUser;
		} catch (error) {
			console.error(error);
		}
	}

	return resolve(event);
};