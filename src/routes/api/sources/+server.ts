// src/routes/api/sources.ts
import { json } from '@sveltejs/kit';
import { sources } from '$lib/sources';
import fs from 'fs';
import path from 'path';

export const GET = async () => {
	return json(sources);
};

export const POST = async ({ request }) => {
	try {
		const newContent = await request.json();
		writeJsonFile(newContent);
		return json({ success: true });
	} catch (error) {
		console.error('Error parsing request body:', error);
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}
};

const writeJsonFile = (content: any) => {
	const jsonFilePath = path.resolve('src/lib/sources.ts');

	try {
		fs.writeFileSync(jsonFilePath, JSON.stringify(content, null, 2));
		return { success: true };
	} catch (error) {
		console.error('Error writing to JSON file:', error);
		return { error: 'Error writing to JSON file' };
	}
};
