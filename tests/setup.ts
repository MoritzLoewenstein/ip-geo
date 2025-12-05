import { spawn } from "node:child_process";

interface NodeError extends Error {
	code?: string;
}

let controller: AbortController;
export async function globalSetup() {
	const { promise, resolve } = Promise.withResolvers();
	controller = new AbortController();
	const server = spawn("node", ["index.ts"], {
		signal: controller.signal,
	});
	server.stdout.on("data", (data) => {
		console.log(data.toString("utf8"));
		if (data.toString("utf8").startsWith("Server listening on:")) {
			resolve(null);
		}
	});
	server.stderr.on("data", (data) => {
		console.error(data.toString("utf8"));
	});
	server.on("error", (err: NodeError) => {
		if (err.code === "ABORT_ERR") {
			// normal teardown
			return;
		}
		console.error(err);
	});
	return promise;
}

export function globalTeardown() {
	if (controller !== null) {
		controller.abort();
	}
}
