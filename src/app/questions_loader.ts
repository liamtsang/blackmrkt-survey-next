// questions_loader.ts
import { questions } from "./questions_json";
import type { Question, SubQuestion } from "@/utils/types";

function isString(value: unknown): value is string {
	return typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
	return Array.isArray(value) && value.every(isString);
}

function hasStringProperty(
	value: Record<string, unknown>,
	prop: string,
): value is Record<string, unknown> & Record<typeof prop, string> {
	return isString(value[prop]);
}

function isSingleChoiceType(
	value: Record<string, unknown>,
): value is Record<string, unknown> & { type: "single_choice" } {
	return value.type === "single_choice";
}

function isSubQuestion(value: unknown): value is SubQuestion {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const record = value as Record<string, unknown>;

	return (
		hasStringProperty(record, "id") &&
		hasStringProperty(record, "text") &&
		isSingleChoiceType(record) &&
		isStringArray(record.options)
	);
}

function isSizeGroupSubQuestions(value: unknown): value is SubQuestion[] {
	return Array.isArray(value) && value.every(isSubQuestion);
}

function validateQuestions(): Question[] {
	return questions.map((question) => {
		if (question.type === "size_group") {
			if (!isSizeGroupSubQuestions(question.subQuestions)) {
				throw new Error(`Invalid subquestions in question ${question.id}`);
			}
		}

		return question as Question;
	});
}

export const validatedQuestions = validateQuestions();
