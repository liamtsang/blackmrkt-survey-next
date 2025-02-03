import type {
	EmailQuestionProps,
	NumberQuestionProps,
	SingleChoiceQuestionProps,
	MultipleChoiceQuestionProps,
	SizeQuestionProps,
} from "@/utils/types";

import { useEffect, useState } from "react";

type NextButtonProps = {
	onClickFunction: () => void;
	disabled?: boolean;
};

const NextButton = ({ onClickFunction, disabled = false }: NextButtonProps) => {
	useEffect(() => {
		const handleGlobalKeyPress = (event: KeyboardEvent) => {
			if (event.key === "Enter" && !disabled) {
				event.preventDefault();
				onClickFunction();
			}
		};
		document.addEventListener("keydown", handleGlobalKeyPress);
		return () => {
			document.removeEventListener("keydown", handleGlobalKeyPress);
		};
	}, [onClickFunction, disabled]);

	return (
		<button
			type="submit"
			onClick={onClickFunction}
			disabled={disabled}
			className="cursor-pointer text-2xl button-drop-shadow font-normal mt-4 px-6 pt-1 pb-2 text-[var(--bm-black)] rounded-lg bg-linear-to-b from-[#f5f7f7] to-[#ebf2f2] hover:from-gray-300 hover:to-gray-200 transition-colors w-fit disabled:opacity-25"
		>
			Next
		</button>
	);
};

interface CredentialResponse {
	credential: string;
	select_by: string;
	client_id: string;
}

interface GsiButtonConfiguration {
	theme?: "outline" | "filled_blue" | "filled_black";
	size?: "large" | "medium" | "small";
	text?: "signin_with" | "signup_with" | "continue_with" | "signin";
	shape?: "rectangular" | "pill" | "circle" | "square";
	logo_alignment?: "left" | "center";
	width?: number;
	local?: string;
}

interface IdentityServicesConfig {
	client_id: string;
	callback: (response: CredentialResponse) => void;
	auto_select?: boolean;
	cancel_on_tap_outside?: boolean;
}

interface Google {
	accounts: {
		id: {
			initialize: (config: IdentityServicesConfig) => void;
			renderButton: (
				element: HTMLElement | null,
				config: GsiButtonConfiguration,
			) => void;
		};
	};
}

// Extend Window interface to include Google property
declare global {
	interface Window {
		google?: Google;
	}
}

interface DecodedCredential {
	email: string;
	email_verified: boolean;
	name: string;
	picture: string;
	given_name: string;
	family_name: string;
	locale: string;
	iat: number;
	exp: number;
	sub: string;
}

export const EmailQuestion = ({
	value,
	onChange,
	onNext,
}: EmailQuestionProps) => {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		document.body.appendChild(script);

		script.onload = () => {
			window.google?.accounts.id.initialize({
				client_id:
					"1023000220680-0devmslp723c5fgk6kgclhglte4qc2p9.apps.googleusercontent.com",
				callback: handleCredentialResponse,
			});

			const buttonElement = document.getElementById("google-signin-button");
			if (buttonElement && window.google) {
				window.google.accounts.id.renderButton(buttonElement, {
					theme: "outline",
					size: "large",
					text: "signin_with",
					shape: "rectangular",
				});
			}

			setIsLoading(false);
		};

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	const handleCredentialResponse = (response: CredentialResponse) => {
		const payload = decodeJwtResponse(response.credential);
		onChange(payload.email);
		onNext();
	};

	const decodeJwtResponse = (token: string): DecodedCredential => {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
				.join(""),
		);
		return JSON.parse(jsonPayload);
	};

	return (
		<div className="pt-16">
			<div className="flex flex-col gap-2">
				<label htmlFor="email" className="font-normal">
					Email
				</label>
				<input
					type="email"
					id="email"
					value={value || ""}
					onChange={(e) => onChange(e.target.value)}
					className="grid grid-cols-[auto_1fr_auto] items-center gap-4 min-w-full lg:min-w-[64rem] bg-transparent
            text-lg lg:text-4xl px-4 py-3 rounded-md shadow-[0px_0px_1px_1px_rgba(255,255,255,1)] text-white cursor-pointer"
				/>
				<div className="flex items-center gap-2">
					<div id="google-signin-button" className="mt-2" />
					{isLoading && (
						<span className="text-gray-400">Loading Google Sign-in...</span>
					)}
				</div>
				<NextButton onClickFunction={onNext} disabled={!value} />
			</div>
		</div>
	);
};

export const NumberQuestion = ({
	value,
	onChange,
	onNext,
	validation,
	placeholder,
	unit,
}: NumberQuestionProps) => (
	<div className="pt-16">
		<div className="flex flex-col gap-2">
			<label htmlFor={placeholder}>{placeholder}</label>
			<span className="flex items-center">
				{unit && (
					<span className="text-white absolute pl-4 text-lg lg:text-4xl">
						{unit}
					</span>
				)}
				<input
					id={placeholder}
					type="number"
					value={value || ""}
					onChange={(e) => onChange(e.target.value)}
					min={validation?.min}
					max={validation?.max}
					className="grid grid-cols-[auto_1fr_auto] items-center gap-4 min-w-full lg:min-w-[64rem] bg-transparent
              text-lg lg:text-4xl pl-12 pr-6 py-3 rounded-md shadow-[0px_0px_1px_1px_rgba(255,255,255,1)] text-white cursor-pointer"
				/>
			</span>
		</div>
		<NextButton onClickFunction={onNext} disabled={!value} />
	</div>
);

