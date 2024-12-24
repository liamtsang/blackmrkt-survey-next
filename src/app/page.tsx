"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useAnimate } from "motion/react";
import type {
	EmailQuestionProps,
	MultipleChoiceQuestionProps,
	NumberQuestionProps,
	SingleChoiceQuestionProps,
	SizeQuestionProps,
	TypewriterProps,
	QuestionResponse,
	ResponseTypes,
	SizeQuestionType,
} from "../utils/types";

const questions = [
	{
		id: "q1",
		text: "What is the main reason you came to BLACKMRKT?",
		type: "single_choice",
		options: [
			"I'm too busy to shop",
			"I want to find new brands and styles",
			"Shopping for someone",
			"I always had a passion for fashion",
			"I deserve a personal stylist",
		],
	},
	{
		id: "q2",
		text: "Before we begin what's your email",
		type: "email",
		note: "Include Google sign up button",
		placeholder: "Enter your email address",
	},
	{
		id: "q3",
		text: "How would you describe your style?",
		type: "single_choice",
		options: [
			"So fresh and so Clean, Classic & minimal",
			"Streetwear ( I belong to the streets)",
			"Vintage, alternative, contemporary",
			"Rockstar lifestyle",
		],
	},
	{
		id: "q4",
		text: "Which Fashion Icons share your sense of style?",
		type: "image_multiple_choice",
		note: "Consider using photos",
		options: [
			"Kanye West",
			"Tyler the Creator",
			"Ronnie Fieg",
			"Playboi Carti",
			"Justin Bieber",
			"Virgil Abloh",
		],
		images: {
			"Kanye West": "/images/Kanye_West.webp",
			"Tyler the Creator": "/images/Kanye_West.webp",
			"Ronnie Fieg": "/images/Kanye_West.webp",
			"Playboi Carti": "/images/Kanye_West.webp",
			"Justin Bieber": "/images/Kanye_West.webp",
			"Virgil Abloh": "/images/Kanye_West.webp",
		},
	},
	{
		id: "q5",
		text: "Which brands do you like?",
		type: "image_multiple_choice",
		note: "Insert logos from BLACKMRKT page",
		options: [
			"Nike",
			"Adidas",
			"Supreme",
			"Off-White",
			"Fear of God",
			"Essentials",
		],
		images: {
			Nike: "/images/nike-logo.png",
			Adidas: "/images/adidas-logo.png",
			Supreme: "/images/supreme-logo.png",
			"Off-White": "/images/offwhite-logo.png",
			"Fear of God": "/images/fog-logo.png",
			Essentials: "/images/essentials-logo.png",
		},
	},
	{
		id: "q6",
		text: "How tall are you?",
		type: "number",
		unit: "cm",
		placeholder: "Enter your height in cm",
		validation: {
			min: 100,
			max: 250,
		},
	},
	{
		id: "q7",
		text: "What's your weight?",
		type: "number",
		unit: "kg",
		placeholder: "Enter your weight in kg",
		validation: {
			min: 30,
			max: 200,
		},
	},
	{
		id: "q8",
		text: "What size do you typically wear?",
		type: "size_group",
		subQuestions: [
			{
				id: "q8a",
				text: "Shirt",
				type: "single_choice",
				options: ["XS", "S", "M", "L", "XL", "XXL"],
			},
			{
				id: "q8b",
				text: "Waist",
				type: "single_choice",
				options: ["28", "30", "32", "34", "36", "38", "40"],
			},
			{
				id: "q8c",
				text: "Inseam",
				type: "single_choice",
				options: ["28", "30", "32", "34", "36"],
			},
			{
				id: "q8d",
				text: "Shoes",
				type: "single_choice",
				options: ["7", "8", "9", "10", "11", "12", "13"],
			},
		],
	},
	{
		id: "q9",
		text: "What type of pants do you rock?",
		type: "single_choice",
		options: ["Slim", "Relaxed", "Straight"],
	},
	{
		id: "q10",
		text: "Which colors do you want to avoid?",
		type: "color_multiple_choice",
		options: [
			"Black",
			"White",
			"Gray",
			"Brown",
			"Beige",
			"Pinks",
			"Green",
			"Red",
			"Olive Green",
			"Yellow",
		],
		colorCodes: {
			Black: "#000000",
			White: "#FFFFFF",
			Gray: "#808080",
			Brown: "#8B4513",
			Beige: "#F5F5DC",
			Pinks: "#FFC0CB",
			Green: "#008000",
			Red: "#FF0000",
			"Olive Green": "#808000",
			Yellow: "#FFFF00",
		},
	},
	{
		id: "q11",
		text: "What designs do you like?",
		type: "single_choice",
		options: ["Basic", "Graphics", "Combination (drake voice)"],
	},
	{
		id: "q12",
		text: "Do you want your stylist to avoid any of these?",
		type: "multiple_choice",
		options: [
			"Polos",
			"Button Downs",
			"T-shirts",
			"Hoodies",
			"Jackets",
			"Shoes",
		],
	},
	{
		id: "q13",
		text: "Are you interested in vintage and second hand items in great and excellent condition?",
		type: "single_choice",
		options: ["Yes", "No"],
	},
	{
		id: "q14",
		text: "What's your monthly budget for clothing?",
		type: "number",
		unit: "$",
		placeholder: "Enter your monthly budget",
		validation: {
			min: 50,
			max: 10000,
		},
	},
	{
		id: "q15",
		text: "How often do you want to receive clothing?",
		type: "single_choice",
		options: ["Every two weeks", "Monthly", "Every two months"],
	},
];

