type IconImages = {
	"Kanye West": string;
	"Tyler the Creator": string;
	"Ronnie Fieg": string;
	"Playboi Carti": string;
	"Justin Bieber": string;
	"Virgil Abloh": string;
	Nike: string;
	Adidas: string;
	Supreme: string;
	"Off-White": string;
	"Fear of God": string;
	Essentials: string;
};

type BrandImages = Record<
	"Nike" | "Adidas" | "Supreme" | "Off-White" | "Fear of God" | "Essentials",
	string
>;

type ColorCodes = {
	Black: string;
	White: string;
	Gray: string;
	Brown: string;
	Beige: string;
	Pinks: string;
	Green: string;
	Red: string;
	Olive: string;
	Yellow: string;
};

type QuestionImages = IconImages | BrandImages;

// Update Question and MultipleChoiceQuestion types
export type Question = {
	id: string;
	text: string;
	type: keyof ResponseTypes;
	options?: string[];
	note?: string;
	placeholder?: string;
	validation?: {
		min: number;
		max: number;
	};
	unit?: string;
	images?: QuestionImages;
	colorCodes?: ColorCodes;
	subQuestions?: SubQuestion[];
};

export type SubQuestion = {
	id: string;
	text: string;
	type: "single_choice";
	options: string[];
};

export interface SizeQuestionType extends Question {
	type: "size_group";
	subQuestions: Array<{
		id: string;
		text: string;
		type: "single_choice";
		options: string[];
	}>;
}

export type EmailQuestionProps = {
	value: string;
	onChange: (value: string) => void;
	onNext: () => void;
};

export type NumberQuestionProps = {
	value: string;
	onChange: (value: string) => void;
	onNext: () => void;
	validation?: {
		min: number;
		max: number;
	};
	placeholder?: string;
	unit?: string;
};

export type SingleChoiceQuestionProps = {
	options: string[];
	value: string;
	onChange: (value: string) => void;
	onNext: () => void;
};

export type MultipleChoiceQuestionProps<T extends string> = {
	options: T[];
	value: T[];
	onChange: (value: T[]) => void;
	onNext: () => void;
	images?: { [K in T]?: string };
	colorCodes?: { [K in T]?: string };
};

export type SizeQuestionProps = {
	value: Record<string, string>;
	onChange: (value: Record<string, string>) => void;
	onNext: () => void;
	subQuestions: SubQuestion[];
};

export type TypewriterProps = {
	question: string;
};

export type SurveyResponses = Record<
	string,
	string | string[] | Record<string, string>
>;

export type QuestionResponse = {
	email: string;
	number: string;
	single_choice: string;
	multiple_choice: string[];
	size_group: Record<string, string>;
};

export type ResponseTypes = {
	email: string;
	number: string;
	single_choice: string;
	multiple_choice: string[];
	size_group: Record<string, string>;
};

export type ResponseType = ResponseTypes[keyof ResponseTypes];
