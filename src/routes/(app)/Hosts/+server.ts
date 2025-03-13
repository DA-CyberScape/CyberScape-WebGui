import { json } from '@sveltejs/kit';

const API_URL = 'http://10.0.1.10:5073/host_assignment/';

async function fetchHostsData() {
	const res = await fetch(API_URL);
	if (!res.ok) throw new Error(`Failed to fetch hosts: ${res.statusText}`);
	return res.json();
}

export async function GET() {
	try {
		const data = await fetchHostsData();
		return json(data.assignments || []);
	} catch (error) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		return json({ error: error.message }, { status: 500 });
	}
}

export async function POST({ request }) {
	try {
		const { hostname, ipAddress } = await request.json();
		if (!hostname?.trim() || !ipAddress?.trim()) {
			return json({ error: 'Hostname and IP Address are required.' }, { status: 400 });
		}

		const { assignments = [] } = await fetchHostsData();
		if (assignments.some((host: { ipAddress: any }) => host.ipAddress === ipAddress)) {
			return json({ error: 'The IP address already exists.' }, { status: 400 });
		}

		const updatedHosts = { assignments: [...assignments, { hostname, ipAddress }] };
		const resPost = await fetch(API_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updatedHosts)
		});

		if (!resPost.ok) throw new Error(`Failed to add host: ${resPost.statusText}`);
		return json(updatedHosts.assignments);
	} catch (error) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		return json({ error: error.message }, { status: 500 });
	}
}

export async function PUT({ request }) {
	try {
		const { oldIpAddress, hostname, ipAddress } = await request.json();
		if (!hostname?.trim() || !ipAddress?.trim()) {
			return json({ error: 'Hostname and IP Address are required.' }, { status: 400 });
		}

		const { assignments = [] } = await fetchHostsData();
		const updatedHosts = assignments.map((host: { ipAddress: any }) =>
			host.ipAddress === oldIpAddress ? { ...host, hostname, ipAddress } : host
		);

		const resPost = await fetch(API_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ assignments: updatedHosts })
		});

		if (!resPost.ok) throw new Error(`Failed to update host: ${resPost.statusText}`);
		return json(updatedHosts);
	} catch (error) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		return json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE({ request }) {
	try {
		const { ipAddress } = await request.json();
		if (!ipAddress) {
			return json({ error: 'IP Address is required.' }, { status: 400 });
		}

		const { assignments = [] } = await fetchHostsData();
		const updatedHosts = {
			assignments: assignments.filter((host: { ipAddress: any }) => host.ipAddress !== ipAddress)
		};

		const resPost = await fetch(API_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updatedHosts)
		});

		if (!resPost.ok) throw new Error(`Failed to delete host: ${resPost.statusText}`);
		return json(updatedHosts.assignments);
	} catch (error) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		return json({ error: error.message }, { status: 500 });
	}
}
