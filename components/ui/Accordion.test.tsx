import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion';

describe('Accordion', () => {
  describe('基本機能', () => {
    it('正しくレンダリングされる', () => {
      render(
        <Accordion>
          <AccordionItem>
            <AccordionTrigger>セクション1</AccordionTrigger>
            <AccordionContent>コンテンツ1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('セクション1')).toBeInTheDocument();
    });

    it('デフォルトでコンテンツが閉じている', () => {
      render(
        <Accordion>
          <AccordionItem>
            <AccordionTrigger>セクション1</AccordionTrigger>
            <AccordionContent>コンテンツ1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.queryByText('コンテンツ1')).not.toBeInTheDocument();
    });

    it('トリガークリックでコンテンツが表示される', () => {
      render(
        <Accordion>
          <AccordionItem>
            <AccordionTrigger>セクション1</AccordionTrigger>
            <AccordionContent>コンテンツ1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      fireEvent.click(screen.getByText('セクション1'));
      expect(screen.getByText('コンテンツ1')).toBeInTheDocument();
    });

    it('トリガー再クリックでコンテンツが非表示になる', () => {
      render(
        <Accordion>
          <AccordionItem>
            <AccordionTrigger>セクション1</AccordionTrigger>
            <AccordionContent>コンテンツ1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      fireEvent.click(screen.getByText('セクション1'));
      expect(screen.getByText('コンテンツ1')).toBeInTheDocument();

      fireEvent.click(screen.getByText('セクション1'));
      expect(screen.queryByText('コンテンツ1')).not.toBeInTheDocument();
    });
  });

  describe('defaultOpen', () => {
    it('defaultOpen=trueで初期状態で開いている', () => {
      render(
        <Accordion>
          <AccordionItem defaultOpen>
            <AccordionTrigger>セクション1</AccordionTrigger>
            <AccordionContent>コンテンツ1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('コンテンツ1')).toBeInTheDocument();
    });
  });

  describe('複数アイテム', () => {
    it('複数のアイテムが独立して動作する', () => {
      render(
        <Accordion>
          <AccordionItem>
            <AccordionTrigger>セクション1</AccordionTrigger>
            <AccordionContent>コンテンツ1</AccordionContent>
          </AccordionItem>
          <AccordionItem>
            <AccordionTrigger>セクション2</AccordionTrigger>
            <AccordionContent>コンテンツ2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      // セクション1を開く
      fireEvent.click(screen.getByText('セクション1'));
      expect(screen.getByText('コンテンツ1')).toBeInTheDocument();
      expect(screen.queryByText('コンテンツ2')).not.toBeInTheDocument();

      // セクション2を開く（セクション1は開いたまま）
      fireEvent.click(screen.getByText('セクション2'));
      expect(screen.getByText('コンテンツ1')).toBeInTheDocument();
      expect(screen.getByText('コンテンツ2')).toBeInTheDocument();
    });
  });

  describe('AccordionTrigger', () => {
    it('aria-expandedが正しく設定される', () => {
      render(
        <Accordion>
          <AccordionItem>
            <AccordionTrigger>セクション1</AccordionTrigger>
            <AccordionContent>コンテンツ1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('通常モードのスタイルが適用される', () => {
      render(
        <Accordion>
          <AccordionItem>
            <AccordionTrigger>セクション1</AccordionTrigger>
            <AccordionContent>コンテンツ1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByRole('button').className).toContain('text-ink');
    });
  });

  describe('カスタムクラス', () => {
    it('AccordionにclassNameを適用できる', () => {
      const { container } = render(
        <Accordion className="custom-accordion">
          <AccordionItem>
            <AccordionTrigger>セクション1</AccordionTrigger>
            <AccordionContent>コンテンツ1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(container.firstChild).toHaveClass('custom-accordion');
    });

    it('AccordionItemにclassNameを適用できる', () => {
      render(
        <Accordion>
          <AccordionItem className="custom-item" data-testid="item">
            <AccordionTrigger>セクション1</AccordionTrigger>
            <AccordionContent>コンテンツ1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByTestId('item')).toHaveClass('custom-item');
    });
  });

  describe('ref転送', () => {
    it('Accordionにrefが転送される', () => {
      const ref = vi.fn();
      render(
        <Accordion ref={ref}>
          <AccordionItem>
            <AccordionTrigger>セクション1</AccordionTrigger>
            <AccordionContent>コンテンツ1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
    });
  });
});
