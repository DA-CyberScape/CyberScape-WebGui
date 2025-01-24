import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hostsFilePath = path.resolve(__dirname, '../../../lib/hosts.json');

// Helper to validate IP addresses
const isValidIP = (ip) =>
	/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
		ip
	);

function readHosts() {
	try {
		const data = fs.readFileSync(hostsFilePath, 'utf-8');
		return JSON.parse(data);
	} catch (error) {
		console.error('Error reading hosts file:', error);
		return { assignments: [] };
	}
}

function writeHosts(updatedHosts: any) {
	try {
		const backupFilePath = `${hostsFilePath}.bak`;
		fs.writeFileSync(backupFilePath, JSON.stringify(updatedHosts, null, 2));
		fs.renameSync(backupFilePath, hostsFilePath);
		console.log('Hosts file updated successfully.');
	} catch (error) {
		console.error('Error writing to hosts file:', error);
	}
}

function updateHosts(newHost) {
	const hostsData = readHosts();
	hostsData.assignments.push(newHost);
	writeHosts(hostsData);
	return hostsData;
}

export const GET = async () => {
	try {
		const hosts = readHosts();
		return json(hosts);
	} catch (error) {
		console.error('Error fetching hosts:', error);
		return json({ error: 'Error fetching hosts' }, { status: 500 });
	}
};

export const POST = async ({ request }) => {
	try {
		const newHost = await request.json();
		if (!newHost.hostname || !newHost.ipAddress) {
			return json({ error: 'Hostname and IP address are required.' }, { status: 400 });
		}
		if (!isValidIP(newHost.ipAddress)) {
			return json({ error: 'Invalid IP address.' }, { status: 400 });
		}
		const updatedHosts = updateHosts(newHost);
		return json({ success: true, hosts: updatedHosts });
	} catch (error) {
		console.error('Error processing POST request:', error);
		return json({ error: `Error processing request: ${error.message}` }, { status: 400 });
	}
};
