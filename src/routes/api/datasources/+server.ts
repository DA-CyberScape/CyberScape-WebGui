import type { RequestHandler } from './$types';
import {
	getActiveDatasources,
	getAllDatasources,
	getInactiveDatasources,
	updateDatasource,
	findDatasourceByName,
	findDatasourceByType,
	addDatasource,
	removeDatasource
} from '$lib/datasources';

export const GET: RequestHandler = async ({ url }) => {
	const name = url.searchParams.get('name');
	const type = url.searchParams.get('type');
	const active = url.searchParams.get('active');

	let datasources;

	if (type) {
		datasources = findDatasourceByType(type);
	} else if (name) {
		datasources = findDatasourceByName(name);
	} else if (active === 'true') {
		datasources = getActiveDatasources();
	} else if (active === 'false') {
		datasources = getInactiveDatasources();
	} else {
		datasources = getAllDatasources();
	}

	if (!Array.isArray(datasources)) {
		datasources = datasources ? [datasources] : [];
	}

	return new Response(JSON.stringify({ sources: datasources }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const newDatasource = await request.json();

		if (!newDatasource.name || !newDatasource.type) {
			return new Response(JSON.stringify({ error: 'Invalid datasource data' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const existingDatasource = findDatasourceByName(newDatasource.name);
		if (existingDatasource) {
			return new Response(
				JSON.stringify({ error: `Datasource with name ${newDatasource.name} already exists` }),
				{
					status: 409,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		addDatasource(newDatasource);

		return new Response(JSON.stringify({ message: 'Datasource added successfully' }), {
			status: 201,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: 'Failed to add datasource' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};

export const PUT: RequestHandler = async ({ url, request }) => {
	const oldName = url.searchParams.get('name');

	if (!oldName) {
		return new Response(JSON.stringify({ error: 'Old datasource name is required' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const { name, type, active } = await request.json();

		if (!name || !type || typeof active !== 'boolean') {
			return new Response(JSON.stringify({ error: 'Invalid datasource data' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const source = findDatasourceByName(name);
		if (source && source.name !== oldName) {
			return new Response(
				JSON.stringify({ error: `Datasource with name ${name} already exists` }),
				{
					status: 409,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		updateDatasource(oldName, name, type, active);

		return new Response(JSON.stringify({ message: 'Datasource updated successfully' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: 'Failed to update datasource' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	const name = url.searchParams.get('name');

	if (!name) {
		return new Response(JSON.stringify({ error: 'Datasource name is required' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	removeDatasource(name);

	return new Response(JSON.stringify({ message: 'Datasource removed successfully' }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
