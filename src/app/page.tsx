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
import ScrambleText from "./ScrambleText";
import { questions } from "./questions_json";
import { addToDB } from "./actions";

import type { ResponseTypes, SizeQuestionType } from "@/utils/types";

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
		console.log(typeof responses);
		addToDB(responses);
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

	const animateTransition = () => {
		animate([
			["header", { height: "57.1428dvh" }, { ease: "easeIn" }],
			["header", { height: "28.571dvh" }, { at: 1 }],
		]);

		animate([
			["h1", { opacity: 0 }, { ease: "easeOut" }],
			["h1", { opacity: 1 }, { at: 0.75, ease: "easeInOut" }],
		]);
		setTimeout(() => {
			document.documentElement.style.setProperty(
				"--border-color",
				"var(--scan-gradient)",
			);
		}, 250);
		setTimeout(() => {
			document.documentElement.style.setProperty(
				"--border-color",
				"var(--bm-black)",
			);
		}, 1000);

		animate([
			[
				"#header-bg",
				{ y: "-60%" },
				{ at: 0.25, duration: 1, ease: "easeInOut" },
			],
			["#header-bg", { y: "70%" }, { at: 1.5, duration: 0.00001 }],
		]);
		animate([
			[
				"#footer-bg",
				{ y: "60%" },
				{ at: 0.25, duration: 1, ease: "easeInOut" },
			],
			["#footer-bg", { y: "-70%" }, { at: 1.5, duration: 0.00001 }],
		]);
		animate([
			["footer", { height: "42.85714dvh" }, { ease: "easeIn" }],
			["footer", { height: "14.285dvh" }, { at: 1 }],
		]);
		setTimeout(() => {
			setIsScrambling(true);
		}, 4000);
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
			animateTransition();

			const nextQuestion = currentQuestion + 1;
			setTimeout(() => {
				setCurrentQuestion(nextQuestion);
			}, 750);

			updateURL(nextQuestion);
		} else {
			handleSubmit();
		}
	};

	const handleBack = () => {
		if (currentQuestion !== 0) {
			animateTransition();

			const nextQuestion = currentQuestion - 1;
			setTimeout(() => {
				setCurrentQuestion(nextQuestion);
			}, 750);

			updateURL(nextQuestion);
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
					initial={{
						height: "28.571dvh",
					}}
					className="bg-[var(--bm-black)]  fixed top-0 w-full overlay-drop-shadow z-20"
				>
					<div className="overflow-hidden h-full">
						<motion.div
							id="header-bg"
							className="h-dvh"
							initial={{
								height: "57.1428vh",
								background: "var(--scan-gradient)",
								y: "50%",
							}}
						/>
					</div>
					<motion.h1
						initial={{ opacity: 1 }}
						className="absolute top-[50%] translate-y-[-50%] left-6 md:left-24 max-w-[90vw] lg:max-w-7xl font-archivo text-4xl md:text-6xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-[var(--bm-white)]"
					>
						<ScrambleText isAnimating={isScrambling}>
							{questions[currentQuestion].text}
						</ScrambleText>
					</motion.h1>
				</motion.header>
				<motion.footer
					initial={{ height: "14.285dvh" }}
					className="overflow-hidden overlay-drop-shadow fixed bottom-0 w-full bg-[var(--bm-black)] z-20 "
				>
					<motion.div
						id="footer-bg"
						className="h-full"
						initial={{
							height: "57.1428vh",
							background: "var(--scan-gradient)",
							y: "-100%",
						}}
					/>
					<button
						className="absolute top-1/2 translate-y-[-50%] left-6 md:left-24 text-4xl cursor-pointer"
						type="button"
						onClick={handleBack}
					>
						<svg
							className="w-14"
							width="138"
							height="94"
							viewBox="0 0 138 94"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>Go back</title>
							<path
								d="M62.5 94V82H100.5C108.833 81.6667 125.5 76.2 125.5 57C125.5 37.8 108.833 32.6667 100.5 32.5H27L43 44.5L34.5 52.5L0.5 26L35 0L43 9L27 20.5H100.5C112.833 20.8333 137.5 28.6 137.5 57C137.5 85.4 112.833 93.5 100.5 94H62.5Z"
								fill="var(--bm-white)"
							/>
						</svg>
					</button>
				</motion.footer>
			</section>
			<section className="w-screen h-dvh grid grid-rows-[2fr_4fr_1fr] font-geist font-extralight px-4 lg:pl-24">
				<div />
				{renderQuestion()}
				<div />
			</section>
		</main>
	);
}
