import type { RequestHandler } from './$types';
import {
	addDatasourceType,
	updateDatasourceType,
	removeDatasourceType,
	getDatasourceTypes
} from '$lib/datasources';

export const GET: RequestHandler = async () => {
	return new Response(JSON.stringify({ types: getDatasourceTypes() }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const POST: RequestHandler = async ({ request }) => {
	const { newType } = await request.json();

	if (!newType) {
		return new Response(JSON.stringify({ error: 'Invalid type data' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	addDatasourceType(newType);

	return new Response(null, { status: 204 });
};

export const PUT: RequestHandler = async ({ request }) => {
	const { type, newType } = await request.json();

	if (!type || !newType) {
		return new Response(JSON.stringify({ error: 'Invalid type data' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	updateDatasourceType(type, newType);

	return new Response(null, { status: 204 });
};

export const DELETE: RequestHandler = async ({ request }) => {
	const { type } = await request.json();

	if (!type) {
		return new Response(JSON.stringify({ error: 'Invalid type data' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	removeDatasourceType(type);

	return new Response(null, { status: 204 });
};