// components/SequenceDataView.tsx

import React, { useState, useEffect } from 'react';
import { SequenceData, CandleData } from '../types';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface SequenceDataViewProps {
    sequence: SequenceData;
}

interface Indicator {
    key: keyof CandleData;
    name: string;
    color: string;
    yAxisId: string;
}

const SequenceDataView: React.FC<SequenceDataViewProps> = ({ sequence }) => {
    const timeframes: (keyof SequenceData)[] = ['hourly', 'fourhourly', 'daily', 'weekly', 'monthly'];

    const [openTimeframe, setOpenTimeframe] = useState<keyof SequenceData | null>(null);
    const [availableIndicators, setAvailableIndicators] = useState<Indicator[]>([]);
    const [selectedIndicators, setSelectedIndicators] = useState<Indicator[]>([]);

    // Load selected indicators from localStorage on mount
    useEffect(() => {
        const storedIndicators = localStorage.getItem('selectedIndicators');
        if (storedIndicators) {
            try {
                const parsed: Indicator[] = JSON.parse(storedIndicators);
                setSelectedIndicators(parsed);
            } catch (error) {
                console.error('Failed to parse selectedIndicators from localStorage:', error);
            }
        }
    }, []);

    // Save selected indicators to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('selectedIndicators', JSON.stringify(selectedIndicators));
    }, [selectedIndicators]);

    // Determine available indicators based on the first non-empty timeframe
    useEffect(() => {
        const indicators: Indicator[] = [];
        for (const tf of timeframes) {
            const sampleData = sequence[tf];
            if (sampleData.length > 0) {
                const dataKeys = Object.keys(sampleData[0]) as (keyof CandleData)[];
                dataKeys.forEach((key) => {
                    if (
                        !['open', 'high', 'low', 'close', 'volume', 'timestamp', 'id', 'y'].includes(key) &&
                        typeof sampleData[0][key] === 'number'
                    ) {
                        indicators.push({
                            key,
                            name: key.toUpperCase(),
                            color: getIndicatorColor(key),
                            yAxisId: `right-${key}`,
                        });
                    }
                });
                break; // Only need to extract from the first non-empty timeframe
            }
        }
        setAvailableIndicators(indicators);
    }, [sequence, timeframes]);

    const getIndicatorColor = (key: keyof CandleData): string => {
        const colors: { [key in keyof CandleData]?: string } = {
            ema_12: '#FF0000',
            ema_26: '#0000FF',
            rsi_14: '#00FF00',
            macd: '#FFA500',
            adx: '#800080',
            atr_14: '#008080',
            bb_bbh: '#FFC0CB',
            bb_bbl: '#FFD700',
            bb_bbm: '#A52A2A',
            obv: '#00FFFF',
            psar: '#808080',
            roc_12: '#FF00FF',
            sentiment: '#000000',
        };
        return colors[key] || '#000000';
    };

    const handleIndicatorChange = (indicator: Indicator) => {
        setSelectedIndicators((prev) => {
            if (prev.find((ind) => ind.key === indicator.key)) {
                return prev.filter((ind) => ind.key !== indicator.key);
            } else {
                return [...prev, indicator];
            }
        });
    };

    const prepareChartData = (data: CandleData[]) => {
        const preparedData = data.map((candle) => ({
            date: new Date(candle.timestamp).toLocaleString(),
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close, // Ensure the key is lowercase 'close'
            volume: candle.volume,
            // Add selected indicators
            ...selectedIndicators.reduce((acc, indicator) => {

                acc[indicator.name] = candle[indicator.key] as number;
                return acc;
            }, {} as { [key: string]: number }),
        }));
        console.log('Prepared Chart Data:', preparedData); // For debugging
        return preparedData;
    };

    // Function to calculate domain for a given data key with padding
    const calculateDomain = (data: CandleData[], key: keyof CandleData): [number, number] => {
        const values = data.map((d) => d[key]).filter((value): value is number => value !== undefined);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.1; // 10% padding
        return [min - padding, max + padding];
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-700">Model Sequences</h2>
                <div className="w-full mt-4 md:mt-0">
                    {availableIndicators.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center">
                            <span className="text-gray-700 font-medium mb-2 sm:mb-0 sm:mr-4">Indicators:</span>
                            {/* Container for Indicators */}
                            <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                {availableIndicators.map((indicator) => (
                                    <label key={indicator.key} className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={selectedIndicators.some((ind) => ind.key === indicator.key)}
                                            onChange={() => handleIndicatorChange(indicator)}
                                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        {indicator.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-4">
                {timeframes.map((tf) => (
                    <div key={tf}>
                        <button
                            onClick={() => setOpenTimeframe(openTimeframe === tf ? null : tf)}
                            className="w-full text-left bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <span className="font-medium">{tf.charAt(0).toUpperCase() + tf.slice(1)} ({sequence[tf].length})</span>
                            <span className="text-xl">{openTimeframe === tf ? '-' : '+'}</span>
                        </button>
                        <AnimatePresence>
                            {openTimeframe === tf && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-inner">
                                        <ResponsiveContainer width="100%" height={400}>
                                            <LineChart data={prepareChartData(sequence[tf])}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                                {/* Primary Y-Axis for Close Price */}
                                                <YAxis
                                                    yAxisId="left"
                                                    domain={calculateDomain(sequence[tf], 'close')}
                                                    tick={{ fontSize: 12 }}
                                                    allowDecimals={false}
                                                />
                                                {/* Secondary Y-Axes for Indicators */}
                                                {selectedIndicators.map((indicator, index) => (
                                                    <YAxis
                                                        key={indicator.yAxisId}
                                                        yAxisId={indicator.yAxisId}
                                                        orientation="right"
                                                        domain={calculateDomain(sequence[tf], indicator.key)}
                                                        tick={{ fontSize: 12 }}
                                                        allowDecimals={false}
                                                        mirror={true}
                                                        axisLine={index < 2} // Show axis lines for first two indicators
                                                        tickLine={index < 2} // Show tick lines for first two indicators
                                                        offset={index * 60} // Offset to prevent overlap
                                                    />
                                                ))}
                                                <Tooltip />
                                                <Legend verticalAlign="top" height={36} />
                                                {/* Main Line for Close Price */}
                                                <Line
                                                    type="monotone"
                                                    dataKey="close"
                                                    stroke="#8884d8"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{ r: 8 }}
                                                    name="Close Price"
                                                    yAxisId="left"
                                                />
                                                {/* Lines for Selected Indicators */}
                                                {selectedIndicators.map((indicator) => (
                                                    <Line
                                                        key={indicator.key}
                                                        type="monotone"
                                                        dataKey={indicator.name}
                                                        stroke={indicator.color}
                                                        strokeWidth={2}
                                                        dot={false}
                                                        activeDot={{ r: 8 }}
                                                        name={indicator.name}
                                                        yAxisId={indicator.yAxisId}
                                                    />
                                                ))}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SequenceDataView;
