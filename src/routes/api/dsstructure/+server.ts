import { structure } from '$lib/sources';
import { json } from '@sveltejs/kit';

export const GET = async () => {
	return json(structure);
};
