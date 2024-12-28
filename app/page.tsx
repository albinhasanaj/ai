"use client";
// Disable eslint
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaArrowUp,
  FaArrowDown,
  FaArrowRight,
  FaExclamationTriangle,
  FaTimes,
} from 'react-icons/fa';

const Home = () => {
  const [predictions, setPredictions] = useState({});
  const [dateInput, setDateInput] = useState('');
  const [predictResult, setPredictResult] = useState(null);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API;

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/predictions`);
        setPredictions(response.data);
      } catch (err) {
        console.error('Error fetching predictions:', err);
        setError('Failed to load predictions. Please try again later.');
      } finally {
        setLoadingPredictions(false);
      }
    };

    fetchPredictions();

    // Polling to refresh predictions every hour
    const interval = setInterval(fetchPredictions, 60 * 60 * 1000); // every hour
    return () => clearInterval(interval);
  }, [API_BASE_URL]);

  const handlePredict = async () => {
    if (!dateInput) {
      alert('Please enter a date in the format YYYY-MM-DD');
      return;
    }

    setLoadingPredict(true);
    setPredictResult(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/predict/${dateInput}`);
      setPredictResult(response.data);
    } catch (err) {
      console.error('Error making prediction:', err);
      setPredictResult({
        //@ts-ignore
        return_val: 'Error',
        was_correct: false,
        specific_date: dateInput,
        future_date: '',
        pct_change: 'N/A',
        confidence: 'N/A',
      });
    } finally {
      setLoadingPredict(false);
    }
  };

  const getReturnValColor = (returnVal: any) => {
    switch (returnVal) {
      case 'Up':
        return 'text-green-500';
      case 'Down':
        return 'text-red-500';
      case 'Neutral':
        return 'text-yellow-500';
      case 'No Future Data':
        return 'text-gray-500';
      case 'Error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getOutcomeIcon = (returnVal: any) => {
    switch (returnVal) {
      case 'Up':
        return <FaArrowUp className="inline-block" />;
      case 'Down':
        return <FaArrowDown className="inline-block" />;
      case 'Neutral':
        return <FaArrowRight className="inline-block" />;
      case 'No Future Data':
        return <FaExclamationTriangle className="inline-block" />;
      case 'Error':
        return <FaTimes className="inline-block" />;
      default:
        return null;
    }
  };

  //@ts-ignore
  const formatPredictionsData = (data) => {
    // Convert the data object to an array and sort by date descending
    const sortedData = Object.entries(data)
      //@ts-ignore
      .map(([date, prediction]) => ({ date, ...prediction }))
      //@ts-ignore
      .sort((a, b) => new Date(b.specific_date) - new Date(a.specific_date));

    return sortedData.map((prediction) => {
      // Determine colors based on prediction correctness
      const correctnessColor = prediction.was_correct
        ? 'text-green-500'
        : 'text-red-500';

      // Determine color based on percentage change
      let pctChangeColor = 'text-yellow-500';
      if (prediction.pct_change !== 'N/A') {
        const pct = parseFloat(prediction.pct_change);
        if (pct > 0) {
          pctChangeColor = 'text-green-500';
        } else if (pct < 0) {
          pctChangeColor = 'text-red-500';
        }
      }

      return (
        <div
          key={prediction.date}
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
              <span className="font-medium">Prediction:</span>{' '}
              <span className={correctnessColor}>{prediction.return_val}</span>
            </div>
            <div>
              <span className="font-medium">Was Correct:</span>{' '}
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
              <span className="font-medium">Future Date:</span>{' '}
              {prediction.future_date || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Percentage Change:</span>{' '}
              <span className={pctChangeColor}>
                {prediction.pct_change}
              </span>
            </div>
            <div>
              <span className="font-medium">Confidence:</span>{' '}
              {prediction.confidence}
            </div>
          </div>
        </div>
      );
    });
  };

  const formatPredictResult = (result: any) => {
    if (!result) return null;

    // Determine colors based on prediction correctness
    const correctnessColor = result.was_correct
      ? 'text-green-500'
      : 'text-red-500';

    // Determine color based on percentage change
    let pctChangeColor = 'text-yellow-500';
    if (result.pct_change !== 'N/A') {
      const pct = parseFloat(result.pct_change);
      if (pct > 0) {
        pctChangeColor = 'text-green-500';
      } else if (pct < 0) {
        pctChangeColor = 'text-red-500';
      }
    }

    return (
      <div className="bg-gray-100 p-6 rounded-lg shadow-md mt-6">
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
            <span className="font-medium">Prediction:</span>{' '}
            <span className={correctnessColor}>{result.return_val}</span>
          </div>
          <div>
            <span className="font-medium">Was Correct:</span>{' '}
            <span
              className={
                result.was_correct
                  ? 'text-green-500 font-semibold'
                  : 'text-red-500 font-semibold'
              }
            >
              {result.was_correct !== null
                ? result.was_correct
                  ? 'Yes'
                  : 'No'
                : 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-medium">Future Date:</span>{' '}
            {result.future_date || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Percentage Change:</span>{' '}
            <span className={pctChangeColor}>{result.pct_change}</span>
          </div>
          <div>
            <span className="font-medium">Confidence:</span>{' '}
            {result.confidence}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Bitcoin Market Predictions
      </h1>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Latest Predictions
        </h2>
        {loadingPredictions ? (
          <div className="flex justify-center items-center h-32">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : Object.keys(predictions).length > 0 ? (
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {formatPredictionsData(predictions)}
          </div>
        ) : (
          <p className="text-gray-600">No predictions available.</p>
        )}
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg">
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
          <button
            onClick={handlePredict}
            className={`bg-blue-600 text-white p-3 rounded-lg w-full md:w-auto hover:bg-blue-700 transition-colors duration-300 ${loadingPredict ? 'cursor-not-allowed opacity-50' : ''
              }`}
            disabled={loadingPredict}
          >
            {loadingPredict ? 'Predicting...' : 'Predict'}
          </button>
        </div>
        {predictResult && (
          <div className="mt-6">
            {/* @ts-ignore */}
            {predictResult.return_val === 'Error' ? (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline">
                  {' '}
                  Unable to make prediction. Please try again.
                </span>
              </div>
            ) : (
              formatPredictResult(predictResult)
            )}
          </div>
        )}
      </div>

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
    </div>
  );
};

export default Home;