// types/index.ts

export interface CandleData {
    adx: number;
    atr_14: number;
    bb_bbh: number;
    bb_bbl: number;
    bb_bbm: number;
    close: number;
    confidence: string;
    ema_12: number;
    ema_26: number;
    high: number;
    id: number;
    low: number;
    macd: number;
    macd_diff: number;
    obv: number;
    open: number;
    psar: number;
    roc_12: number;
    rsi_14: number;
    sentiment: number;
    timestamp: string;
    volume: number;
    y?: number;
}

export interface SequenceData {
    monthly: CandleData[];
    weekly: CandleData[];
    daily: CandleData[];
    fourhourly: CandleData[];
    hourly: CandleData[];
}

export interface Prediction {
    confidence: string;
    future_date: string;
    pct_change: string;
    prediction: "Up" | "Down" | "Neutral" | "Error"; // Added "Error" type
    specific_date: string;
    was_correct: boolean | null;
    sequence: SequenceData;
}

export interface PredictionsResponse {
    [date: string]: Prediction;
}

export interface LatestDataResponse {
    status: number;
}
