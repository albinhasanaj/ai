"use client"
import React, { useState } from 'react';

const Admin = () => {
    const [isLoading, setIsLoading] = useState(false);

    const fetchLatestData = () => {
        setIsLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API}/latest_data`)
            .then(res => res.json())
            .then(() => setIsLoading(false))
            .catch(err => console.error(err));
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-6 text-center text-blue-700">Admin Panel</h1>
            <button
                onClick={fetchLatestData}
                className="bg-blue-500 text-white p-4 rounded mb-6 hover:bg-blue-600 transition-colors"
            >
                {isLoading ? 'Loading...' : 'Fetch Latest Data'}
            </button>
        </div>
    );
};

export default Admin;
