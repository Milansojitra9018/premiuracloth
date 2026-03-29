"use client";
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = true
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-bg w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-line"
          >
            <div className="p-6 border-b border-line flex justify-between items-center bg-ink/5">
              <div className="flex items-center space-x-3">
                <div className={`${isDanger ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'} p-2 rounded-xl`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-ink">{title}</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-bg rounded-full transition-all text-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <p className="text-sm text-muted leading-relaxed">
                {message}
              </p>
            </div>

            <div className="p-6 bg-ink/5 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-2xl font-bold text-sm text-ink bg-bg border border-line hover:bg-ink/5 transition-all"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-6 py-3 rounded-2xl font-bold text-sm text-bg transition-all shadow-lg hover:shadow-xl active:scale-[0.98] ${
                  isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-ink hover:opacity-90'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
