import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

const ErrorModal = ({ isOpen, title, message, onClose, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Box */}
        <motion.div
          className={`relative w-full max-w-md mx-4 rounded-2xl shadow-lg overflow-hidden border-l-4 border-red-500 ${
            isDarkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900"
          }`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-600/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={22} />
              <h3 className="text-lg font-semibold">
                {title || "Error Occurred"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-1 rounded-full hover:bg-slate-700/20 ${
                isDarkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 text-center">
            <p className="text-sm opacity-90">{message || "Something went wrong. Please try again."}</p>
          </div>

          {/* Footer */}
          <div className="flex justify-center p-4 border-t border-slate-600/30">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorModal;
