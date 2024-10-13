// src/lib/sources.ts
const sources: string =
	'{\n' +
	'  "snmpPolls": [\n' +
	'    {\n' +
	'      "ip": "192.168.10.254",\n' +
	'      "hostname": "FW-1",\n' +
	'      "oids": [\n' +
	'        {\n' +
	'          "oid": "1.3.6.1.4.1.9.2.1.56.0",\n' +
	'          "name": "CPU Load"\n' +
	'        },\n' +
	'        {\n' +
	'          "oid": "1.3.6.1.4.1.9.2.1.8.0",\n' +
	'          "name": "Memory Usage"\n' +
	'        },\n' +
	'        {\n' +
	'          "oid": "1.3.6.1.2.1.1.3.0",\n' +
	'          "name": "Uptime"\n' +
	'        },\n' +
	'        {\n' +
	'          "oid": "1.3.6.1.2.1.6.9.0",\n' +
	'          "name": "TCP Connections"\n' +
	'        }\n' +
	'      ],\n' +
	'      "user": "MY-USER",\n' +
	'      "authentication": "SHA",\n' +
	'      "encryption": "aes 128",\n' +
	'      "authpass": "MyAuthPass",\n' +
	'      "privpass": "MyPrivPass",\n' +
	'      "port": 161\n' +
	'    },\n' +
	'    {\n' +
	'      "ip": "192.168.1.20",\n' +
	'      "hostname": "Switch-1",\n' +
	'      "oids": [\n' +
	'        {\n' +
	'          "oid": "1.3.6.1.4.1.9.2.1.56.0",\n' +
	'          "name": "CPU Load"\n' +
	'        },\n' +
	'        {\n' +
	'          "oid": "1.3.6.1.4.1.9.2.1.8.0",\n' +
	'          "name": "Memory Usage"\n' +
	'        },\n' +
	'        {\n' +
	'          "oid": "1.3.6.1.2.1.1.3.0",\n' +
	'          "name": "Uptime"\n' +
	'        }\n' +
	'      ],\n' +
	'      "user": "MY-USER",\n' +
	'      "authentication": "SHA",\n' +
	'      "encryption": "aes 128",\n' +
	'      "authpass": "MyAuthPass",\n' +
	'      "privpass": "MyPrivPass",\n' +
	'      "port": 161\n' +
	'    }\n' +
	'  ],\n' +
	'  "netflowReceiver": [\n' +
	'    {\n' +
	'      "folderLocation": "/path/to/folder",\n' +
	'      "nfdumpBinaryLocation": "/usr/local/bin/nfdump",\n' +
	'      "nfcapdBinaryLocation": "/usr/local/bin/nfcapd",\n' +
	'      "port": 2055\n' +
	'    }\n' +
	'  ],\n' +
	'  "PRTGReceiver": [\n' +
	'    {\n' +
	'      "PRTGUrl": "http://192.168.10.0",\n' +
	'      "apiToken": "abcdefghijklmneopqrstuvwxyz"\n' +
	'    }\n' +
	'  ],\n' +
	'  "snmpTrapReceiver": [\n' +
	'    {\n' +
	'      "port": 162,\n' +
	'      "version": "SNMPv3",\n' +
	'      "authParameters": {\n' +
	'        "username": "snmpv3user",\n' +
	'        "authProtocol": "SHA",\n' +
	'        "authPassword": "authPassword123",\n' +
	'        "privacyProtocol": "AES",\n' +
	'        "privacyPassword": "privPassword123"\n' +
	'      }\n' +
	'    }\n' +
	'  ],\n' +
	'  "Syslog": [\n' +
	'    {\n' +
	'      "port": 514\n' +
	'    }\n' +
	'  ],\n' +
	'  "ScyllaDB": {\n' +
	'    "port": 123\n' +
	'  }\n' +
	'}';

// Parse the JSON string into an object
const dataObject = JSON.parse(sources);

// Export the parsed object
export { dataObject as sources };
