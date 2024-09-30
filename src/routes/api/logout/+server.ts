import { json, type RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';

export const POST: RequestHandler = async ({ request }) => {
  // Clearing the cookie by setting its maxAge to 0
  return json({ message: 'Logged out' }, {
    headers: {
      'Set-Cookie': cookie.serialize('authToken', '', {
        httpOnly: true,
        path: '/',
        maxAge: 0  // Expire the cookie
      })
    }
  });
};
