"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useAnimate } from "motion/react";

import {
	SizeQuestion,
	SingleChoiceQuestion,
	ImageMultipleChoiceQuestion,
	ColorMultipleChoiceQuestion,
	EmailQuestion,
	NumberQuestion,
} from "./questions";

import { questions } from "./questions_json";

export default function Survey() {
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [responses, setResponses] = useState<Record<string, ResponseType>>({});
	const [scope, animate] = useAnimate();

	useEffect(() => {
		const savedResponses = localStorage.getItem("blackmrkt-survey-responses");
		if (savedResponses) {
			setResponses(JSON.parse(savedResponses));
		}

		const params = new URLSearchParams(window.location.search);
		const urlQuestion = params.get("q");

		if (urlQuestion !== null) {
			setCurrentQuestion(
				Math.min(Number.parseInt(urlQuestion), questions.length - 1),
			);
		} else {
			const savedQuestion = localStorage.getItem("blackmrkt-survey-current");
			if (savedQuestion) {
				const questionIndex = Math.min(
					Number.parseInt(savedQuestion),
					questions.length - 1,
				);
				setCurrentQuestion(questionIndex);
				updateURL(questionIndex);
			}
		}
	}, []);

	useEffect(() => {
		localStorage.setItem(
			"blackmrkt-survey-responses",
			JSON.stringify(responses),
		);
		localStorage.setItem(
			"blackmrkt-survey-current",
			currentQuestion.toString(),
		);
	}, [responses, currentQuestion, animate]);

	useEffect(() => {
		const handlePopState = () => {
			const params = new URLSearchParams(window.location.search);
			setCurrentQuestion(
				Math.min(Number.parseInt(params.get("q") || "0"), questions.length - 1),
			);
		};

		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, []);

	const updateURL = (questionIndex: number) => {
		const url = new URL(window.location.href);
		url.searchParams.set("q", questionIndex.toString());
		window.history.pushState({ question: questionIndex }, "", url.toString());
	};

	const handleResponse = (value: ResponseType) => {
		const currentQuestionId = questions[currentQuestion].id;
		setResponses((prev) => ({
			...prev,
			[currentQuestionId]: value,
		}));

		if (currentQuestion < questions.length - 1) {
			const nextQuestion = currentQuestion + 1;
			setCurrentQuestion(nextQuestion);
			updateURL(nextQuestion);
		} else {
			handleSubmit();
		}
	};

	const handleSubmit = () => {
		console.log("Final responses:", responses);
		if (confirm("Submit survey?")) {
			localStorage.removeItem("blackmrkt-survey-responses");
			localStorage.removeItem("blackmrkt-survey-current");
			alert("Thank you for completing the survey!");
		}
	};

	const validateResponse = (value: unknown, questionType: string): boolean => {
		if (questionType === "single_choice") return true;

		if (value === undefined || value === "") return false;

		switch (questionType) {
			case "multiple_choice":
				return Array.isArray(value) && value.length > 0;
			case "email":
				return typeof value === "string" && value.includes("@");
			case "number":
				return typeof value === "string" && !Number.isNaN(Number(value));
			case "size_group":
				return (
					value !== null &&
					typeof value === "object" &&
					Object.keys(value as object).length > 0
				);
			default:
				return true;
		}
	};

	const handleNext = () => {
		const currentQuestionId = questions[currentQuestion].id;
		const currentValue = responses[currentQuestionId];
		const currentQuestionType = questions[currentQuestion].type;
		if (currentQuestionType !== "single_choice") {
			if (!validateResponse(currentValue, currentQuestionType)) {
				alert("Please provide a response before continuing");
				return;
			}
		}

		if (currentQuestion < questions.length - 1) {
			animate([
				["header", { height: "57.1428vh" }],
				["header", { height: "28.571vh" }, { at: 1 }],
			]);

			animate([
				["footer", { height: "42.85714vh" }],
				["footer", { height: "14.285vh" }, { at: 1 }],
			]);

			const nextQuestion = currentQuestion + 1;
			setTimeout(() => {
				setCurrentQuestion(nextQuestion);
			}, 1000);

			updateURL(nextQuestion);
		} else {
			handleSubmit();
		}
	};

	const renderQuestion = () => {
		const question = questions[currentQuestion];
		const value = responses[question.id];

		switch (question.type) {
			case "email": {
				const emailValue = value as ResponseTypes["email"];
				return (
					<EmailQuestion
						value={emailValue}
						onChange={(newValue) =>
							setResponses((prev) => ({
								...prev,
								[question.id]: newValue as ResponseType,
							}))
						}
						onNext={handleNext}
					/>
				);
			}
			case "number": {
				const numberValue = value as ResponseTypes["number"];
				return (
					<NumberQuestion
						value={numberValue}
						onChange={(newValue) =>
							setResponses((prev) => ({
								...prev,
								[question.id]: newValue as ResponseType,
							}))
						}
						onNext={handleNext}
						placeholder={question.placeholder}
						validation={question.validation}
						unit={question.unit}
					/>
				);
			}
			case "image_multiple_choice": {
				const multiValue =
					(value as unknown as ResponseTypes["multiple_choice"]) || [];
				return (
					<ImageMultipleChoiceQuestion
						options={question.options ?? []}
						value={multiValue}
						onChange={(newValue) =>
							setResponses((prev) => ({
								...prev,
								[question.id]: newValue as unknown as ResponseType,
							}))
						}
						onNext={handleNext}
						images={question.images}
						colorCodes={question.colorCodes}
					/>
				);
			}
			case "color_multiple_choice": {
				const multiValue =
					(value as unknown as ResponseTypes["multiple_choice"]) || [];
				return (
					<ColorMultipleChoiceQuestion
						options={question.options ?? []}
						value={multiValue}
						onChange={(newValue) =>
							setResponses((prev) => ({
								...prev,
								[question.id]: newValue as unknown as ResponseType,
							}))
						}
						onNext={handleNext}
						images={question.images}
						colorCodes={question.colorCodes}
					/>
				);
			}
			case "size_group": {
				const sizeValue =
					(value as unknown as ResponseTypes["size_group"]) || {};
				const sizeQuestion = question as SizeQuestionType;
				return (
					<SizeQuestion
						value={sizeValue}
						onChange={(newValue) =>
							setResponses((prev) => ({
								...prev,
								[question.id]: newValue as unknown as ResponseType,
							}))
						}
						onNext={handleNext}
						subQuestions={sizeQuestion.subQuestions}
					/>
				);
			}
			case "single_choice": {
				const choiceValue = value as ResponseTypes["single_choice"];
				return (
					<SingleChoiceQuestion
						options={question.options ?? []}
						value={choiceValue}
						onChange={(newValue) =>
							setResponses((prev) => ({
								...prev,
								[question.id]: newValue as ResponseType,
							}))
						}
						onNext={handleNext}
					/>
				);
			}
			default:
				return <div>Question type not supported</div>;
		}
	};
	const currentQuestionData = questions[currentQuestion];

	return (
		<main>
			<section ref={scope} className="">
				<motion.header
					initial={{ height: "28.571vh" }}
					className="fixed top-0 w-full overlay-drop-shadow bg-[var(--bm-black)] z-20 border-b-[1px] border-[var(--bm-white)]"
				>
					<h1 className="absolute top-10 left-24 max-w-7xl font-archivo md:text-6xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-[var(--bm-white)]">
						<Typewrite question={questions[currentQuestion].text} />
					</h1>
				</motion.header>
				<motion.footer
					initial={{ height: "14.285vh" }}
					className="overlay-drop-shadow fixed bottom-0 w-full bg-[var(--bm-black)] z-20 border-t-[1px] border-[var(--bm-white)]"
				/>
			</section>
			<section className="w-screen h-screen grid grid-rows-[2fr_4fr_1fr] font-geist font-extralight pl-24">
				<div />
				{renderQuestion()}
				<div />
			</section>
		</main>
	);
}

const LETTER_DELAY = 0.0195;
const BOX_FADE_DURATION = 0.05;
const FADE_DELAY = 5;
const MAIN_FADE_DURATION = 0.25;
const SWAP_DELAY_IN_MS = 5500;

const Typewrite = ({ question }: TypewriterProps) => {
	// Use a local state to trigger re-animation
	const [key, setKey] = useState(0);

	// Memoize the letters array to prevent unnecessary re-renders
	const letters = useMemo(() => question.split(""), [question]);

	// Reset animation when question changes
	useEffect(() => {
		setKey((prevKey) => prevKey + 1);
	}, [question]);

	return (
		<p className="">
			<span className="">
				{letters.map((letter, index) => (
					<motion.span
						initial={{ opacity: 1 }}
						transition={{
							delay: FADE_DELAY,
							duration: MAIN_FADE_DURATION,
							ease: "easeInOut",
						}}
						key={`${key}-${index}`}
						className="relative"
					>
						<motion.span
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{
								delay: index * LETTER_DELAY,
								duration: 0,
							}}
						>
							{letter}
						</motion.span>

						<motion.span
							initial={{ opacity: 0 }}
							animate={{ opacity: [0, 1, 0] }}
							transition={{
								delay: index * LETTER_DELAY,
								times: [0, 0.1, 1],
								duration: BOX_FADE_DURATION,
								ease: "easeInOut",
							}}
							className="absolute bottom-[3px] left-[1px] right-0 top-[3px] bg-[var(--bm-white)]"
						/>
					</motion.span>
				))}
			</span>
		</p>
	);
};
