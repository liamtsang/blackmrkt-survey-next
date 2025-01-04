"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

const SHUFFLE_TIME = 50;

type Props = {
	children: string;
	isAnimating?: boolean;
};

const ScrambleText: React.FC<Props> = ({ children, isAnimating = false }) => {
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const [text, setText] = useState(children);
	const words = children.match(/\S+|\s+/g) || [];

	const shiftWord = (word: string, offset: number) => {
		if (word.trim() === "") return word;
		const chars = word.split("");

		// Create a shifted version of the array
		const shiftedChars = [
			...chars.slice(offset % chars.length),
			...chars.slice(0, offset % chars.length),
		];

		return shiftedChars.join("");
	};

	const scramble = () => {
		let shifts = 5; // Start with an offset of 5 positions
		const maxShifts = shifts + Math.max(...words.map((word) => word.length));

		stopScramble();

		intervalRef.current = setInterval(() => {
			const scrambled = words
				.map((word) => {
					if (word.trim() === "") return word;
					return shiftWord(word, shifts);
				})
				.join("");

			setText(scrambled);
			shifts--;

			if (shifts < 0) {
				stopScramble();
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
		if (isAnimating) {
			scramble();
		} else if (!isAnimating) {
			stopScramble();
		}
	}, [isAnimating, children]);

	useEffect(() => {
		scramble();
	}, [children]);

	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	return (
		<motion.div className="relative overflow-hidden">
			<div className="relative z-10 flex items-center gap-2">
				<span>{text}</span>
			</div>
		</motion.div>
	);
};

export default ScrambleText;
