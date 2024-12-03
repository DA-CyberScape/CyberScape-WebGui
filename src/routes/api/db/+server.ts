import { dbSettings, updateSettings } from '$lib/scylladb';

export const GET = async () => {
	return new Response(JSON.stringify(dbSettings), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const POST = async ({ request }) => {
	try {
		const newContent = await request.json();

		updateSettings(JSON.stringify(newContent));

		return new Response(JSON.stringify({ success: true, updatedSettings: dbSettings }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error parsing request body:', error);

		return new Response(JSON.stringify({ error: 'Invalid JSON format or processing error' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
