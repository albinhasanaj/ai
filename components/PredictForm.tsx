// components/PredictForm.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fetchPredictionByDate } from '../services/api';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import { Prediction } from '../types';

interface PredictFormProps {
    setPredictResult: React.Dispatch<React.SetStateAction<Prediction | null>>;
}

const PredictForm: React.FC<PredictFormProps> = ({ setPredictResult }) => {
    const [dateInput, setDateInput] = useState<string>("");
    const [loadingPredict, setLoadingPredict] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handlePredict = async () => {
        if (!dateInput) {
            alert("Please enter a date in the format YYYY-MM-DD");
            return;
        }

        setLoadingPredict(true);
        setPredictResult(null);
        setError("");

        try {
            const prediction = await fetchPredictionByDate(dateInput);
            setPredictResult(prediction);
        } catch (err) {
            console.error("Error making prediction:", err);
            setPredictResult({
                confidence: "N/A",
                future_date: "",
                pct_change: "N/A",
                prediction: "Error",
                specific_date: dateInput,
                was_correct: false,
                sequence: {
                    daily: [],
                    weekly: [],
                    monthly: [],
                    fourhourly: [],
                    hourly: [],
                },
            });
            setError("Unable to make prediction. Please try again.");
        } finally {
            setLoadingPredict(false);
        }
    };

    return (
        <motion.div
            className="bg-white p-8 rounded-lg shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">
                Make a Prediction
            </h2>
            <div className="flex flex-col md:flex-row items-center">
                <input
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="border border-gray-300 p-3 rounded-lg mb-4 md:mb-0 md:mr-4 w-full md:w-auto flex-1"
                />
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handlePredict}
                    className={`bg-blue-600 text-white p-3 rounded-lg w-full md:w-auto hover:bg-blue-700 transition-colors duration-300 ${loadingPredict ? "cursor-not-allowed opacity-50" : ""
                        }`}
                    disabled={loadingPredict}
                >
                    {loadingPredict ? "Predicting..." : "Predict"}
                </motion.button>
            </div>
            {loadingPredict && <Loader />}
            {error && <ErrorMessage message={error} />}
        </motion.div>
    );
};

export default PredictForm;
