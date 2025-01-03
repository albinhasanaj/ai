// pages/admin.tsx

"use client";
import React, { useState } from 'react';
import { fetchLatestData } from '@/services/api';
import Button from '@/components/Button';
import Notification from '@/components/Notification';


const Admin: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleFetchLatestData = async () => {
        setIsLoading(true);
        setNotification(null);

        try {
            const response = await fetchLatestData();
            // console.log("Response:", response);
            if (response == "200") {
                setNotification({ message: 'Latest data fetched successfully!', type: 'success' });
            } else {
                setNotification({ message: `Unexpected response status: ${response}`, type: 'error' });
            }
        } catch (error) {
            console.error('Error fetching latest data:', error);
            setNotification({ message: 'Failed to fetch latest data. Please try again.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-6 text-center text-blue-700">Admin Panel</h1>

            {notification && <Notification message={notification.message} type={notification.type} />}

            <Button onClick={handleFetchLatestData} isLoading={isLoading} disabled={isLoading}>
                Fetch Latest Data
            </Button>
        </div>
    );
};

export default Admin;
