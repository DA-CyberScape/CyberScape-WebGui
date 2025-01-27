import type { Handle } from '@sveltejs/kit';
import { JWT_ACCESS_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';

import { db } from '$lib/db';

const handle: Handle = async ({ event, resolve }) => {
	console.log('Started Auth Hook');
	const authCookie = event.cookies.get('AuthorizationToken');

	if (authCookie) {
		// Remove Bearer prefix
		const token = authCookie.split(' ')[1];
		console.log('Extracted Token:', token); // Check if this is working

		try {
			const jwtUser = jwt.verify(token, JWT_ACCESS_SECRET);
			console.log('JWT User:', jwtUser); // Log the decoded JWT payload
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

			const sessionUser = {
				id: user.id,
				username: user.username
			};

			event.locals.user = sessionUser;
		} catch (error) {
			console.error(error);
		}
	}

	console.log('Finished Auth Hook');
	return await resolve(event);
};

export { handle };
