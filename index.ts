import {
	createServer,
	type IncomingMessage,
	type ServerResponse,
} from "node:http";
import ipaddr, { type IPv6 } from "ipaddr.js";
import maxmind, { type AsnResponse, type CityResponse } from "maxmind";

const cityReader = await maxmind.open<CityResponse>(
	"./data/GeoLite2-City.mmdb",
	{
		watchForUpdates: true,
		watchForUpdatesNonPersistent: true,
		watchForUpdatesHook() {
			console.info("Updated GeoLite2-City.mmdb");
		},
	},
);

const asnReader = await maxmind.open<AsnResponse>("./data/GeoLite2-ASN.mmdb", {
	watchForUpdates: true,
	watchForUpdatesNonPersistent: true,
	watchForUpdatesHook() {
		console.info("Updated GeoLite2-ASN.mmdb");
	},
});

const PORT = process.env.PORT ?? 3000;
const server = createServer((req: IncomingMessage, res: ServerResponse) => {
	if (req.method !== "GET") {
		res.writeHead(405);
		res.end("method not allowed");
		return;
	}

	const ip = getIp(req.headers, req.socket);
	console.log("ip result", ip);
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
		resp += `\n# This product includes GeoLite2 Data created by MaxMind,\n# available from https://www.maxmind.com.\n`;
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
		if (ipData.asn.autonomous_system_number) {
			resp += `asn: ${ipData.asn.autonomous_system_number}\n`;
		}
		if (ipData.asn.autonomous_system_organization) {
			resp += `asn_org: ${ipData.asn.autonomous_system_organization}\n`;
		}
	}

	res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
	res.write(resp);
	res.end();
});

function getIp(
	headers: IncomingMessage["headers"],
	socket: IncomingMessage["socket"],
): string {
	const ipSource = (process.env.IP_SOURCE ?? "socket").toLowerCase();
	console.log(ipSource, headers);
	const socketIp = socket.remoteAddress as string;

	switch (ipSource) {
		case "cloudflare":
			return (headers["cf-connecting-ip"] as string) ?? socketIp;
		case "forwarded_for":
			return (headers["x-forwarded-for"] as string) ?? socketIp;
		case "real_ip":
			return (headers["x-real-ip"] as string) ?? socketIp;
		default:
			return socketIp;
	}
}

function getIpData(ip: string) {
	let city = null;
	try {
		city = cityReader.get(ip);
	} catch {}

	let asn = null;
	try {
		asn = asnReader.get(ip);
	} catch {}

	return {
		city,
		asn,
	};
}

server.listen(PORT, () => {
	console.log(`Server listening on: http://localhost:${PORT}`);
});
