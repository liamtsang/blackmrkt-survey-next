import { selectUUIDFromDB } from "@/app/actions";

type surveyResults = {
	id: string;
	email: string;
	survey_answers: string;
	timestamp: string;
};

export default async function Page({
	params,
}: {
	params: Promise<{ uuid: string }>;
}) {
	const uuid = (await params).uuid;
	const response = await selectUUIDFromDB(uuid);
	const results = response.results as unknown[] as surveyResults[];
	const answers = JSON.parse(results[0].survey_answers);

	return (
		<div className="flex flex-col items-center justify-center w-full h-full">
			<a className="text-sky-400 mb-12" href="/admin">
				🡨 Back to Admin
			</a>
			<main className="flex flex-col gap-4 text-xl font-normal leading-tight">
				<section>
					<Label>INFO</Label>
					<Text>{answers.q2}</Text>
					<Text>
						{answers.q6} | {answers.q7}
					</Text>
					<Text>
						${answers.q14}/m | {answers.q15}
					</Text>
				</section>
				<section>
					<Label>SIZING</Label>
					<LabeledText label="Shirt" text={answers.q8.q8a} />
					<LabeledText
						label="Pants"
						text={`${answers.q8.q8b}x${answers.q8.q8c} | ${answers.q9}`}
					/>
					<LabeledText label="Shoes" text={answers.q8.q8d} />
				</section>
				<section>
					<Label>PREFERENCES</Label>
					<AvoidText>{CommasFromArray(answers.q10)}</AvoidText>
					<AvoidText>{CommasFromArray(answers.q12)}</AvoidText>
					<LabeledText label="Vintage" text={answers.q13} />
					<LabeledText label="Designs" text={answers.q11} />
				</section>
				<section>
					<Label>SURVEY</Label>
					<Question>What is the main reason you came to BLACKMRKT?</Question>
					<Answer>{answers.q1}</Answer>
					<Question>How would you describe your style?</Question>
					<Answer>{answers.q3}</Answer>
					<Question>Which Fashion Icons share your sense of style?</Question>
					<Answer>{CommasFromArray(answers.q4)}</Answer>
					<Question>Which brands do you like?</Question>
					<Answer>{CommasFromArray(answers.q5)}</Answer>
				</section>
			</main>
		</div>
	);
}

function CommasFromArray(arr: string[]) {
	return (
		<span>
			{arr.map((item, index) => (
				<span key={item}>
					{item}
					{index !== arr.length - 1 ? ", " : ""}
				</span>
			))}
		</span>
	);
}

function Label({ children }: { children: React.ReactNode }) {
	return <h4 className="text-sm font-semibold opacity-[0.75]">{children}</h4>;
}

function Text({ children }: { children: React.ReactNode }) {
	return <h4>{children}</h4>;
}

function LabeledText({ label, text }: { label: string; text: string }) {
	return (
		<p>
			<span className="font-semibold">{label}: </span>
			{text}
		</p>
	);
}

function AvoidText({ children }: { children: React.ReactNode }) {
	return (
		<p>
			<span className="font-semibold">Avoid: </span>
			{children}
		</p>
	);
}

function Question({ children }: { children: React.ReactNode }) {
	return (
		<p>
			<span className="font-semibold">Q: </span>
			{children}
		</p>
	);
}

function Answer({ children }: { children: React.ReactNode }) {
	return (
		<p className="pb-4">
			<span className="font-semibold">A: </span>
			{children}
		</p>
	);
}
