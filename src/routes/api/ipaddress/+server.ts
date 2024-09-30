import type { RequestHandler } from './$types';
import { getActiveIP, updateIP, validateIPAddress, validateNetmask } from '$lib/ipaddress';

export const GET: RequestHandler = async () => {
	const activeIP = getActiveIP();
	if (activeIP) {
		return new Response(JSON.stringify(activeIP), { status: 200, headers: { 'Content-Type': 'application/json' } });
	} else {
		return new Response(JSON.stringify({ error: 'No active IP found' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { address, netmask, gateway, dhcp } = data;

		if (!address || !netmask || !gateway || typeof dhcp !== 'boolean') {
			return new Response(JSON.stringify({ error: 'Invalid data provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (!validateIPAddress(address)) {
			return new Response(JSON.stringify({ error: 'Invalid IP address' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (!validateNetmask(netmask)) {
			return new Response(JSON.stringify({ error: 'Invalid netmask' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (!validateIPAddress(gateway)) {
			return new Response(JSON.stringify({ error: 'Invalid gateway address' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const updated = updateIP(address, netmask, gateway, dhcp);
		if (updated) {
			return new Response(JSON.stringify({ message: 'IP updated successfully' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			});
		} else {
			return new Response(JSON.stringify({ error: 'Failed to update IP' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	} catch (err) {
		return new Response(JSON.stringify({ error: 'Failed to parse request data' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
