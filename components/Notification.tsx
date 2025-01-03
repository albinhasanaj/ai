// components/Notification.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
}

const Notification: React.FC<NotificationProps> = ({ message, type }) => {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="text-green-500 mr-2" />;
            case 'error':
                return <FaExclamationCircle className="text-red-500 mr-2" />;
            default:
                return null;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-100 border-green-400 text-green-700';
            case 'error':
                return 'bg-red-100 border-red-400 text-red-700';
            default:
                return 'bg-gray-100 border-gray-400 text-gray-700';
        }
    };

    return (
        <motion.div
            className={`border px-4 py-3 rounded relative mb-4 ${getBgColor()}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <span className="flex items-center">
                {getIcon()}
                {message}
            </span>
        </motion.div>
    );
};

export default Notification;
