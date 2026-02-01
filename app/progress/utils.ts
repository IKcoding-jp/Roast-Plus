import type { WorkProgress } from '@/types';

export const getProgressBarColor = (percentage: number) => {
  if (percentage >= 100) return 'bg-green-500';
  if (percentage >= 50) return 'bg-amber-500';
  return 'bg-gray-400';
};

export const calculateProgressPercentage = (wp: WorkProgress) => {
  if (wp.targetAmount !== undefined && wp.targetAmount > 0) {
    return ((wp.currentAmount || 0) / wp.targetAmount) * 100;
  }
  return 0;
};

export const calculateRemaining = (wp: WorkProgress) => {
  if (wp.targetAmount !== undefined) {
    return Math.max(0, wp.targetAmount - (wp.currentAmount || 0));
  }
  return 0;
};

export const formatAmount = (amount: number, unit: string) => {
  void unit;
  return amount.toLocaleString('ja-JP');
};

export const extractUnit = (weight: string | undefined) => {
  if (!weight) return '';
  const match = weight.match(/[^\d.,\s]+/);
  return match ? match[0] : '';
};

export const formatDateTime = (dateString?: string) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
