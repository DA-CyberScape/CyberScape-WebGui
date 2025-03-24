import { json } from '@sveltejs/kit';
import yaml from 'js-yaml';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_BASE_URL = 'https://10.0.1.10:5072';

// Helper function to parse response based on content type
async function parseResponse(response) {
	const contentType = response.headers.get('Content-Type');
	const responseText = await response.text();
	console.log('[PROXY] Content-Type:', contentType);
	console.log('[PROXY] Response Text:', responseText.substring(0, 100) + '...'); // Log first 100 characters

	try {
		// Always try YAML first, regardless of content type
		return yaml.load(responseText);
	} catch (yamlError) {
		try {
			// If YAML parsing fails, try JSON
			return JSON.parse(responseText);
		} catch (jsonError) {
			console.error('[PROXY] ❌ ERROR: Failed to parse response as YAML or JSON');
			throw new Error('Failed to parse response as YAML or JSON');
		}
	}
}

export async function GET({ url }) {
	const endpoint = url.searchParams.get('endpoint');
	console.log(`[PROXY] GET request received for endpoint: ${endpoint}`);

	if (!endpoint) {
		console.error('[PROXY] ❌ ERROR: Missing endpoint parameter');
		return json({ error: 'Missing endpoint parameter' }, { status: 400 });
	}

	try {
		console.log(`[PROXY] 🔄 Fetching: ${API_BASE_URL}/${endpoint}`);
		const response = await fetch(`${API_BASE_URL}/${endpoint}`);

		// Log response details
		console.log('[PROXY] Response Status:', response.status);
		console.log('[PROXY] Response Headers:', response.headers);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await parseResponse(response);
		console.log('[PROXY] ✅ Success: Parsed response data', data);
		return json(data);
	} catch (error) {
		console.error('[PROXY] ❌ Fetch error:', error.message);
		console.error('[PROXY] Full error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}

export async function POST({ url, request }) {
	const endpoint = url.searchParams.get('endpoint');
	console.log(`[PROXY] POST request to ${API_BASE_URL}/${endpoint}`);

	if (!endpoint) {
		console.error('[PROXY] ❌ ERROR: Missing endpoint');
		return json({ error: 'Missing endpoint' }, { status: 400 });
	}

	const incomingContentType = request.headers.get('Content-Type') || '';
	let requestBody;
	let contentType = 'application/json';

	console.log('[PROXY] Incoming Content-Type:', incomingContentType);

	try {
		if (incomingContentType.includes('application/x-yaml')) {
			// Read the request body as raw text (YAML format)
			requestBody = await request.text();
			contentType = 'application/x-yaml';
			console.log('[PROXY] Request Body (YAML):', requestBody);
		} else {
			// Read as JSON and store the object
			requestBody = await request.json();
			console.log('[PROXY] Request Body (JSON):', requestBody);
		}
	} catch (e) {
		console.error('[PROXY] ❌ ERROR: Failed to parse request body', e);
		return json({ error: 'Invalid request body format' }, { status: 400 });
	}

	try {
		// Convert object to YAML **only if needed**
		const finalBody =
			contentType === 'application/x-yaml' ? requestBody : JSON.stringify(requestBody);

		console.log('[PROXY] 🔄 Sending request body:', finalBody); // Debug log to verify correct format

		const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
			method: 'POST',
			headers: { 'Content-Type': contentType },
			body: finalBody
		});

		// Log the response status and headers
		console.log('[PROXY] Response Status:', response.status);
		console.log('[PROXY] Response Headers:', response.headers);

		if (!response.ok) {
			const responseBody = await response.text(); // Log the full response body
			console.error('[PROXY] ❌ Response Body:', responseBody);
			throw new Error(`HTTP error! status: ${response.status}, response: ${responseBody}`);
		}

		const responseData = await parseResponse(response);
		console.log('[PROXY] ✅ Success: Received and parsed response', responseData);
		return json(responseData, { status: response.status });
	} catch (error) {
		console.error(`[PROXY] ❌ POST error to ${endpoint}:`, error);
		return json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE({ url }) {
	const endpoint = url.searchParams.get('endpoint');
	console.log(`[PROXY] DELETE request received for endpoint: ${endpoint}`);

	if (!endpoint) {
		console.error('[PROXY] ❌ ERROR: Missing endpoint parameter');
		return json({ error: 'Missing endpoint parameter' }, { status: 400 });
	}

	try {
		console.log(`[PROXY] 🔄 Sending DELETE request to: ${API_BASE_URL}/${endpoint}`);
		const response = await fetch(`${API_BASE_URL}/${endpoint}`, { method: 'DELETE' });

		// Log response status and headers
		console.log('[PROXY] Response Status:', response.status);
		console.log('[PROXY] Response Headers:', response.headers);

		if (!response.ok) {
			throw new Error(`Failed to delete ${endpoint} - Status: ${response.status}`);
		}

		const responseData = await parseResponse(response);
		console.log(`[PROXY] ✅ Success: Deleted ${endpoint}`, responseData);
		return json(responseData);
	} catch (error) {
		console.error('[PROXY] ❌ DELETE error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}
