// components/Loader.tsx

import React from 'react';
import { motion } from 'framer-motion';

const Loader: React.FC = () => (
    <div className="flex justify-center items-center h-32">
        <motion.div
            className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
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

export default Loader;
