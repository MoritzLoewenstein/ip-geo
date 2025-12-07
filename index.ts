import {
	createServer,
	type IncomingMessage,
	type ServerResponse,
} from "node:http";
import geoip2 from "@maxmind/geoip2-node";
import ipaddr, { type IPv6 } from "ipaddr.js";

const geoIpReader = await geoip2.Reader.open("./data/GeoLite2-City.mmdb", {
	watchForUpdates: true,
});
const asnIpReader = await geoip2.Reader.open("./data/GeoLite2-ASN.mmdb", {
	watchForUpdates: true,
});

const PORT = process.env.PORT ?? 3000;
const server = createServer((req: IncomingMessage, res: ServerResponse) => {
	if (req.method !== "GET") {
		res.writeHead(405);
		res.end("method not allowed");
		return;
	}

	const ip = (req.headers?.["x-forwarded-for"] ||
		req.socket.remoteAddress) as string;
	const ipParsed = ipaddr.parse(ip);
	const ipKind = ipParsed.kind();
	let resp = `ip: ${ip}\n`;
	resp += `ip_version: ${ipKind}\n`;

	if (ipKind === "ipv6" && (ipParsed as IPv6).isIPv4MappedAddress()) {
		const embeddedIPv4 = (ipParsed as IPv6).toIPv4Address();
		resp += `ipv6_mapped_ipv4: ${embeddedIPv4}\n`;
	}

	const ipData = getIpData(ip);
	if (ipData.city || ipData.asn) {
		resp += `\n# This product includes GeoLite2 Data created by MaxMind, available from https://www.maxmind.com.\n`;
	}
	if (ipData.city) {
		if (ipData.city.city?.names?.en) {
			resp += `city: ${ipData.city.city.names.en}\n`;
		}
		if (ipData.city.country?.names?.en) {
			resp += `country: ${ipData.city.country.names.en}\n`;
		}
		if (ipData.city.location) {
			resp += `location: ${ipData.city.location.latitude}, ${ipData.city.location.longitude}\n`;
		}
		if (ipData.city.postal?.code) {
			resp += `postal: ${ipData.city.postal.code}\n`;
		}
	}
	if (ipData.asn) {
		if (ipData.asn.autonomousSystemNumber) {
			resp += `asn: ${ipData.asn.autonomousSystemNumber}\n`;
		}
		if (ipData.asn.autonomousSystemOrganization) {
			resp += `asn_org: ${ipData.asn.autonomousSystemOrganization}\n`;
		}
	}

	res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
	res.write(resp);
	res.end();
});

function getIpData(ip: string) {
	let city = null;
	try {
		city = geoIpReader.city(ip);
	} catch {}

	let asn = null;
	try {
		asn = asnIpReader.asn(ip);
	} catch {}

	return {
		city,
		asn,
	};
}

server.listen(PORT, () => {
	console.log(`Server listening on: http://localhost:${PORT}`);
});
