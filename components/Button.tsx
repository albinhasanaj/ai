import { HTMLMotionProps, motion } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, isLoading, ...props }) => (
    <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`bg-blue-500 text-white p-4 rounded mb-6 hover:bg-blue-600 transition-colors ${props.disabled ? 'cursor-not-allowed opacity-50' : ''
            }`}
        {...props}
    >
        {isLoading ? 'Loading...' : children}
    </motion.button>
);

export default Button;