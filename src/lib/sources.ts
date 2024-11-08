// src/lib/sources.ts
let sources: string =
	'[\n' +
	'  {\n' +
	'    "snmpPolls": [\n' +
	'      {\n' +
	'        "name": "FirewallSNMP",\n' +
	'        "id": 123,\n' +
	'        "ip": "192.168.10.254",\n' +
	'        "hostname": "FW-1123123123123123123123123",\n' +
	'        "oids": [\n' +
	'          {\n' +
	'            "oid": "1.3.6.1.4.1.9.2.1.56.0",\n' +
	'            "name": "CPU Load"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": "1.3.6.1.4.1.9.2.1.8.0",\n' +
	'            "name": "Memory Usage"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": "1.3.6.1.2.1.1.3.0",\n' +
	'            "name": "Uptime"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": "1.3.6.1.2.1.6.9.0",\n' +
	'            "name": "TCP Connections"\n' +
	'          }\n' +
	'        ],\n' +
	'        "user": "MY-USER",\n' +
	'        "authentication": "SHA1",\n' +
	'        "encryption": "aes 128",\n' +
	'        "authpass": "MyAuthPass",\n' +
	'        "privpass": "MyPrivPass",\n' +
	'        "port": 161\n' +
	'      },\n' +
	'      {\n' +
	'        "name": "SwitchSNMP",\n' +
	'        "id": 123123,\n' +
	'        "ip": "192.168.10.20",\n' +
	'        "hostname": "Switch-1",\n' +
	'        "oids": [\n' +
	'          {\n' +
	'            "oid": "1.3.6.1.4.1.9.2.1.56.0",\n' +
	'            "name": "CPU Load"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": "1.3.6.1.4.1.9.2.1.8.0",\n' +
	'            "name": "Memory Usage"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": "1.3.6.1.2.1.1.3.0",\n' +
	'            "name": "Uptime"\n' +
	'          }\n' +
	'        ],\n' +
	'        "user": "MY-USER",\n' +
	'        "authentication": "SHA1",\n' +
	'        "encryption": "aes 128",\n' +
	'        "authpass": "MyAuthPass",\n' +
	'        "privpass": "MyPrivPass",\n' +
	'        "port": 161\n' +
	'      }\n' +
	'    ]\n' +
	'  },\n' +
	'  {\n' +
	'    "netflowReceiver": [\n' +
	'      {\n' +
	'        "name": "Netflow1",\n' +
	'        "id": 12312,\n' +
	'        "folderLocation": "/path/to/folder",\n' +
	'        "nfdumpBinaryLocation": "/usr/local/bin/nfdump",\n' +
	'        "nfcapdBinaryLocation": "/usr/local/bin/nfcapd",\n' +
	'        "port": 2055\n' +
	'      },\n' +
	'      {\n' +
	'        "name": "Netflow2",\n' +
	'        "id": 12312123,\n' +
	'        "folderLocation": "/path/to/123123",\n' +
	'        "nfdumpBinaryLocation": "/usr/local/bin/nfdump123123",\n' +
	'        "nfcapdBinaryLocation": "/usr/local/bin/nfcapd1231231",\n' +
	'        "port": 21231231231\n' +
	'      }\n' +
	'    ]\n' +
	'  },\n' +
	'  {\n' +
	'    "PRTGReceiver": [\n' +
	'      {\n' +
	'        "name": "PRTG1",\n' +
	'        "id": 12312123,\n' +
	'        "PRTGUrl": "http://192.168.10.0",\n' +
	'        "apiToken": "abcdefghijklmneopqrstuvwxyz"\n' +
	'      },\n' +
	'      {\n' +
	'        "name": "PRTG2",\n' +
	'        "id": 3452,\n' +
	'        "PRTGUrl": "http://192.168.120.0",\n' +
	'        "apiToken": "abcdefghijklmneopqr12312312312312312stuvwxyz"\n' +
	'      }\n' +
	'    ]\n' +
	'  },\n' +
	'  {\n' +
	'    "snmpTrapReceiver": [\n' +
	'      {\n' +
	'        "name": "Trap1",\n' +
	'        "id": 12312312,\n' +
	'        "port": 162,\n' +
	'        "version": "SNMPv3",\n' +
	'        "username": "snmpv3user",\n' +
	'        "authProtocol": "SHA",\n' +
	'        "authPassword": "authPassword123",\n' +
	'        "privacyProtocol": "AES",\n' +
	'        "privacyPassword": "privPassword123"\n' +
	'      },\n' +
	'      {\n' +
	'        "name": "Trap2",\n' +
	'        "id": 5675,\n' +
	'        "port": 162,\n' +
	'        "version": "SNMPv2",\n' +
	'        "username": "snmpv3user",\n' +
	'        "authProtocol": "SHA",\n' +
	'        "authPassword": "authPassword123",\n' +
	'        "privacyProtocol": "AES",\n' +
	'        "privacyPassword": "privPassword123"\n' +
	'      }\n' +
	'    ]\n' +
	'  },\n' +
	'  {\n' +
	'    "Syslog": [\n' +
	'      {\n' +
	'        "name": "Sys1",\n' +
	'        "id": 56756,\n' +
	'        "port": 514\n' +
	'      },\n' +
	'      {\n' +
	'        "name": "Sys2",\n' +
	'        "id": 12312,\n' +
	'        "port": 12312\n' +
	'      }\n' +
	'    ]\n' +
	'  },\n' +
	'  {\n' +
	'    "ScyllaDB": {\n' +
	'      "port": 123,\n' +
	'      "ipaddresses": 12312\n' +
	'    }\n' +
	'  }\n' +
	']';

