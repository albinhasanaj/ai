// pages/index.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PredictionList from "../components/PredictionList";
import ProfitCalculator from "../components/ProfitCalculator";
import PredictForm from "../components/PredictForm";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import { fetchPredictions } from "../services/api";
import { PredictionsResponse, Prediction } from "../types";
import { FaArrowUp, FaArrowDown, FaArrowRight, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const Home: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionsResponse>({});
  const [predictResult, setPredictResult] = useState<Prediction | null>(null);
  const [loadingPredictions, setLoadingPredictions] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [allPercentages, setAllPercentages] = useState<number[]>([]);
  const [averagePercentage, setAveragePercentage] = useState<number>(0);

  const fetchLatestPredictions = async () => {
    try {
      const data = await fetchPredictions();
      setPredictions(data);

      // Extract percentages from predictions
      const percentages = Object.values(data)
        .filter(pred => pred.prediction !== "Neutral")
        .map(pred => parseFloat(pred.pct_change.replace("%", "")))
        .filter(pct => !isNaN(pct))
        .map(pct => Math.abs(pct));

      setAllPercentages(percentages);
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError("Failed to load predictions. Please try again later.");
    } finally {
      setLoadingPredictions(false);
    }
  };

  useEffect(() => {
    fetchLatestPredictions();
  }, []);

  useEffect(() => {
    if (allPercentages.length > 0) {
      const total = allPercentages.reduce((sum, val) => sum + val, 0);
      const average = total / allPercentages.length;
      setAveragePercentage(average);
    }
  }, [allPercentages]);

  // Helper functions for single prediction result
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

  const formatPredictResult = (result: Prediction) => {
    let pctChangeColor = "text-yellow-500";
    if (result.pct_change !== "N/A") {
      const pct = parseFloat(result.pct_change);
      if (pct > 0) {
        pctChangeColor = "text-green-500";
      } else if (pct < 0) {
        pctChangeColor = "text-red-500";
      }
    }

    const isTodayMinus7 =
      result.specific_date ===
      new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    return (
      <motion.div
        className="bg-gray-100 p-6 rounded-lg shadow-md mt-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-2xl font-semibold">
            Prediction Result for {result.specific_date}
          </h4>
          <span className={`text-3xl ${getReturnValColor(result.prediction)}`}>
            {getOutcomeIcon(result.prediction)}
          </span>
        </div>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Prediction:</span>{" "}
            <span className={result.was_correct ? "text-green-500" : "text-red-500"}>
              {result.prediction}
            </span>
          </div>
          <div>
            <span className="font-medium">Was Correct:</span>{" "}
            <span
              className={
                isTodayMinus7
                  ? "text-yellow-500 font-semibold"
                  : result.was_correct
                    ? "text-green-500 font-semibold"
                    : "text-red-500 font-semibold"
              }
            >
              {result.was_correct !== null
                ? isTodayMinus7
                  ? "Still Calculating"
                  : result.was_correct
                    ? "Yes"
                    : "No"
                : "N/A"}
            </span>
          </div>
          <div>
            <span className="font-medium">Future Date:</span>{" "}
            {result.future_date || "N/A"}
          </div>
          <div>
            <span className="font-medium">Percentage Change:</span>{" "}
            <span className={pctChangeColor}>{result.pct_change}</span>
          </div>
          <div>
            <span className="font-medium">Confidence:</span>{" "}
            {result.confidence}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Bitcoin Market Predictions
      </h1>

      {/* Latest Predictions Section */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Latest Predictions</h2>

        {loadingPredictions ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : Object.keys(predictions).length > 0 ? (
          <PredictionList predictions={predictions} />
        ) : (
          <p className="text-gray-600">No predictions available.</p>
        )}
      </motion.div>

      {/* Profit Calculator */}
      <ProfitCalculator averagePercentage={averagePercentage} />

      {/* Make a Prediction */}
      <PredictForm setPredictResult={setPredictResult} />

      {/* Single Prediction Result */}
      {predictResult && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {predictResult.prediction === "Error" ? (
            <ErrorMessage message="Unable to make prediction. Please try again." />
          ) : (
            formatPredictResult(predictResult)
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Home;
