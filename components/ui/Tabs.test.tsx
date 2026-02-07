import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

describe('Tabs', () => {
  describe('基本機能', () => {
    it('正しくレンダリングされる', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
          <TabsContent value="tab2">コンテンツ2</TabsContent>
        </Tabs>
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(2);
    });

    it('defaultValueで初期タブが選択される', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
          <TabsContent value="tab2">コンテンツ2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('コンテンツ1')).toBeInTheDocument();
      expect(screen.queryByText('コンテンツ2')).not.toBeInTheDocument();
    });

    it('タブクリックでコンテンツが切り替わる', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
          <TabsContent value="tab2">コンテンツ2</TabsContent>
        </Tabs>
      );

      fireEvent.click(screen.getByRole('tab', { name: 'タブ2' }));

      expect(screen.queryByText('コンテンツ1')).not.toBeInTheDocument();
      expect(screen.getByText('コンテンツ2')).toBeInTheDocument();
    });
  });

  describe('制御されたコンポーネント', () => {
    it('valueでタブを制御できる', () => {
      render(
        <Tabs defaultValue="tab1" value="tab2">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
          <TabsContent value="tab2">コンテンツ2</TabsContent>
        </Tabs>
      );

      expect(screen.queryByText('コンテンツ1')).not.toBeInTheDocument();
      expect(screen.getByText('コンテンツ2')).toBeInTheDocument();
    });

    it('onValueChangeがタブ切り替え時に呼ばれる', () => {
      const handleValueChange = vi.fn();
      render(
        <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
          <TabsContent value="tab2">コンテンツ2</TabsContent>
        </Tabs>
      );

      fireEvent.click(screen.getByRole('tab', { name: 'タブ2' }));
      expect(handleValueChange).toHaveBeenCalledWith('tab2');
    });
  });

  describe('TabsTrigger', () => {
    it('選択されたタブにaria-selected=trueが設定される', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(screen.getByRole('tab', { name: 'タブ1' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: 'タブ2' })).toHaveAttribute('aria-selected', 'false');
    });

    it('選択されたタブのスタイルが適用される（通常モード）', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(screen.getByRole('tab', { name: 'タブ1' }).className).toContain('tab-active');
      expect(screen.getByRole('tab', { name: 'タブ2' }).className).toContain('text-ink-sub');
    });
  });

  describe('TabsContent', () => {
    it('role=tabpanelが設定される', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
        </Tabs>
      );

      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('非選択タブのコンテンツは表示されない', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
          <TabsContent value="tab2">コンテンツ2</TabsContent>
        </Tabs>
      );

      expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    });
  });

  describe('カスタムクラス', () => {
    it('TabsにclassNameを適用できる', () => {
      const { container } = render(
        <Tabs defaultValue="tab1" className="custom-tabs">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(container.firstChild).toHaveClass('custom-tabs');
    });

    it('TabsListにclassNameを適用できる', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-list">
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(screen.getByRole('tablist')).toHaveClass('custom-list');
    });
  });
});
