import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const hostsFilePath = path.resolve('$lib/hosts.json');

// Read the hosts from the JSON file
function readHosts() {
	try {
		const data = fs.readFileSync(hostsFilePath, 'utf-8');
		return JSON.parse(data); // Return the parsed JSON data
	} catch (error) {
		console.error('Error reading hosts file:', error);
		return { assignments: [] }; // Return an empty structure if the file doesn't exist or can't be read
	}
}

// Write the updated hosts back to the JSON file
function writeHosts(updatedHosts: object) {
	try {
		fs.writeFileSync(hostsFilePath, JSON.stringify(updatedHosts, null, 2));
		console.log('Hosts file updated successfully.');
	} catch (error) {
		console.error('Error writing to hosts file:', error);
	}
}

// Function to update the hosts (add new host and persist)
function updateHosts(newHost: object) {
	const hostsData = readHosts(); // Get the current hosts
	hostsData.assignments.push(newHost); // Add the new host
	writeHosts(hostsData); // Write the updated list back to the file
	return hostsData; // Return the updated hosts data
}

// GET request to fetch all hosts
export const GET = async () => {
	try {
		const hosts = readHosts(); // Read hosts from the JSON file
		return json(hosts); // Return the hosts as a JSON response
	} catch (error) {
		console.error('Error fetching hosts:', error);
		return json({ error: 'Error fetching hosts' }, { status: 500 });
	}
};

// POST request to add a new host
export const POST = async ({ request }) => {
	try {
		const newHost = await request.json(); // Get the new host data from the request body

		// Validate the host data
		if (!newHost.hostname || !newHost.ipAddress) {
			return json({ error: 'Hostname and IP address are required.' }, { status: 400 });
		}

		// Update the hosts (add the new host and save to the JSON file)
		const updatedHosts = updateHosts(newHost);

		return json({ success: true, hosts: updatedHosts }); // Return the updated hosts data
	} catch (error) {
		console.error('Error processing POST request:', error);
		return json({ error: `Error processing request: ${error.message}` }, { status: 400 });
	}
};
