"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ResponseType } from "@/utils/types";

export async function buildDB() {
	const myDB = (await getCloudflareContext()).env.DB;
	return myDB;
}

export async function addToDB(survey: Record<string, ResponseType>) {
	const db = await buildDB();
	const uuid = crypto.randomUUID();
	const email = survey.q2;
	const timestamp = new Date().toISOString();

	const stmt = db.prepare(`INSERT INTO survey_results VALUES (?, ?, ?, ?)`);

	const result = await stmt
		.bind(uuid, email, JSON.stringify(survey), timestamp)
		.run();

	console.log(result);
}

export async function selectTopFromDB(x: number) {
	const db = await buildDB();
	const stmt = db.prepare(
		`SELECT * FROM survey_results ORDER BY timestamp DESC LIMIT ?`,
	);

	const result = await stmt.bind(x).run();

	console.log(result);
	return result;
}

export async function selectUUIDFromDB(uuid: string) {
	const db = await buildDB();
	const stmt = db.prepare(`SELECT * FROM survey_results WHERE id = ?`);

	const result = await stmt.bind(uuid).run();

	console.log(result);
	return result;
}
