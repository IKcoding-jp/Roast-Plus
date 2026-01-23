'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportQuizProgress, importQuizProgress } from '@/lib/localStorage';

interface DataManagementProps {
  onImportSuccess?: () => void;
}

// ダウンロードアイコン
const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// アップロードアイコン
const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// チェックアイコン
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// アラートアイコン
const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

type MessageType = 'success' | 'error' | null;

interface Message {
  type: MessageType;
  text: string;
}

export function DataManagement({ onImportSuccess }: DataManagementProps) {
  const [message, setMessage] = useState<Message>({ type: null, text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // エクスポート処理
  const handleExport = () => {
    const jsonData = exportQuizProgress();
    if (!jsonData) {
      setMessage({ type: 'error', text: 'エクスポートするデータがありません' });
      return;
    }

    // ファイルとしてダウンロード
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `roastplus-quiz-data-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setMessage({ type: 'success', text: 'データをエクスポートしました' });
    setTimeout(() => setMessage({ type: null, text: '' }), 3000);
  };

  // インポート処理
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importQuizProgress(content);

      if (result.success) {
        setMessage({ type: 'success', text: 'データをインポートしました。ページをリロードします...' });
        onImportSuccess?.();
        // リロードしてデータを反映
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'インポートに失敗しました' });
      }
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'ファイルの読み込みに失敗しました' });
    };
    reader.readAsText(file);

    // 同じファイルを再選択できるようにリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#211714]/5 p-4">
      <h3 className="text-sm font-semibold text-[#211714] mb-3">
        データ管理
      </h3>
      <p className="text-xs text-[#3A2F2B]/60 mb-4">
        データのバックアップや他の端末への移行ができます
      </p>

      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="flex-1 flex items-center justify-center gap-2 bg-[#FDF8F0] hover:bg-[#F5EFE6] text-[#3A2F2B] py-2.5 px-4 rounded-xl text-sm font-medium transition-colors border border-[#211714]/10"
        >
          <DownloadIcon />
          エクスポート
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 bg-[#FDF8F0] hover:bg-[#F5EFE6] text-[#3A2F2B] py-2.5 px-4 rounded-xl text-sm font-medium transition-colors border border-[#211714]/10"
        >
          <UploadIcon />
          インポート
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {/* メッセージ表示 */}
      <AnimatePresence>
        {message.type && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-3 flex items-center gap-2 text-sm py-2 px-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {message.type === 'success' ? <CheckIcon /> : <AlertIcon />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
