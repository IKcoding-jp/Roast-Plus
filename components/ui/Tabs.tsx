'use client';

import { forwardRef, createContext, useContext, useState } from 'react';

/**
 * タブコンポーネント
 *
 * @example
 * // 基本的な使用方法
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">タブ1</TabsTrigger>
 *     <TabsTrigger value="tab2">タブ2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">タブ1の内容</TabsContent>
 *   <TabsContent value="tab2">タブ2の内容</TabsContent>
 * </Tabs>
 *
 * @example
 * // クリスマスモード
 * const { isChristmasMode } = useChristmasMode();
 * <Tabs defaultValue="today" isChristmasMode={isChristmasMode}>
 *   <TabsList>
 *     <TabsTrigger value="today">本日</TabsTrigger>
 *     <TabsTrigger value="all">すべて</TabsTrigger>
 *   </TabsList>
 *   ...
 * </Tabs>
 */

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  isChristmasMode: boolean;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

// Tabs Root
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** デフォルトで選択されるタブの値 */
  defaultValue: string;
  /** 制御された値 */
  value?: string;
  /** 値が変更されたときのコールバック */
  onValueChange?: (value: string) => void;
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value: controlledValue, onValueChange, isChristmasMode = false, children, className = '', ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const value = controlledValue ?? internalValue;

    const setValue = (newValue: string) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };

    return (
      <TabsContext.Provider value={{ value, setValue, isChristmasMode }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = 'Tabs';

// TabsList
export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className = '', ...props }, ref) => {
    const { isChristmasMode } = useTabsContext();

    const listStyles = isChristmasMode
      ? 'flex rounded-lg bg-white/10 p-1'
      : 'flex rounded-lg bg-gray-100 p-1';

    return (
      <div ref={ref} className={`${listStyles} ${className}`} role="tablist" {...props}>
        {children}
      </div>
    );
  }
);
TabsList.displayName = 'TabsList';

// TabsTrigger
export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** このタブの値 */
  value: string;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children, className = '', ...props }, ref) => {
    const { value: selectedValue, setValue, isChristmasMode } = useTabsContext();
    const isSelected = value === selectedValue;

    const baseStyles = 'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 min-h-[40px]';

    const normalStyles = isSelected
      ? 'bg-white text-gray-900 shadow-sm'
      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50';

    const christmasStyles = isSelected
      ? 'bg-[#d4af37]/20 text-[#d4af37] shadow-sm'
      : 'text-[#f8f1e7]/70 hover:text-[#f8f1e7] hover:bg-white/5';

    const variantStyles = isChristmasMode ? christmasStyles : normalStyles;

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isSelected}
        onClick={() => setValue(value)}
        className={`${baseStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

// TabsContent
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** このコンテンツの値 */
  value: string;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, children, className = '', ...props }, ref) => {
    const { value: selectedValue } = useTabsContext();

    if (value !== selectedValue) {
      return null;
    }

    return (
      <div ref={ref} role="tabpanel" className={className} {...props}>
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';
