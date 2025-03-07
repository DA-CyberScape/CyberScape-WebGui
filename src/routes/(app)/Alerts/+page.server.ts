import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

const API_URL = 'http://10.0.1.10:5073/alerts/';

export const load: PageServerLoad = async () => {
	try {
		const response = await fetch(API_URL);
		if (!response.ok) {
			throw error(response.status, `Error fetching alerts: ${response.statusText}`);
		}
		const alerts = await response.json();
		return { alerts: Array.isArray(alerts) ? alerts : [] };
	} catch (err) {
		console.error('Error fetching alerts:', err);
		return { alerts: [] };
	}
};

export const actions = {
	delete: async ({ request }) => {
		// Action name must match client-side call
		const formData = await request.formData();
		const alertId = formData.get('alertId');

		if (!alertId) {
			throw error(400, 'Missing alert ID');
		}

		try {
			const response = await fetch(`${API_URL}${alertId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw error(response.status, `Error deleting alert: ${response.statusText}`);
			}

			return { success: true };
		} catch (err) {
			console.error('Error deleting alert:', err);
			throw error(500, 'Failed to delete alert');
		}
	}
};
