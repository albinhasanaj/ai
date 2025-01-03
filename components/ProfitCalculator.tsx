// components/ProfitCalculator.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ProfitCalculatorProps {
    averagePercentage: number;
}

const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ averagePercentage }) => {
    const [amount, setAmount] = useState<number>(0);
    const [leverage, setLeverage] = useState<number>(1);
    const [calculatedProfit, setCalculatedProfit] = useState<number | null>(null);
    const [calculatedMonthlyProfit, setCalculatedMonthlyProfit] = useState<number | null>(null);

    const handleCalculate = () => {
        if (averagePercentage === 0) {
            setCalculatedProfit(null);
            setCalculatedMonthlyProfit(null);
            return;
        }

        const weeklyGrowthMultiplier = 1 + averagePercentage / 100;
        const monthlyGrowthMultiplier = Math.pow(weeklyGrowthMultiplier, 4);

        const potentialProfit = amount * leverage * (averagePercentage / 100);
        const monthlyProfit = amount * leverage * monthlyGrowthMultiplier - amount * leverage;

        setCalculatedProfit(potentialProfit);
        setCalculatedMonthlyProfit(monthlyProfit);
    };

    return (
        <motion.div
            className="bg-white p-8 rounded-lg shadow-lg mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">
                Profit Calculator
            </h2>
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
                <div className="flex flex-col mb-4 md:mb-0">
                    <label className="font-medium text-gray-700 mb-2">Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder="Enter amount"
                        className="border border-gray-300 p-3 rounded-lg w-full md:w-auto"
                    />
                </div>
                <div className="flex flex-col mb-4 md:mb-0">
                    <label className="font-medium text-gray-700 mb-2">Leverage</label>
                    <input
                        type="number"
                        value={leverage}
                        onChange={(e) => setLeverage(Number(e.target.value))}
                        placeholder="Enter leverage"
                        className="border border-gray-300 p-3 rounded-lg w-full md:w-auto"
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCalculate}
                    className="bg-blue-600 text-white p-3 rounded-lg w-full md:w-auto hover:bg-blue-700 transition-colors duration-300"
                >
                    Calculate
                </motion.button>
            </div>

            <div className="mt-6">
                <p className="text-gray-700 mb-2">
                    <span className="font-medium">7-Day Average Change:</span>{" "}
                    {averagePercentage.toFixed(2)}%
                </p>
                <p className="text-gray-700">
                    <span className="font-medium">Estimated Profit:</span>{" "}
                    {calculatedProfit !== null
                        ? `${calculatedProfit.toFixed(2)}kr`
                        : "N/A"}
                </p>
                <p className="text-gray-700">
                    <span className="font-medium">Estimated Monthly Profit:</span>{" "}
                    {calculatedMonthlyProfit !== null
                        ? `${calculatedMonthlyProfit.toFixed(2)}kr`
                        : "N/A"}
                </p>
            </div>
        </motion.div>
    );
};

export default ProfitCalculator;
