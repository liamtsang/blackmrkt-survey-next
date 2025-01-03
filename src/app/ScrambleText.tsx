"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

const CYCLES_PER_LETTER = 5;
const SHUFFLE_TIME = 50;

type Props = {
	children: string;
	isAnimating?: boolean;
	onAnimationComplete?: () => void;
};

const ScrambleText: React.FC<Props> = ({
	children,
	isAnimating = false,
	onAnimationComplete,
}) => {
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const [text, setText] = useState(children);
	const words = children.match(/\S+|\s+/g) || [];
	const [isHovering, setIsHovering] = useState(false);

	const shiftWord = (word: string, shift: number) => {
		if (word.trim() === "") return word;

		const chars = word.split("");
		// Create a shifted version of the array
		const shiftedChars = [
			...chars.slice(shift % chars.length),
			...chars.slice(0, shift % chars.length),
		];

		return shiftedChars.join("");
	};

	const scramble = () => {
		let cycles = 0;
		const maxCycles = Math.max(
			...words.map((word) => word.trim().length * CYCLES_PER_LETTER),
		);

		stopScramble();

		intervalRef.current = setInterval(() => {
			const scrambled = words
				.map((word) => {
					if (word.trim() === "") return word;
					const wordLength = word.length;
					if (cycles / CYCLES_PER_LETTER >= wordLength) {
						return word;
					}
					// Shift based on current cycle
					return shiftWord(word, cycles);
				})
				.join("");

			setText(scrambled);
			cycles++;

			if (cycles >= maxCycles) {
				stopScramble();
				onAnimationComplete?.();
			}
		}, SHUFFLE_TIME);
	};

	const stopScramble = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		setText(children);
	};

	useEffect(() => {
		if (isAnimating && !isHovering) {
			scramble();
		} else if (!isAnimating && !isHovering) {
			stopScramble();
		}
	}, [isAnimating, children]);

	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	return (
		<motion.div
			whileHover={{
				scale: 1.025,
			}}
			whileTap={{
				scale: 0.975,
			}}
			onMouseEnter={() => {
				setIsHovering(true);
				scramble();
			}}
			onMouseLeave={() => {
				setIsHovering(false);
				stopScramble();
			}}
			className="relative overflow-hidden"
		>
			<div className="relative z-10 flex items-center gap-2">
				<span>{text}</span>
			</div>
		</motion.div>
	);
};

export default ScrambleText;
