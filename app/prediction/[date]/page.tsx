// pages/prediction/[date].tsx
"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Prediction } from '@/types';
import { fetchPredictionByDate } from '@/services/api';
import Loader from '@/components/Loader';
import ErrorMessage from '@/components/ErrorMessage';
import SequenceDataView from '@/components/SequenceDataView';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';


const PredictionDetails: React.FC = () => {
    const pathname = usePathname();
    const date = pathname.split('/').pop();
    const router = useRouter();



    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!date || typeof date !== 'string') return;

        const getPrediction = async () => {
            try {
                const data = await fetchPredictionByDate(date);
                setPrediction(data);
            } catch (err) {
                console.error('Error fetching prediction:', err);
                setError('Failed to load prediction details. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        getPrediction();
    }, [date]);

    if (isLoading) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
                <ErrorMessage message={error} />
            </div>
        );
    }

    if (!prediction) {
        return null;
    }

    return (
        <motion.div
            className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
        >
            <button
                onClick={() => router.back()}
                className="mb-6 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
            >
                Back
            </button>
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
                Prediction Details for {prediction.specific_date}
            </h1>
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                <div className="space-y-2">
                    <div>
                        <span className="font-medium">Prediction:</span>{" "}
                        <span
                            className={
                                prediction.prediction === 'Up'
                                    ? 'text-green-500'
                                    : prediction.prediction === 'Down'
                                        ? 'text-red-500'
                                        : 'text-yellow-500'
                            }
                        >
                            {prediction.prediction}
                        </span>
                    </div>
                    <div>
                        <span className="font-medium">Was Correct:</span>{" "}
                        <span
                            className={
                                prediction.was_correct
                                    ? 'text-green-500 font-semibold'
                                    : 'text-red-500 font-semibold'
                            }
                        >
                            {prediction.was_correct !== null
                                ? prediction.was_correct
                                    ? 'Yes'
                                    : 'No'
                                : 'N/A'}
                        </span>
                    </div>
                    <div>
                        <span className="font-medium">Future Date:</span>{" "}
                        {prediction.future_date || 'N/A'}
                    </div>
                    <div>
                        <span className="font-medium">Percentage Change:</span>{" "}
                        <span
                            className={
                                prediction.pct_change !== 'N/A'
                                    ? parseFloat(prediction.pct_change) > 0
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                    : 'text-yellow-500'
                            }
                        >
                            {prediction.pct_change}
                        </span>
                    </div>
                    <div>
                        <span className="font-medium">Confidence:</span>{" "}
                        {prediction.confidence}
                    </div>
                </div>
            </div>
            <SequenceDataView sequence={prediction.sequence} />
        </motion.div>
    );
};

export default PredictionDetails;
