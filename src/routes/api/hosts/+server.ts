import { json } from '@sveltejs/kit';
import { hosts, updateHosts } from '$lib/hosts';

export const GET = async () => {
	return json(hosts);
};

export const POST = async ({ request }) => {
	try {
		const newContent = await request.json();

		updateHosts(JSON.stringify(newContent));

		return json({ success: true });
	} catch (error) {
		console.error('Error parsing request body:', error);
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}
};
