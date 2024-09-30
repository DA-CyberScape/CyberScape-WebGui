export interface Datasource {
	name: string;
	regex: string;
	type: string;
	active: boolean;
}

export const data: Datasource[] = [
	{ name: 'Switch', regex: 'switch', type: 'Switch', active: true },
	{ name: 'Router', regex: 'router', type: 'Router', active: false }
];

export const types: string[] = [
	'Switch',
	'Router',
	'Firewall',
	'Access Point',
	'Server',
	'VoIP Phone',
	'Printer',
	'Computer',
	'Other'
];

export function getAllDatasources(): Datasource[] {
	return data;
}

export function findDatasourceByName(name: string): Datasource | undefined {
	return data.find(datasource => datasource.name === name);
}

export function findDatasourceByType(type: string): Datasource | undefined {
	return data.find(datasource => datasource.type === type);
}

export function getActiveDatasources(): Datasource[] {
	return data.filter(datasource => datasource.active);
}

export function getInactiveDatasources(): Datasource[] {
	return data.filter(datasource => !datasource.active);
}

export function addDatasource(datasource: Datasource): void {
	if (findDatasourceByName(datasource.name)) {
		throw new Error(`Datasource with name ${datasource.name} already exists`);
	} else {
		data.push(datasource);
	}
}

export function removeDatasource(name: string): void {
	const index = data.findIndex(datasource => datasource.name === name);
	if (index !== -1) {
		data.splice(index, 1);
	}
}

export function updateDatasource(oldName: string, name: string, regex: string, type: string, active: boolean): void {
	const source = findDatasourceByName(oldName);
	if (source) {
		if (oldName === name) {
			throw new Error(`Datasource with name ${name} already exists`);
		}
		source.name = name;
		source.regex = regex;
		source.type = type;
		source.active = active;
	}
}

export function getDatasourceTypes(): string[] {
	return types;
}

export function addDatasourceType(type: string): void {
	if (!types.includes(type)) {
		types.push(type);
	}
}

export function removeDatasourceType(type: string): void {
	const index = types.indexOf(type);
	if (index !== -1) {
		types.splice(index, 1);
	}
}

export function updateDatasourceType(oldType: string, newType: string): void {
	const index = types.indexOf(oldType);
	if (index !== -1) {
		types[index] = newType;
	}
}