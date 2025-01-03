// components/ErrorMessage.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
    <motion.div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {message}</span>
        {/* Optional: Add a close button */}
        <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <FaTimes className="fill-current h-6 w-6 text-red-500 cursor-pointer" />
        </span>
    </motion.div>
);

export default ErrorMessage;