const EmailQuestion = ({ value, onChange, onNext }: EmailQuestionProps) => (
	<div className="pt-16">
		<input
			type="email"
			value={value || ""}
			onChange={(e) => onChange(e.target.value)}
			className="grid grid-cols-[auto_1fr_auto] items-center gap-4 min-w-[64rem] bg-transparent
              text-4xl px-4 py-3 rounded-md shadow-[0px_0px_1px_1px_rgba(255,255,255,1)] text-white cursor-pointer"
			placeholder="Enter your email"
		/>
		<button className="mt-2 p-2 bg-blue-500 text-white rounded">
			Sign in with Google
		</button>
		<button
			onClick={onNext}
			className="mt-4 px-6 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors"
		>
			Next
		</button>
	</div>
);

const NumberQuestion = ({
	value,
	onChange,
	onNext,
	validation,
	placeholder,
	unit,
}: NumberQuestionProps) => (
	<div className="pt-16">
		<div className="flex items-center gap-2">
			<input
				type="number"
				value={value || ""}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				min={validation?.min}
				max={validation?.max}
				className="w-80 p-2 border rounded text-black"
			/>
			{unit && <span className="text-white">{unit}</span>}
		</div>
		<button
			onClick={onNext}
			className="mt-4 px-6 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors"
		>
			Next
		</button>
	</div>
);

// SingleChoiceQuestion remains unchanged as it auto-advances...
const SingleChoiceQuestion = ({
	options,
	value,
	onChange,
	onNext,
}: SingleChoiceQuestionProps) => {
	const getLetter = (index: number) => String.fromCharCode(65 + index);

	const handleOptionChange = (option: string) => {
		onChange(option);
		// Since onChange updates the state, we want to advance after the state is updated
		requestAnimationFrame(() => onNext());
	};

	return (
		<div className="space-y-6 flex flex-col justify-center">
			{options.map((option, index) => {
				const isSelected = value === option;
				return (
					<div key={option} className="flex items-center">
						<input
							type="radio"
							id={option}
							checked={isSelected}
							onChange={() => handleOptionChange(option)}
							className="left-[-999em] absolute"
						/>
						<label
							className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 min-w-[64rem] 
              text-4xl px-4 py-3 rounded-md 
              ${
								isSelected
									? "shadow-[0px_0px_1px_1px_rgba(255,255,255,1)] text-white"
									: "shadow-[0px_0px_2px_1px_rgba(255,255,255,0.5)] hover:shadow-[0px_0px_1px_1px_rgba(255,255,255,1)] hover:text-white"
							} cursor-pointer`}
							htmlFor={option}
						>
							<span
								className={
									isSelected
										? "border-2 border-[var(--bm-white)] rounded-sm text-lg inline-block bg-[var(--bm-white)] w-8 h-8 text-center leading-8 text-[var(--bm-black)]"
										: "border-2 border-[var(--bm-white)] rounded-sm text-lg inline-block bg-[#171717] w-8 h-8 text-center leading-8 text-white"
								}
							>
								{getLetter(index)}
							</span>
							<span>{option}</span>
							<span className="justify-self-end h-8 w-8 flex items-center">
								{isSelected && (
									<svg
										className="w-full h-full"
										viewBox="0 0 15 15"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<title>Checkbox</title>
										<path
											d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
											fill="currentColor"
											fillRule="evenodd"
											clipRule="evenodd"
										/>
									</svg>
								)}
							</span>
						</label>
					</div>
				);
			})}
		</div>
	);
};

const ColorMultipleChoiceQuestion = <T extends string>({
	options,
	value,
	onChange,
	onNext,
	images,
	colorCodes,
}: MultipleChoiceQuestionProps<T>) => {
	const getLetter = (index: number) => String.fromCharCode(65 + index);

	return (
		<div className="space-y-6 flex flex-col justify-center">
			<div className="space-y-6 flex flex-col justify-center">
				{options.map((option, index) => {
					const isSelected = value.includes(option);
					return (
						<div key={option} className="flex items-center">
							<input
								type="checkbox"
								id={option}
								checked={isSelected}
								onChange={(e) => {
									const newValue = e.target.checked
										? [...value, option]
										: value.filter((v) => v !== option);
									onChange(newValue);
								}}
								className="left-[-999em] absolute"
							/>
							<label
								className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 min-w-[64rem]
                text-4xl px-4 py-3 rounded-md
                ${
									isSelected
										? "shadow-[0px_0px_1px_1px_rgba(255,255,255,1)] text-white"
										: "shadow-[0px_0px_2px_1px_rgba(255,255,255,0.5)] hover:shadow-[0px_0px_1px_1px_rgba(255,255,255,1)] hover:text-white"
								} cursor-pointer`}
								htmlFor={option}
							>
								<span
									className={
										isSelected
											? "border-2 border-[var(--bm-white)] rounded-sm text-lg inline-block bg-[var(--bm-white)] w-8 h-8 text-center leading-8 text-[var(--bm-black)]"
											: "border-2 border-[var(--bm-white)] rounded-sm text-lg inline-block bg-[#171717] w-8 h-8 text-center leading-8 text-white"
									}
								>
									{getLetter(index)}
								</span>
								<span className="flex items-center gap-2">
									{option}
									{images?.[option] && (
										<img
											src={images[option]}
											alt={option}
											className="w-8 h-8 object-contain"
										/>
									)}
									{colorCodes?.[option] && (
										<div
											className="w-4 h-4 rounded-full"
											style={{ backgroundColor: colorCodes[option] }}
										/>
									)}
								</span>
								<span className="justify-self-end h-8 w-8 flex items-center">
									{isSelected && (
										<svg
											className="w-full h-full"
											viewBox="0 0 15 15"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<title>Checkbox</title>
											<path
												d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
												fill="currentColor"
												fillRule="evenodd"
												clipRule="evenodd"
											/>
										</svg>
									)}
								</span>
							</label>
						</div>
					);
				})}
			</div>
			<button
				onClick={onNext}
				className="max-w-fit mt-8 px-6 py-3 bg-white text-black rounded-md hover:bg-gray-200 transition-colors text-xl"
			>
				Next
			</button>
		</div>
	);
};

