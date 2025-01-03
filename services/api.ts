// services/api.ts

import axios from 'axios';
import { PredictionsResponse, Prediction } from '../types';

// Define the base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API;

// Fetch all predictions
export const fetchPredictions = async (): Promise<PredictionsResponse> => {
    const response = await axios.get<PredictionsResponse>(`${API_BASE_URL}/predictions`);
    return response.data;
};

// Fetch a prediction by date
export const fetchPredictionByDate = async (date: string): Promise<Prediction> => {
    const response = await axios.get<Prediction>(`${API_BASE_URL}/predict/${date}`);
    return response.data;
};

// **New Function: Fetch Latest Data**
export const fetchLatestData = async (): Promise<string> => {
    const response = await axios.get(`${API_BASE_URL}/latest_data`);
    return response.data;
};
