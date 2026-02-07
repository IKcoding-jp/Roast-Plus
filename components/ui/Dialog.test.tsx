import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'テストダイアログ',
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本機能', () => {
    it('isOpen=trueでダイアログが表示される', () => {
      render(<Dialog {...defaultProps} />);
      expect(screen.getByText('テストダイアログ')).toBeInTheDocument();
    });

    it('isOpen=falseでダイアログが表示されない', () => {
      render(<Dialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('テストダイアログ')).not.toBeInTheDocument();
    });

    it('タイトルが表示される', () => {
      render(<Dialog {...defaultProps} title="確認" />);
      expect(screen.getByText('確認')).toBeInTheDocument();
    });

    it('説明文が表示される', () => {
      render(<Dialog {...defaultProps} description="この操作を実行しますか？" />);
      expect(screen.getByText('この操作を実行しますか？')).toBeInTheDocument();
    });
  });

  describe('ボタン', () => {
    it('デフォルトのボタンテキストが表示される', () => {
      render(<Dialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
    });

    it('カスタムボタンテキストが表示される', () => {
      render(<Dialog {...defaultProps} confirmText="実行" cancelText="やめる" />);
      expect(screen.getByRole('button', { name: '実行' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'やめる' })).toBeInTheDocument();
    });

    it('確認ボタンクリックでonConfirmが呼ばれる', () => {
      const onConfirm = vi.fn();
      render(<Dialog {...defaultProps} onConfirm={onConfirm} />);

      fireEvent.click(screen.getByRole('button', { name: 'OK' }));
      expect(onConfirm).toHaveBeenCalled();
    });

    it('キャンセルボタンクリックでonCloseが呼ばれる', () => {
      const onClose = vi.fn();
      render(<Dialog {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('ローディング状態', () => {
    it('isLoading=trueで「処理中...」が表示される', () => {
      render(<Dialog {...defaultProps} isLoading />);
      expect(screen.getByRole('button', { name: '処理中...' })).toBeInTheDocument();
    });

    it('isLoading=trueでボタンがdisabledになる', () => {
      render(<Dialog {...defaultProps} isLoading />);
      expect(screen.getByRole('button', { name: '処理中...' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeDisabled();
    });
  });

  describe('バリアント', () => {
    it('defaultバリアントのスタイルが適用される', () => {
      render(<Dialog {...defaultProps} variant="default" />);
      const confirmBtn = screen.getByRole('button', { name: 'OK' });
      expect(confirmBtn.className).toContain('bg-spot');
    });

    it('dangerバリアントのスタイルが適用される', () => {
      render(<Dialog {...defaultProps} variant="danger" />);
      const confirmBtn = screen.getByRole('button', { name: 'OK' });
      expect(confirmBtn.className).toContain('bg-danger');
    });

    it('dangerバリアントで警告アイコンが表示される', () => {
      const { container } = render(<Dialog {...defaultProps} variant="danger" />);
      // Warning アイコンのコンテナが存在することを確認
      const iconContainer = container.querySelector('.rounded-full.bg-danger-subtle');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('キーボード操作', () => {
    it('Escapeキーでダイアログが閉じる', () => {
      const onClose = vi.fn();
      render(<Dialog {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('isLoading=trueでEscapeキーが無効', () => {
      const onClose = vi.fn();
      render(<Dialog {...defaultProps} onClose={onClose} isLoading />);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('isOpen=falseではEscapeキーリスナーが登録されない', () => {
      const onClose = vi.fn();
      render(<Dialog {...defaultProps} isOpen={false} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
