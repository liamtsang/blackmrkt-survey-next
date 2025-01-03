"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useAnimate } from "motion/react";

import {
	SizeQuestion,
	SingleChoiceQuestion,
	ImageMultipleChoiceQuestion,
	ColorMultipleChoiceQuestion,
	TextMultipleChoiceQuestion,
	EmailQuestion,
	NumberQuestion,
	HeightQuestion,
} from "./questions";

import { questions } from "./questions_json";
import type { ResponseTypes } from "@/utils/types";
import ScrambleText from "./ScrambleText";

export default function Survey() {
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [responses, setResponses] = useState<Record<string, ResponseType>>({});
	const [isScrambling, setIsScrambling] = useState(false);
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
			setIsScrambling(true);
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
				setIsScrambling(true);
				setTimeout(() => {
					setIsScrambling(false);
				}, 300);
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
			case "height": {
				const numberValue = value as ResponseTypes["number"];
				return (
					<HeightQuestion
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
			case "text_multiple_choice": {
				const multiValue =
					(value as unknown as ResponseTypes["multiple_choice"]) || [];
				return (
					<TextMultipleChoiceQuestion
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
					<h1 className="absolute top-10 left-6 md:left-24 max-w-[90vw] lg:max-w-7xl font-archivo text-4xl md:text-6xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-[var(--bm-white)]">
						<ScrambleText isAnimating={isScrambling}>
							{questions[currentQuestion].text}
						</ScrambleText>
					</h1>
				</motion.header>
				<motion.footer
					initial={{ height: "14.285vh" }}
					className="overlay-drop-shadow fixed bottom-0 w-full bg-[var(--bm-black)] z-20 border-t-[1px] border-[var(--bm-white)]"
				/>
			</section>
			<section className="w-screen h-screen grid grid-rows-[2fr_4fr_1fr] font-geist font-extralight px-4 lg:pl-24">
				<div />
				{renderQuestion()}
				<div />
			</section>
		</main>
	);
}
