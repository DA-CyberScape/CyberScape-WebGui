import yaml from 'yaml';
const { parse } = yaml;

const dbSettingsString: string =
	'clusterlists:\n' +
	'  - listname: "Local Cluster"\n' +
	'    list: [ 10.0.1.12, 10.0.1.13, 10.0.1.14 ]\n' +
	'    active: true\n' +
	'    production: true\n' +
	'  - listname: "Remote Cluster"\n' +
	'    list: [ 192.168.0.110, 192.168.0.111, 192.168.0.112 ]\n' +
	'    active: false\n' +
	'    production: true\n' +
	'  - listname: "Docker Cluster 1"\n' +
	'    list: [ 172.17.0.2, 172.17.0.3, 172.17.0.4 ]\n' +
	'    active: false\n' +
	'    production: true\n' +
	'  - listname: "Docker Cluster 2"\n' +
	'    list: [ 172.18.0.2, 172.18.0.3, 172.18.0.4 ]\n' +
	'    active: false\n' +
	'    production: true';

let dbObject: any;

try {
	dbObject = parse(dbSettingsString);
} catch (error) {
	console.error('Error parsing settings string:', error);
}

export { dbObject as dbSettings };

export function updateSettings(newSetting: string) {
	try {
		const newSettingObject = JSON.parse(newSetting);
		Object.assign(dbObject, newSettingObject);
	} catch (error) {
		console.error('Error updating settings:', error);
	}
}