export const HeightQuestion = ({
	value,
	onChange,
	onNext,
	validation,
	placeholder,
}: NumberQuestionProps) => {
	const [feet, setFeet] = useState("");
	const [inches, setInches] = useState("");

	useEffect(() => {
		if (value) {
			const match = value.match(/(\d+)'(\d+)"/);
			if (match) {
				setFeet(match[1]);
				setInches(match[2]);
			}
		}
	}, [value]);

	const handleFeetChange = (newFeet: string) => {
		setFeet(newFeet);
		if (newFeet && inches) {
			onChange(`${newFeet}'${inches}"`);
		}
	};

	const handleInchesChange = (newInches: string) => {
		// Ensure inches are between 0-11
		const validInches = Math.min(
			Math.max(0, Number.parseInt(newInches) || 0),
			11,
		);
		setInches(validInches.toString());
		if (feet) {
			onChange(`${feet}'${validInches}"`);
		}
	};

	return (
		<div className="pt-16 flex flex-col items-baseline">
			<div className="flex flex-row gap-2">
				<div className="flex items-center gap-2">
					<input
						type="number"
						value={feet}
						onChange={(e) => handleFeetChange(e.target.value)}
						// placeholder="5"
						min={validation?.min || 0}
						max={validation?.max || 9}
						className="grid min-w-1/2 lg:min-w-[8rem] bg-transparent text-lg lg:text-4xl px-4 py-3 rounded-md shadow-[0px_0px_1px_1px_rgba(255,255,255,1)] text-white cursor-pointer"
					/>
					<span className="text-white">ft</span>
				</div>
				<div className="flex items-center gap-2">
					<input
						type="number"
						value={inches}
						onChange={(e) => handleInchesChange(e.target.value)}
						// placeholder="7"
						min={0}
						max={11}
						className="grid min-w-1/2 lg:min-w-[8rem] bg-transparent text-lg lg:text-4xl px-4 py-3 rounded-md shadow-[0px_0px_1px_1px_rgba(255,255,255,1)] text-white cursor-pointer"
					/>
					<span className="text-white">in</span>
				</div>
			</div>
			<NextButton onClickFunction={onNext} disabled={!feet || !inches} />
		</div>
	);
};

export const SingleChoiceQuestion = ({
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
							className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 min-w-full lg:min-w-[64rem] 
              text-lg lg:text-4xl px-2 py-2 lg:px-4 lg:py-3 rounded-md relative 
              ${
								isSelected
									? "text-white iridescent bg-[var(--bm-black)]"
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

export const ColorMultipleChoiceQuestion = <T extends string>({
	options,
	value,
	onChange,
	onNext,
	images,
	colorCodes,
}: MultipleChoiceQuestionProps<T>) => {
	return (
		<div className="space-y-6 flex flex-col justify-center">
			<div className="flex justify-center">
				<div className="grid grid-cols-5 gap-6 max-w-[1080px] justify-center">
					{options.map((option, index) => {
						const isSelected = value.includes(option);
						return (
							<div
								key={option}
								onClick={() => {
									const newValue = !isSelected
										? [...value, option]
										: value.filter((v) => v !== option);
									onChange(newValue);
								}}
								className="cursor-pointer flex relative flex-col items-center gap-2 justify-center"
							>
								<input
									type="checkbox"
									id={option}
									defaultChecked={isSelected}
									className="left-[-999em] absolute"
								/>
								{colorCodes?.[option] && (
									<div
										className={`w-14 h-14 lg:w-24 lg:h-24 rounded-sm outline outline-2 ${isSelected ? "outline-[var(--bm-white)]" : "outline-slate-900"}`}
										style={{ backgroundColor: colorCodes[option] }}
									/>
								)}
								<label
									className={`text-xl rounded-md px-1 min-w-14 lg:min-w-24 text-center
			              ${
											isSelected
												? "shadow-[0px_0px_1px_1px_rgba(255,255,255,1)] text-white bg-black"
												: "shadow-[0px_0px_2px_1px_rgba(255,255,255,0.25)] hover:shadow-[0px_0px_1px_1px_rgba(255,255,255,1)] hover:text-white"
										} cursor-pointer`}
									htmlFor={option}
								>
									{option}
								</label>
								{isSelected && (
									<div className="absolute top-1 right-3">
										<svg
											width="35"
											height="35"
											viewBox="0 0 35 35"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												fillRule="evenodd"
												clipRule="evenodd"
												d="M17.5 5C10.5964 5 5 10.5964 5 17.5C5 20.5918 6.12251 23.4214 7.98221 25.6036L25.6036 7.98221C23.4214 6.12251 20.5918 5 17.5 5ZM27.0178 9.39643L9.39643 27.0178C11.5786 28.8775 14.4082 30 17.5 30C24.4036 30 30 24.4036 30 17.5C30 14.4082 28.8775 11.5786 27.0178 9.39643ZM3 17.5C3 9.49187 9.49187 3 17.5 3C25.5081 3 32 9.49187 32 17.5C32 25.5081 25.5081 32 17.5 32C9.49187 32 3 25.5081 3 17.5Z"
												fill="white"
											/>
											<path
												fillRule="evenodd"
												clipRule="evenodd"
												d="M17.5 5C10.5964 5 5 10.5964 5 17.5C5 20.5918 6.12251 23.4214 7.98221 25.6036L25.6036 7.98221C23.4214 6.12251 20.5918 5 17.5 5ZM27.0178 9.39643L9.39643 27.0178C11.5786 28.8775 14.4082 30 17.5 30C24.4036 30 30 24.4036 30 17.5C30 14.4082 28.8775 11.5786 27.0178 9.39643ZM3 17.5C3 9.49187 9.49187 3 17.5 3C25.5081 3 32 9.49187 32 17.5C32 25.5081 25.5081 32 17.5 32C9.49187 32 3 25.5081 3 17.5Z"
												fill="black"
												fillOpacity="0.2"
											/>
											<path
												d="M5.5 17.5C5.5 10.8726 10.8726 5.5 17.5 5.5C20.2735 5.5 22.8263 6.44038 24.8585 8.0202L8.0202 24.8585C6.44038 22.8263 5.5 20.2735 5.5 17.5ZM17.5 29.5C14.7265 29.5 12.1737 28.5596 10.1415 26.9798L26.9798 10.1415C28.5596 12.1737 29.5 14.7265 29.5 17.5C29.5 24.1274 24.1274 29.5 17.5 29.5ZM17.5 2.5C9.21573 2.5 2.5 9.21573 2.5 17.5C2.5 25.7843 9.21573 32.5 17.5 32.5C25.7843 32.5 32.5 25.7843 32.5 17.5C32.5 9.21573 25.7843 2.5 17.5 2.5Z"
												stroke="black"
											/>
										</svg>
									</div>
								)}
							</div>
						);
					})}
					<NextButton
						onClickFunction={onNext}
						disabled={Object.keys(value).length === 0}
					/>
				</div>
			</div>
		</div>
	);
};

export const ImageMultipleChoiceQuestion = <T extends string>({
	options,
	value,
	onChange,
	onNext,
	images,
	colorCodes,
}: MultipleChoiceQuestionProps<T>) => {
	const getLetter = (index: number) => String.fromCharCode(65 + index);
	return (
		<div className="space-y-6 flex flex-col justify-center lg:max-w-[calc(100vw-12rem)]">
			<div className="grid grid-cols-3 gap-2 lg:grid-cols-6 lg:gap-10 ">
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
									defaultChecked={isSelected}
									className="left-[-999em] absolute"
									readOnly
								/>
								<div className="absolute bottom-0 pb-2 pl-2 w-full h-[28%] bg-zinc-900/75 blur-2xl rounded-b-lg" />
								<label
									htmlFor={option}
									className="pointer-events-none text-white drop-shadow-2xl absolute bottom-0 pb-2 pl-2 text-2xl leading-tight lg:leading-none lg:text-3xl xl:text-5xl font-extrabold w-full rounded-b-lg select-none"
								>
									{option}
								</label>
								<div className="absolute w-7 h-8 bg-[var(--bm-white)] z-3 top-[-1px] right-3">
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
			<NextButton onClickFunction={onNext} disabled={!value} />
		</div>
	);
};

export const TextMultipleChoiceQuestion = <T extends string>({
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
			{options.map((option, index) => {
				const isSelected = value.includes(option);

				return (
					<div key={option} className="flex items-center">
						<input
							type="radio"
							id={option}
							defaultChecked={isSelected}
							onClick={() => {
								const newValue = !isSelected
									? [...value, option]
									: value.filter((v) => v !== option);
								onChange(newValue);
							}}
							className="left-[-999em] absolute"
						/>
						<label
							className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 min-w-full lg:min-w-[64rem] 
              text-lg lg:text-4xl px-2 py-2 lg:px-4 lg:py-3 rounded-md 
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
			})}{" "}
			<NextButton
				onClickFunction={onNext}
				disabled={Object.keys(value).length === 0}
			/>
		</div>
	);
};

export const SizeQuestion = ({
	value = {},
	onChange,
	onNext,
	subQuestions,
}: SizeQuestionProps) => (
	<div className="flex flex-col justify-center space-y-4">
		{subQuestions.map(({ id, text, options }) => (
			<div key={id} className="text-white">
				<label htmlFor="size" className="block mb-1">
					{text}
				</label>
				<select
					id="size"
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
		<NextButton
			onClickFunction={onNext}
			disabled={Object.keys(value).length < 4}
		/>
	</div>
);
