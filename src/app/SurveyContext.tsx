"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
} from "react";
import { validatedQuestions } from "./questions_loader";
import type { ResponseTypes } from "@/utils/types";

const questions = validatedQuestions;

type NavigationDirection = "forward" | "backward" | null;

type QuestionTypeToResponse<T extends keyof ResponseTypes> = {
	questionId: string;
	type: T;
	value: ResponseTypes[T];
};

interface SurveyContextType {
	currentQuestion: number;
	responses: Record<string, ResponseType>;
	setResponse: (questionId: string, value: ResponseType) => void;
	nextQuestion: () => void;
	previousQuestion: () => void;
	isLastQuestion: boolean;
	currentQuestionData: (typeof questions)[0];
	direction: NavigationDirection;
	canGoBack: boolean;
}

const SurveyContext = createContext<SurveyContextType | null>(null);

export function SurveyProvider({ children }: { children: React.ReactNode }) {
	const getStoredValue = <T,>(key: string, defaultValue: T): T => {
		if (typeof window === "undefined") return defaultValue;
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : defaultValue;
		} catch (error) {
			console.error("Error reading from localStorage:", error);
			return defaultValue;
		}
	};

	// Initialize state from localStorage and URL
	const [currentQuestion, setCurrentQuestion] = useState(() => {
		if (typeof window === "undefined") return 0;

		// Check URL first
		const params = new URLSearchParams(window.location.search);
		const urlQuestion = params.get("q");
		if (urlQuestion !== null) {
			const questionIndex = Math.min(
				Number.parseInt(urlQuestion),
				questions.length - 1,
			);
			return Number.isNaN(questionIndex) ? 0 : questionIndex;
		}

		// Fall back to localStorage
		return getStoredValue("blackmrkt-survey-current", 0);
	});

	const [responses, setResponses] = useState(() =>
		getStoredValue<Record<string, ResponseType>>(
			"blackmrkt-survey-responses",
			{},
		),
	);
	const [direction, setDirection] = useState<NavigationDirection>(null);

	const nextQuestion = useCallback(() => {
		if (currentQuestion < questions.length - 1) {
			setDirection("forward");
			setCurrentQuestion((prev) => prev + 1);
		}
	}, [currentQuestion]);

	const previousQuestion = useCallback(() => {
		if (currentQuestion > 0) {
			setDirection("backward");
			setCurrentQuestion((prev) => prev - 1);

			// Update URL without using history.back()
			const url = new URL(window.location.href);
			url.searchParams.set("q", (currentQuestion - 1).toString());
			window.history.pushState(
				{ question: currentQuestion - 1 },
				"",
				url.toString(),
			);
		}
	}, [currentQuestion]);

	useEffect(() => {
		const timer = setTimeout(() => setDirection(null), 500);
		return () => clearTimeout(timer);
	}, [direction]);

	const setResponse = useCallback((questionId: string, value: ResponseType) => {
		setResponses((prev) => ({
			...prev,
			[questionId]: value,
		}));
	}, []);

	const value = {
		currentQuestion,
		responses,
		setResponse,
		nextQuestion,
		previousQuestion,
		isLastQuestion: currentQuestion === questions.length - 1,
		currentQuestionData: questions[currentQuestion],
		direction,
		canGoBack: currentQuestion > 0,
	};

	return (
		<SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>
	);
}

export function useSurvey() {
	const context = useContext(SurveyContext);
	if (!context) {
		throw new Error("useSurvey must be used within a SurveyProvider");
	}
	return context;
}

export function useSurveyPersistence() {
	const { currentQuestion, responses } = useSurvey();

	useEffect(() => {
		localStorage.setItem(
			"blackmrkt-survey-responses",
			JSON.stringify(responses),
		);
		localStorage.setItem(
			"blackmrkt-survey-current",
			currentQuestion.toString(),
		);

		const url = new URL(window.location.href);
		url.searchParams.set("q", currentQuestion.toString());
		window.history.pushState({ question: currentQuestion }, "", url.toString());
	}, [responses, currentQuestion]);
}
