import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, isDarkMode }) => {
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
          onClick={onCancel}
        />

        {/* Modal Box */}
        <motion.div
          className={`relative w-full max-w-md mx-4 rounded-2xl shadow-lg overflow-hidden ${
            isDarkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900"
          }`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-600/30">
            <h3 className="text-lg font-semibold">{title || "Confirm Action"}</h3>
            <button
              onClick={onCancel}
              className={`p-1 rounded-full hover:bg-slate-700/20 ${
                isDarkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 text-center">
            <p className="text-sm opacity-90">{message || "Are you sure you want to proceed?"}</p>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 p-4 border-t border-slate-600/30">
            <button
              onClick={onCancel}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isDarkMode
                  ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-800"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
