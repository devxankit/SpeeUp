import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import loadingAnimation from '../../../assets/animation/Loading screen.json';
import { useLoading } from '../../context/LoadingContext';
import './iconLoader.css';

interface IconLoaderProps {
  forceShow?: boolean;
}

const IconLoader: React.FC<IconLoaderProps> = ({ forceShow = false }) => {
  const { isLoading } = useLoading();
  const show = isLoading || forceShow;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="global-loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="loader-container">
            <div className="lottie-wrapper">
              <Lottie
                animationData={loadingAnimation}
                loop={true}
                className="loader-lottie"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IconLoader;
