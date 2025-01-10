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
		<div>
			{results.map((row) => (
				<GridRow key="row" row={row as unknown as surveyResults} />
			))}
		</div>
	);
}

function GridRow({ row }: { row: surveyResults }) {
	return (
		<div>
			<div>{row.id}</div>
			<div>{row.email}</div>
			<div>{row.survey_answers}</div>
			<div>{row.timestamp}</div>
		</div>
	);
}
