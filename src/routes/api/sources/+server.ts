// src/routes/api/sources.ts
import { json } from '@sveltejs/kit';
import { sources, updateSources } from '$lib/sources';

export const GET = async () => {
	return json(sources);
};

export const POST = async ({ request }) => {
	try {
		const newContent = await request.json();

		updateSources(JSON.stringify(newContent));

		return json({ success: true });
	} catch (error) {
		console.error('Error parsing request body:', error);
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}
};