const structure: string =
	'{\n' +
	'  "snmpPolls": [\n' +
	'    {\n' +
	'      "name": "string",\n' +
	'      "id": "integer",\n' +
	'      "ip": "string",\n' +
	'      "hostname": "string",\n' +
	'      "oids": [\n' +
	'        {\n' +
	'          "oid": "string",\n' +
	'          "name": "string"\n' +
	'        }\n' +
	'      ],\n' +
	'      "user": "string",\n' +
	'      "authentication": {\n' +
	'        "type": "string",\n' +
	'        "enum": ["SHA", "MD5"]\n' +
	'      },\n' +
	'      "encryption": {\n' +
	'        "type": "string",\n' +
	'        "enum": ["AES", "DES", "3DES"]\n' +
	'      },\n' +
	'      "authpass": "string",\n' +
	'      "privpass": "string",\n' +
	'      "port": "integer"\n' +
	'    }\n' +
	'  ],\n' +
	'  "netflowReceiver": [\n' +
	'    {\n' +
	'      "name": "string",\n' +
	'      "id": "integer",\n' +
	'      "folderLocation": "string",\n' +
	'      "nfdumpBinaryLocation": "string",\n' +
	'      "nfcapdBinaryLocation": "string",\n' +
	'      "port": "integer"\n' +
	'    }\n' +
	'  ],\n' +
	'  "PRTGReceiver": [\n' +
	'    {\n' +
	'      "name": "string",\n' +
	'      "id": "integer",\n' +
	'      "PRTGUrl": "string",\n' +
	'      "apiToken": "string"\n' +
	'    }\n' +
	'  ],\n' +
	'  "snmpTrapReceiver": [\n' +
	'    {\n' +
	'      "name": "string",\n' +
	'      "id": "integer",\n' +
	'      "port": "integer",\n' +
	'      "version": {\n' +
	'        "type": "string",\n' +
	'        "enum": ["SNMPv3", "SNMPv2"]\n' +
	'      },\n' +
	'      "username": "string",\n' +
	'      "authProtocol": {\n' +
	'        "type": "string",\n' +
	'        "enum": ["SHA", "MD5"]\n' +
	'      },\n' +
	'      "authPassword": "string",\n' +
	'      "privacyProtocol": {\n' +
	'        "type": "string",\n' +
	'        "enum": ["AES", "DES", "3DES"]\n' +
	'      },\n' +
	'      "privacyPassword": "string"\n' +
	'    }\n' +
	'  ],\n' +
	'  "Syslog": [\n' +
	'    {\n' +
	'      "name": "string",\n' +
	'      "id": "integer",\n' +
	'      "port": "integer"\n' +
	'    }\n' +
	'  ]\n' +
	'}\n';

const dataObject = JSON.parse(sources);
export { dataObject as sources };

const structureObject = JSON.parse(structure);
export { structureObject as structure };

export function updateSources(newSources: string) {
	try {
		const parsedSources = JSON.parse(newSources);

		sources = JSON.stringify(parsedSources, null, 2);
		Object.assign(dataObject, parsedSources);

		console.log('Sources successfully updated.');
	} catch (error) {
		console.error('Error updating sources:', error);
		throw new Error('Invalid JSON structure');
	}
}
