import { motion } from 'framer-motion';
import { DataManagement } from '@/components/coffee-quiz/DataManagement';

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

interface DataManagementSectionProps {
  onResetClick: () => void;
}

export function DataManagementSection({ onResetClick }: DataManagementSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-5 border border-rose-100"
    >
      <h2 className="font-bold text-[#211714] mb-3 flex items-center gap-2">
        <span className="text-rose-500">
          <TrashIcon />
        </span>
        データ管理
      </h2>

      {/* バックアップ・リストア */}
      <div className="mb-4">
        <DataManagement />
      </div>

      <p className="text-[#3A2F2B]/70 text-sm mb-4">
        学習データをリセットして、最初からやり直すことができます。
      </p>

      <button
        onClick={onResetClick}
        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 py-3 px-4 rounded-xl font-semibold transition-colors border border-rose-200 flex items-center justify-center gap-2"
      >
        <TrashIcon />
        データをリセット
      </button>
    </motion.div>
  );
}
