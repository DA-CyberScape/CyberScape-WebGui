import { error, json } from '@sveltejs/kit';

const API_BASE_URL = 'http://10.0.1.10:5073/';

export const load = async ({ params }) => {
	const alertId = params.id;

	if (!alertId) {
		throw error(400, 'Missing alert ID');
	}

	try {
		// Fetch alerts and schema in parallel
		const [alertsResponse, tablesResponse] = await Promise.all([
			fetch(`${API_BASE_URL}alerts/`),
			fetch(`${API_BASE_URL}configurations/Database/schema/`)
		]);

		if (!alertsResponse.ok) {
			throw error(alertsResponse.status, `Failed to fetch alerts: ${alertsResponse.statusText}`);
		}

		if (!tablesResponse.ok) {
			throw error(tablesResponse.status, `Failed to fetch schema: ${tablesResponse.statusText}`);
		}

		const alerts = await alertsResponse.json();
		const schema = await tablesResponse.json();

		// Find the alert with the given ID
		const alert = alerts.find((a: any) => a.id.toString() === alertId);
		if (!alert) {
			throw error(404, 'Alert not found');
		}

		// Map tables and filter out unwanted characters
		const productionTables = schema.Production ?? {};
		const tableMap: Record<string, string> = {};
		for (const table of Object.keys(productionTables)) {
			if (!table.includes('"') && table.trim() !== '') {
				tableMap[table.toLowerCase()] = table;
			}
		}

		// Return alert, tables and tableMap to the frontend
		return {
			alert,
			tables: Object.keys(tableMap).sort(),
			tableMap
		};
	} catch (err) {
		console.error('Error fetching alert data:', err);
		throw error(500, 'Error loading alert data');
	}
};

export const actions = {
	fetchColumns: async ({ request }) => {
		const { selectedTable } = await request.json();

		if (!selectedTable) {
			return json({ columns: [] });
		}
		try {
			// Fetch the schema data
			const schemaResponse = await fetch(`${API_BASE_URL}configurations/Database/schema/`);
			if (!schemaResponse.ok) {
				throw error(schemaResponse.status, 'Failed to fetch schema');
			}

			const schema = await schemaResponse.json();
			const database = schema.Production;

			const columns: string[] = [];
			const tableMap: Record<string, string> = {};

			// Map tables and filter out unwanted characters
			for (const table of Object.keys(database)) {
				if (!table.includes('"') && table.trim() !== '') {
					tableMap[table.toLowerCase()] = table;
				}
			}

			// Get the selected table's original name
			const selectedTableOriginal = tableMap[selectedTable.toLowerCase()];
			if (database[selectedTableOriginal]) {
				columns.push(
					...database[selectedTableOriginal]
						.flatMap((colSet: string) =>
							colSet
								.split(',')
								.map((col) => col.trim().split(' ')[0].replace(/["`]/g, '').toLowerCase())
						)
						.filter((col: string) => col !== '')
				);
			}

			// Return the columns of the selected table
			return json({ columns });
		} catch (err) {
			console.error('Error fetching columns for table:', err);
			throw error(500, 'Error fetching columns');
		}
	},
	saveAlert: async ({ request, params }) => {
		const alertId = Number(params.id);

		if (isNaN(alertId)) {
			throw error(400, 'Invalid alert ID');
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString() ?? '';
		const email = formData.get('email')?.toString() ?? '';
		const table = formData.get('table')?.toString() ?? '';
		const selectedColumn = formData.get('selectedColumn')?.toString() ?? '';
		const selectedOperator = formData.get('selectedOperator')?.toString() ?? '';
		const comparisonValue = formData.get('comparisonValue')?.toString() ?? '';
		const customMessage = formData.get('customMessage')?.toString() ?? '';

		const condition = `${selectedColumn} ${selectedOperator} ${comparisonValue}`;

		try {
			// First delete the old alert
			const deleteResponse = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
				method: 'DELETE'
			});

			if (!deleteResponse.ok) {
				throw error(deleteResponse.status, 'Failed to delete old alert');
			}

			// Create the new alert
			const postResponse = await fetch(`${API_BASE_URL}/alerts/`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: alertId,
					name: name,
					tabelle: table,
					condition: condition,
					email_adresse: email,
					custom_message: customMessage,
					timestamp: ''
				})
			});

			if (!postResponse.ok) {
				throw error(postResponse.status, 'Failed to create new alert');
			}

			return { success: true };
		} catch (err) {
			console.error('Error saving alert:', err);
			throw error(500, 'An error occurred while saving the alert');
		}
	}
};
