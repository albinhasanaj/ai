"use client"
// disable eslint
/* eslint-disable */
import React, { useState, useEffect } from 'react';

const Home = () => {
  const [predictions, setPredictions] = useState<any>(null);
  const [dateInput, setDateInput] = useState('');
  const [predictResult, setPredictResult] = useState('');


  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API}/predictions`)
      .then(res => res.json())
      .then(data => setPredictions(data))
      .catch(err => console.error(err));
  }, []);

  const handlePredict = () => {
    fetch(`${process.env.NEXT_PUBLIC_API}/predict/${dateInput}`)
      .then(res => res.text())
      .then(data => setPredictResult(formatPrediction(data)))
      .catch(err => console.error(err));
  };

  const formatPrediction = (data: string) => {
    return data
      .replace(/\u001b\[92m/g, '<span class="text-green-500 font-bold">')
      .replace(/\u001b\[93m/g, '<span class="text-yellow-500 font-bold">')
      .replace(/\u001b\[91m/g, '<span class="text-red-500 font-bold">')
      .replace(/\u001b\[0m/g, '</span>')
      .replace(/\n/g, '<br/>');
  };

  const formatPredictionsData = (data: any) => {
    return Object.entries(data).map(([date, prediction]: [string, any]) => (
      <div key={date} className="mb-4 p-4 bg-white rounded shadow-md">
        <h3 className="text-lg font-semibold mb-2">{date}</h3>
        <div dangerouslySetInnerHTML={{ __html: formatPrediction(prediction as string) }} />
      </div>
    ));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Predictions</h1>
      <div className="mb-6 flex flex-col-reverse">
        {predictions ? formatPredictionsData(predictions) : <p>Loading...</p>}
      </div>

      <div className="bg-white p-6 rounded shadow-md">
        <h3 className="text-xl font-semibold mb-2">Predict</h3>
        <input
          type="text"
          value={dateInput}
          onChange={e => setDateInput(e.target.value)}
          placeholder="YYYY-MM-DD"
          className="border p-2 rounded mb-4 w-full"
        />
        <button
          onClick={handlePredict}
          className="bg-blue-500 text-white p-2 rounded w-full mb-4"
        >
          Predict
        </button>
        <div className="bg-gray-100 p-4 rounded" dangerouslySetInnerHTML={{ __html: predictResult }} />
      </div>
    </div>
  );
};

export default Home;