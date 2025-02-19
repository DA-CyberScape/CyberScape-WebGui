// src/lib/sources.ts
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
	'        "enum": ["MD5", "SHA1", "SHA256", "SHA384", "SHA512"]\n' +
	'      },\n' +
	'      "encryption": {\n' +
	'        "type": "string",\n' +
	'        "enum": ["AES", "AES128", "AES192","AES256", "DES"]\n' +
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

const structureObject = JSON.parse(structure);
export { structureObject as structure };