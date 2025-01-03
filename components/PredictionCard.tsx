// components/PredictionCard.tsx

import React from 'react';
import { FaArrowUp, FaArrowDown, FaArrowRight, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Prediction } from '../types';
import { useRouter } from 'next/navigation';

interface PredictionCardProps {
    prediction: Prediction & { date: string };
}

const PredictionCard: React.FC<PredictionCardProps> = ({ prediction }) => {
    const router = useRouter(); // Initialize router

    const getReturnValColor = (returnVal: string): string => {
        switch (returnVal) {
            case "Up":
                return "text-green-500";
            case "Down":
                return "text-red-500";
            case "Neutral":
                return "text-yellow-500";
            case "No Future Data":
                return "text-gray-500";
            case "Error":
                return "text-red-500";
            default:
                return "text-gray-500";
        }
    };

    const getOutcomeIcon = (returnVal: string) => {
        switch (returnVal) {
            case "Up":
                return <FaArrowUp className="inline-block" />;
            case "Down":
                return <FaArrowDown className="inline-block" />;
            case "Neutral":
                return <FaArrowRight className="inline-block" />;
            case "No Future Data":
                return <FaExclamationTriangle className="inline-block" />;
            case "Error":
                return <FaTimes className="inline-block" />;
            default:
                return null;
        }
    };

    const correctnessColor = prediction.was_correct
        ? "text-green-500"
        : "text-red-500";

    let pctChangeColor = "text-yellow-500";
    if (prediction.pct_change !== "N/A") {
        const pct = parseFloat(prediction.pct_change);
        if (pct > 0) {
            pctChangeColor = "text-green-500";
        } else if (pct < 0) {
            pctChangeColor = "text-red-500";
        }
    }

    const isTodayMinus7 =
        prediction.date ===
        new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];

    const handleViewDetails = () => {
        // Navigate to the detailed prediction page
        router.push(`/prediction/${prediction.specific_date}`);
    };

    return (
        <motion.div
            className="min-w-[300px] mb-4 p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 flex-shrink-0 flex flex-col justify-between"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
        >
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{prediction.date}</h3>
                    <span className={`text-2xl ${getReturnValColor(prediction.prediction)}`}>
                        {getOutcomeIcon(prediction.prediction)}
                    </span>
                </div>
                <div className="space-y-2">
                    <div>
                        <span className="font-medium">Prediction:</span>{" "}
                        <span className={correctnessColor}>{prediction.prediction}</span>
                    </div>
                    <div>
                        <span className="font-medium">Was Correct:</span>{" "}
                        <span
                            className={
                                isTodayMinus7
                                    ? "text-yellow-500 font-semibold"
                                    : prediction.was_correct
                                        ? "text-green-500 font-semibold"
                                        : "text-red-500 font-semibold"
                            }
                        >
                            {prediction.was_correct !== null
                                ? isTodayMinus7
                                    ? "Still Calculating"
                                    : prediction.was_correct
                                        ? "Yes"
                                        : "No"
                                : "N/A"}
                        </span>
                    </div>
                    <div>
                        <span className="font-medium">Future Date:</span>{" "}
                        {prediction.future_date || "N/A"}
                    </div>
                    <div>
                        <span className="font-medium">Percentage Change:</span>{" "}
                        <span className={pctChangeColor}>{prediction.pct_change}</span>
                    </div>
                    <div>
                        <span className="font-medium">Confidence:</span>{" "}
                        {prediction.confidence}
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <button
                    onClick={handleViewDetails}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                    View Details
                </button>
            </div>
        </motion.div>
    );
};

export default PredictionCard;
