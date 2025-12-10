'use client';

import React from 'react';
import { Warning } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'OK',
    cancelText = 'キャンセル',
    onConfirm,
    onCancel,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={onCancel}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={onCancel}
                    >
                        <div
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <Warning size={24} className="text-red-600" weight="fill" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {message}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
