// components/PredictionList.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PredictionCard from './PredictionCard';
import { PredictionsResponse } from '../types';

interface PredictionListProps {
    predictions: PredictionsResponse;
}

const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const PredictionList: React.FC<PredictionListProps> = ({ predictions }) => {
    // Convert the data object to an array and sort by date descending
    const sortedData = Object.entries(predictions)
        .map(([date, prediction]) => ({ date, ...prediction }))
        .sort((a, b) => new Date(b.specific_date).getTime() - new Date(a.specific_date).getTime());

    return (
        <motion.div
            className="flex space-x-4 overflow-x-auto pb-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <AnimatePresence>
                {sortedData.map((prediction) => (
                    <PredictionCard key={prediction.date} prediction={prediction} />
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

export default PredictionList;
