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
 */

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
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
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value: controlledValue, onValueChange, children, className = '', ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const value = controlledValue ?? internalValue;

    const setValue = (newValue: string) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };

    return (
      <TabsContext.Provider value={{ value, setValue }}>
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
    return (
      <div ref={ref} className={`flex rounded-lg bg-ground p-1 ${className}`} role="tablist" {...props}>
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
    const { value: selectedValue, setValue } = useTabsContext();
    const isSelected = value === selectedValue;

    const baseStyles = 'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 min-h-[40px]';

    const variantStyles = isSelected
      ? 'tab-active shadow-sm'
      : 'text-ink-sub hover:text-ink hover:bg-ground';

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
