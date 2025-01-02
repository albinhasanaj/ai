"use client";
/* eslint-disable */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaArrowUp,
  FaArrowDown,
  FaArrowRight,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Container animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      // Slight delay for child items
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Child item animation variants
const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0, scale: 0.95 },
};

const Home = () => {
  const [predictions, setPredictions] = useState({});
  const [dateInput, setDateInput] = useState("");
  const [predictResult, setPredictResult] = useState(null);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [loadingPredict, setLoadingPredict] = useState(false);

  // For weekly average calculation
  const [allPercentages, setAllPercentages] = useState<number[]>([]);
  const [averagePercentage, setAveragePercentage] = useState<number>(0);

  // States for the Profit Calculator
  const [amount, setAmount] = useState<number>(0);
  const [leverage, setLeverage] = useState<number>(1);
  const [calculatedProfit, setCalculatedProfit] = useState<number | null>(null);
  const [calculatedMonthlyProfit, setCalculatedMonthlyProfit] =
    useState<number | null>(null);

  const [error, setError] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API;

  // =========================================================
  // 1) Fetch historical data for the last 7 to 14 days
  // =========================================================
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        for (let i = 7; i < 14; i++) {
          const today = new Date();
          const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
          const formattedDate = date.toISOString().split("T")[0];

          const response = await axios.get(
            `${API_BASE_URL}/predict/${formattedDate}`
          );
          const prediction = response.data;

          // Only add percentages if it's not "Neutral"
          if (prediction.return_val !== "Neutral") {
            let percentage = prediction.pct_change.replace("%", "");
            percentage = Math.abs(parseFloat(percentage));

            setAllPercentages((prev) => [...prev, percentage]);
          }
        }
      } catch (err) {
        console.error("Error fetching predictions:", err);
        setError("Failed to load predictions. Please try again later.");
      } finally {
        setLoadingPredictions(false);
      }
    };

    fetchPredictions();
  }, [API_BASE_URL]);

  // =========================================================
  // 2) Calculate average weekly percentage
  // =========================================================
  useEffect(() => {
    if (allPercentages.length > 0) {
      const total = allPercentages.reduce((sum, val) => sum + val, 0);
      const average = total / allPercentages.length;
      setAveragePercentage(average);
    }
  }, [allPercentages]);

  // =========================================================
  // 3) Fetch the main /predictions data (no interval/polling)
  // =========================================================
  useEffect(() => {
    const fetchLatestPredictions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/predictions`);
        setPredictions(response.data);
      } catch (err) {
        console.error("Error fetching predictions:", err);
        setError("Failed to load predictions. Please try again later.");
      }
    };

    fetchLatestPredictions();
  }, [API_BASE_URL]);

  // =========================================================
  // 4) Handle custom prediction by date
  // =========================================================
  const handlePredict = async () => {
    if (!dateInput) {
      alert("Please enter a date in the format YYYY-MM-DD");
      return;
    }

    setLoadingPredict(true);
    setPredictResult(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/predict/${dateInput}`);
      setPredictResult(response.data);
    } catch (err) {
      console.error("Error making prediction:", err);
      setPredictResult({
        //@ts-ignore
        return_val: "Error",
        was_correct: false,
        specific_date: dateInput,
        future_date: "",
        pct_change: "N/A",
        confidence: "N/A",
      });
    } finally {
      setLoadingPredict(false);
    }
  };

  // =========================================================
  // 5) Profit Calculator logic
  // =========================================================
  const handleCalculate = () => {
    if (averagePercentage === 0) {
      setCalculatedProfit(null);
      setCalculatedMonthlyProfit(null);
      return;
    }

    const weeklyGrowthMultiplier = 1 + averagePercentage / 100;
    const monthlyGrowthMultiplier = weeklyGrowthMultiplier ** 4;

    const potentialProfit = amount * leverage * (averagePercentage / 100);
    const monthlyProfit = amount * leverage * monthlyGrowthMultiplier - amount * leverage;

    setCalculatedProfit(potentialProfit);
    setCalculatedMonthlyProfit(monthlyProfit);
  };

  // =========================================================
  // 6) Helper functions for styling
  // =========================================================
  const getReturnValColor = (returnVal: string) => {
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

  // =========================================================
  // 7) Render predictions data
  // =========================================================
  //@ts-ignore
  const formatPredictionsData = (data) => {
    // Convert the data object to an array and sort by date descending
    const sortedData = Object.entries(data)
      // @ts-ignore
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
          {sortedData.map((prediction: any) => {
            // Determine correctness color
            const correctnessColor = prediction.was_correct
              ? "text-green-500"
              : "text-red-500";

            // Determine percentage change color
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

            return (
              <motion.div
                key={prediction.date}
                variants={itemVariants}
                exit="exit"
                className="min-w-[300px] mb-4 p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 flex-shrink-0"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{prediction.date}</h3>
                  <span className={`text-2xl ${getReturnValColor(prediction.return_val)}`}>
                    {getOutcomeIcon(prediction.return_val)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Prediction:</span>{" "}
                    <span className={correctnessColor}>{prediction.return_val}</span>
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
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    );
  };

  // =========================================================
  // 8) Render single prediction result
  // =========================================================
  const formatPredictResult = (result: any) => {
    if (!result) return null;

    const correctnessColor = result.was_correct
      ? "text-green-500"
      : "text-red-500";

    let pctChangeColor = "text-yellow-500";
    if (result.pct_change !== "N/A") {
      const pct = parseFloat(result.pct_change);
      if (pct > 0) {
        pctChangeColor = "text-green-500";
      } else if (pct < 0) {
        pctChangeColor = "text-red-500";
      }
    }

    return (
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-gray-100 p-6 rounded-lg shadow-md mt-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-2xl font-semibold">
            Prediction Result for {result.specific_date}
          </h4>
          <span className={`text-3xl ${getReturnValColor(result.return_val)}`}>
            {getOutcomeIcon(result.return_val)}
          </span>
        </div>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Prediction:</span>{" "}
            <span className={correctnessColor}>{result.return_val}</span>
          </div>
          <div>
            <span className="font-medium">Was Correct:</span>{" "}
            <span
              className={
                result.was_correct
                  ? "text-green-500 font-semibold"
                  : "text-red-500 font-semibold"
              }
            >
              {result.was_correct !== null
                ? result.was_correct
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

  // =========================================================
  // 9) Component JSX
  // =========================================================
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
      {/* <motion.div
        className="mb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Latest Predictions</h2>

        {loadingPredictions ? (
          <div className="flex justify-center items-center h-32">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : Object.keys(predictions).length > 0 ? (
          formatPredictionsData(predictions)
        ) : (
          <p className="text-gray-600">No predictions available.</p>
        )}
      </motion.div> */}

      {/* Profit Calculator */}
      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg mb-8"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
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
              ? `$${calculatedProfit.toFixed(2)}`
              : "N/A"}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Estimated Monthly Profit:</span>{" "}
            {calculatedMonthlyProfit !== null
              ? `$${calculatedMonthlyProfit.toFixed(2)}`
              : "N/A"}
          </p>
        </div>
      </motion.div>

      {/* Make a Prediction */}
      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
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
        {predictResult && (
          <div className="mt-6">
            {/* @ts-ignore */}
            {predictResult.return_val === "Error" ? (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline">
                  {" "}
                  Unable to make prediction. Please try again.
                </span>
              </motion.div>
            ) : (
              formatPredictResult(predictResult)
            )}
          </div>
        )}
      </motion.div>

      {/* Loader Styles */}
      <style jsx>{`
        .loader {
          border-top-color: #3490dc;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default Home;
