import assert from "node:assert";
import { test } from "node:test";

const BASE_URL = "http://localhost:3000";

test("responds with 200", async () => {
	const res = await fetch(BASE_URL);

	assert.strictEqual(res.status, 200);
});

test("response snapshot", async (t) => {
	const text = await fetch(BASE_URL).then((r) => r.text());
	t.assert.snapshot(text);
});

test("returns 405 for POST requests", async () => {
	const res = await fetch(BASE_URL, {
		method: "POST",
	});

	assert.strictEqual(res.status, 405);
	const body = await res.text();
	assert.strictEqual(body, "method not allowed");
});

test("returns 405 for PUT requests", async () => {
	const res = await fetch(BASE_URL, {
		method: "PUT",
	});

	assert.strictEqual(res.status, 405);
	const body = await res.text();
	assert.strictEqual(body, "method not allowed");
});

test("returns 405 for DELETE requests", async () => {
	const res = await fetch(BASE_URL, {
		method: "DELETE",
	});

	assert.strictEqual(res.status, 405);
	const body = await res.text();
	assert.strictEqual(body, "method not allowed");
});