const ImageMultipleChoiceQuestion = <T extends string>({
	options,
	value,
	onChange,
	onNext,
	images,
	colorCodes,
}: MultipleChoiceQuestionProps<T>) => {
	const getLetter = (index: number) => String.fromCharCode(65 + index);
	return (
		<div className="space-y-6 flex flex-col justify-center max-w-[calc(100vw-12rem)]">
			<div className="flex flex-row gap-10 ">
				{options.map((option, index) => {
					const isSelected = value.includes(option);
					return (
						<div key={option} className="flex">
							<div
								className={`cursor-pointer relative ${isSelected ? "outline rounded-lg" : ""}`}
								onClick={() => {
									const newValue = !isSelected
										? [...value, option]
										: value.filter((v) => v !== option);
									onChange(newValue);
								}}
							>
								{images?.[option] && (
									<img
										src={images[option]}
										alt={option}
										className="contrast-75 w-full h-full object-contain object-bottom align-bottom rounded-lg drop-shadow-md"
									/>
								)}
								<input
									type="checkbox"
									id={option}
									checked={isSelected}
									className="left-[-999em] absolute"
									readOnly
								/>
								<div
									className="absolute bottom-0 pb-2 pl-2 w-full h-[28%] bg-zinc-900/75 blur-2xl rounded-b-lg"
									htmlFor={option}
								/>
								<label className="text-white drop-shadow-2xl absolute bottom-0 pb-2 pl-2 text-5xl font-extrabold w-full rounded-b-lg select-none">
									{option}
								</label>
								<div className="absolute w-7 h-8 bg-[var(--bm-white)] z-3 top-[-1px] right-6">
									<svg
										className="w-full h-full"
										viewBox="0 0 15 15"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<circle
											r="5"
											cy="7.5"
											cx="7.5"
											stroke="#6D6D6D"
											strokeWidth="0.5"
										/>
										<title>Checkbox</title>
										{isSelected && (
											<path
												d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
												fill="black"
												fillRule="evenodd"
												clipRule="evenodd"
											/>
										)}
									</svg>
								</div>
							</div>
						</div>
					);
				})}
			</div>
			<button
				onClick={onNext}
				className="max-w-fit mt-8 px-6 py-3 bg-white text-black rounded-md hover:bg-gray-200 transition-colors text-xl"
			>
				Next
			</button>
		</div>
	);
};

const SizeQuestion = ({
	value = {},
	onChange,
	onNext,
	subQuestions,
}: SizeQuestionProps) => (
	<div className="flex flex-col justify-center space-y-4">
		{subQuestions.map(({ id, text, options }) => (
			<div key={id} className="text-white">
				<label className="block mb-1">{text}</label>
				<select
					value={value[id] || ""}
					onChange={(e) => onChange({ ...value, [id]: e.target.value })}
					className="w-80 p-2 border rounded text-black"
				>
					<option value="">Select {text}</option>
					{options.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</div>
		))}
		<button
			onClick={onNext}
			className="w-60 mt-4 px-6 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors"
		>
			Next
		</button>
	</div>
);

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
			setCurrentQuestion(nextQuestion);
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

/* 
TYPE WRITER
*/

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
