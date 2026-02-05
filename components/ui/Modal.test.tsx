import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  describe('表示/非表示', () => {
    it('show=trueでコンテンツが表示される', () => {
      render(
        <Modal show={true} onClose={() => {}}>
          <div>モーダルコンテンツ</div>
        </Modal>
      );
      expect(screen.getByText('モーダルコンテンツ')).toBeInTheDocument();
    });

    it('show=falseでコンテンツが表示されない', () => {
      render(
        <Modal show={false} onClose={() => {}}>
          <div>モーダルコンテンツ</div>
        </Modal>
      );
      expect(screen.queryByText('モーダルコンテンツ')).not.toBeInTheDocument();
    });
  });

  describe('Backdropクリック', () => {
    it('Backdropクリックでoncloseが呼ばれる（デフォルト）', () => {
      const handleClose = vi.fn();
      render(
        <Modal show={true} onClose={handleClose}>
          <div>コンテンツ</div>
        </Modal>
      );

      // Backdropをクリック（コンテンツの親要素）
      const backdrop = screen.getByText('コンテンツ').parentElement?.parentElement;
      if (backdrop) {
        fireEvent.click(backdrop);
      }
      expect(handleClose).toHaveBeenCalled();
    });

    it('closeOnBackdropClick=falseでBackdropクリックが無効', () => {
      const handleClose = vi.fn();
      render(
        <Modal show={true} onClose={handleClose} closeOnBackdropClick={false}>
          <div>コンテンツ</div>
        </Modal>
      );

      const backdrop = screen.getByText('コンテンツ').parentElement?.parentElement;
      if (backdrop) {
        fireEvent.click(backdrop);
      }
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('コンテンツクリックでonCloseが呼ばれない', () => {
      const handleClose = vi.fn();
      render(
        <Modal show={true} onClose={handleClose}>
          <div>コンテンツ</div>
        </Modal>
      );

      fireEvent.click(screen.getByText('コンテンツ'));
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('カスタムクラス', () => {
    it('contentClassNameでコンテンツのスタイルをカスタマイズできる', () => {
      render(
        <Modal show={true} onClose={() => {}} contentClassName="custom-modal-class">
          <div>コンテンツ</div>
        </Modal>
      );

      const contentWrapper = screen.getByText('コンテンツ').parentElement;
      expect(contentWrapper).toHaveClass('custom-modal-class');
    });
  });

  describe('children', () => {
    it('複雑なchildrenを正しく表示する', () => {
      render(
        <Modal show={true} onClose={() => {}}>
          <h2>タイトル</h2>
          <p>説明文</p>
          <button type="button">アクション</button>
        </Modal>
      );

      expect(screen.getByText('タイトル')).toBeInTheDocument();
      expect(screen.getByText('説明文')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'アクション' })).toBeInTheDocument();
    });
  });
});
