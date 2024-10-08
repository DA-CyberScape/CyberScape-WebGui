export interface Ipaddress {
	address: string;
	netmask: number;
	gateway: string;
	dhcp: boolean;
	active: boolean;
}

export const addresses: Ipaddress[] = [
	{ address: '192.168.0.10', netmask: 24, gateway: '192.168.0.1', dhcp: true, active: true },
	{ address: '192.168.0.33', netmask: 16, gateway: '192.168.0.254', dhcp: false, active: false }
];

export function findIPByDHCP(dhcp: boolean): Ipaddress | undefined {
	return addresses.find((address) => address.dhcp === dhcp);
}

export function updateIP(
	address: string,
	netmask: number,
	gateway: string,
	dhcp: boolean
): boolean {
	const ip = findIPByDHCP(dhcp);
	const ipInactive = findIPByDHCP(!dhcp);
	if (!ip && !ipInactive) {
		return false;
	}
	if (dhcp) {
		if (ip && ipInactive) {
			ip.active = true;
			ipInactive.active = false;
			return true;
		}
	} else if (ip && ipInactive) {
		ipInactive.active = false;
		ip.address = address;
		ip.netmask = netmask;
		ip.gateway = gateway;
		ip.dhcp = dhcp;
		ip.active = true;
		return true;
	}
	return false;
}

export function getActiveIP(): Ipaddress | undefined {
	return addresses.find((address) => address.active);
}

export function validateIPAddress(value: string): boolean {
	const ipPattern =
		/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	return ipPattern.test(value.trim());
}

export function validateNetmask(value: string | number): boolean {
	const netmaskValue = typeof value === 'string' ? parseInt(value.trim(), 10) : value;

	return !isNaN(netmaskValue) && netmaskValue >= 0 && netmaskValue <= 32;
}
