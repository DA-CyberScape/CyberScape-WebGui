// src/lib/sources.ts
let sources: string =
	'[\n' +
	'  {\n' +
	'    "snmpPolls": [\n' +
	'      {\n' +
	'        "name": "FG-SNMP",\n' +
	'        "id": 123123,\n' +
	'        "ip": "10.0.1.254",\n' +
	'        "hostname": "FG-SNMP",\n' +
	'        "oids": [\n' +
	'          {\n' +
	'            "oid": "1.3.6.1.4.1.12356.101.4.1.3.0",\n' +
	'            "name": "CPU LOAD"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": "1.3.6.1.4.1.12356.101.4.1.4.0",\n' +
	'            "name": "MEMORY USAGE"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": "1.3.6.1.2.1.1.3.0",\n' +
	'            "name": "UPTIME"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": "1.3.6.1.4.1.12356.101.4.1.1.0",\n' +
	'            "name": "VERSION"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": "1.3.6.1.4.1.12356.101.7.2.2.1.1",\n' +
	'            "name": "VLANS"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": "1.3.6.1.4.1.12356.101.3.2.1.1.7.1",\n' +
	'            "name": "SESSION COUNT"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": "1.3.6.1.2.1.47.1.1.1.1.14",\n' +
	'            "name": "INTERFACES"\n' +
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
	'        "name": "Switch-SNMP",\n' +
	'        "id": 293485234,\n' +
	'        "ip": "192.168.50.1",\n' +
	'        "hostname": "Switch-SNMP",\n' +
	'        "oids": [\n' +
	'          {\n' +
	'            "oid": ".1.3.6.1.2.1.1.5.0",\n' +
	'            "name": "HOSTNAME"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": ".1.3.6.1.4.1.9.2.1.57.0",\n' +
	'            "name": "CPU LOAD"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": ".1.3.6.1.4.1.9.2.1.9.0",\n' +
	'            "name": "MEMORY USAGE"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": ".1.3.6.1.4.1.9.2.1.73.0",\n' +
	'            "name": "VERSION"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": "1.3.6.1.2.1.1.3.0",\n' +
	'            "name": "UPTIME"\n' +
	'          },\n' +
	'          \n' +
	'          {\n' +
	'            "oid": ".1.3.6.1.2.1.2.2.1.2",\n' +
	'            "name": "INTERFACES"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": ".1.3.6.1.2.1.2.2.1.16",\n' +
	'            "name": "OUTBOUND TRAFFIC INTERFACES"\n' +
	'          },\n' +
	'          {\n' +
	'            "oid": ".1.3.6.1.2.1.2.2.1.10",\n' +
	'            "name": "INBOUND TRAFFIC INTERFACES"\n' +
	'          }\n' +
	'        ],\n' +
	'        "user": "my-user",\n' +
	'        "authentication": "SHA1",\n' +
	'        "encryption": "aes 128",\n' +
	'        "authpass": "junioradmin",\n' +
	'        "privpass": "junioradmin",\n' +
	'        "port": 161\n' +
	'      }\n' +
	'    ]\n' +
	'  },\n' +
	'  {\n' +
	'    "netflowReceiver": [\n' +
	'      {\n' +
	'        "name": "Netflow1",\n' +
	'        "id": 12312,\n' +
	'        "folderLocation": "/home/cyberscape_admin/Netflow_example_files",\n' +
	'        "nfdumpBinaryLocation": "/usr/bin/nfdump",\n' +
	'        "nfcapdBinaryLocation": "/usr/bin/nfcapd",\n' +
	'        "port": 2055\n' +
	'      }\n' +
	'    ]\n' +
	'  },\n' +
	'  {\n' +
	'    "Syslog": [\n' +
	'      {\n' +
	'        "name": "Sys1",\n' +
	'        "id": 56756,\n' +
	'        "port": 514\n' +
	'      }\n' +
	'    ]\n' +
	'  },{\n' +
	'  "snmpTrapReceiver": [\n' +
	'    {\n' +
	'      "name": "SNMP-Trap-Receiver",\n' +
	'      "id": 123129,\n' +
	'      "port": 162\n' +
	'    }\n' +
	'  ]\n' +
	'},\n' +
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
	'        "enum": ["SHA", "SHA1", "MD5"]\n' +
	'      },\n' +
	'      "encryption": {\n' +
	'        "type": "string",\n' +
	'        "enum": ["AES", "AES128", "DES", "3DES"]\n' +
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
	'      "port": "integer"\n' +
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
