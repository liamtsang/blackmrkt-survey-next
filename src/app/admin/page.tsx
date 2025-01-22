export const dynamic = "force-dynamic";

import { selectTopFromDB } from "../actions";

type surveyResults = {
	id: string;
	email: string;
	survey_answers: string;
	timestamp: string;
};

export default async function Page() {
	const firstRows = await selectTopFromDB(100);
	return <AdminGrid results={firstRows.results as unknown[]} />;
}

function AdminGrid({ results }: { results: unknown[] }) {
	return (
		<main className="grid grid-cols-1">
			<div className="grid grid-cols-[1fr_1fr_2fr_2fr]">
				<div className="p-1 bg-[var(--bm-white)] text-[var(--bm-black)] border border-[var(--bm-white)]">
					Email
				</div>
				<div className="p-1 bg-[var(--bm-white)] text-[var(--bm-black)] border border-[var(--bm-white)]">
					Answers
				</div>
				<div className="p-1 bg-[var(--bm-white)] text-[var(--bm-black)] border border-[var(--bm-white)]">
					ID
				</div>
				<div className="p-1 bg-[var(--bm-white)] text-[var(--bm-black)] border border-[var(--bm-white)]">
					Timestamp
				</div>
			</div>
			{results.map((row) => (
				<GridRow key="row" row={row as unknown as surveyResults} />
			))}
		</main>
	);
}

function GridRow({ row }: { row: surveyResults }) {
	return (
		<div className="grid grid-cols-[1fr_1fr_2fr_2fr]">
			<div className="p-1 border border-[var(--bm-white)]">{row.email}</div>
			<div className="p-1 border border-[var(--bm-white)]">
				<a className="text-sky-400" href={`/admin/${row.id}`}>
					View Answers
				</a>
			</div>
			<div className="p-1 border border-[var(--bm-white)]">{row.id}</div>
			<div className="p-1 border border-[var(--bm-white)]">{row.timestamp}</div>
		</div>
	);
}
