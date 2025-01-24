let hosts: string =
	'{\n' +
	'  "assignments": [\n' +
	'    {\n' +
	'      "hostname": "Fortigate",\n' +
	'      "ipAddress": "192.168.1.10"\n' +
	'    },\n' +
	'    {\n' +
	'      "hostname": "database-1",\n' +
	'      "ipAddress": "192.168.1.20"\n' +
	'    },\n' +
	'    {\n' +
	'      "hostname": "chicken-server",\n' +
	'      "ipAddress": "192.168.1.5"\n' +
	'    },\n' +
	'    {\n' +
	'      "hostname": "localhost",\n' +
	'      "ipAddress": "127.0.0.1"\n' +
	'    }\n' +
	'  ]\n' +
	'}';

const dataObject = JSON.parse(hosts);
export { dataObject as hosts };

export function updateHosts(newHosts: string) {
	try {
		const parsedSources = JSON.parse(newHosts);

		hosts = JSON.stringify(parsedSources, null, 2);
		Object.assign(dataObject, parsedSources);

		console.log('Hosts successfully updated.');
	} catch (error) {
		console.error('Error updating sources:', error);
		throw new Error('Invalid JSON structure');
	}
}
