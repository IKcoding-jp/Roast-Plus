'use client';

import { forwardRef, createContext, useContext, useState } from 'react';
import { HiChevronDown } from 'react-icons/hi';

/**
 * アコーディオンコンポーネント
 *
 * @example
 * // 基本的な使用方法
 * <Accordion>
 *   <AccordionItem>
 *     <AccordionTrigger>セクション1</AccordionTrigger>
 *     <AccordionContent>コンテンツ1</AccordionContent>
 *   </AccordionItem>
 *   <AccordionItem>
 *     <AccordionTrigger>セクション2</AccordionTrigger>
 *     <AccordionContent>コンテンツ2</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 *
 * @example
 * // クリスマスモード
 * const { isChristmasMode } = useChristmasMode();
 * <Accordion isChristmasMode={isChristmasMode}>
 *   ...
 * </Accordion>
 */

// Context for Accordion
interface AccordionContextValue {
  isChristmasMode: boolean;
}

const AccordionContext = createContext<AccordionContextValue>({ isChristmasMode: false });

// Context for AccordionItem
interface AccordionItemContextValue {
  isOpen: boolean;
  toggle: () => void;
}

const AccordionItemContext = createContext<AccordionItemContextValue | undefined>(undefined);

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionItem components must be used within an AccordionItem');
  }
  return context;
}

// Accordion Root
export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** クリスマスモードの有効/無効 */
  isChristmasMode?: boolean;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ isChristmasMode = false, children, className = '', ...props }, ref) => {
    return (
      <AccordionContext.Provider value={{ isChristmasMode }}>
        <div ref={ref} className={`divide-y ${isChristmasMode ? 'divide-[#d4af37]/20' : 'divide-gray-200'} ${className}`} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = 'Accordion';

// AccordionItem
export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** デフォルトで開いた状態か */
  defaultOpen?: boolean;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ defaultOpen = false, children, className = '', ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <AccordionItemContext.Provider value={{ isOpen, toggle: () => setIsOpen(!isOpen) }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);
AccordionItem.displayName = 'AccordionItem';

// AccordionTrigger
export type AccordionTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, className = '', ...props }, ref) => {
    const { isOpen, toggle } = useAccordionItemContext();
    const { isChristmasMode } = useContext(AccordionContext);

    const triggerStyles = isChristmasMode
      ? 'text-[#f8f1e7] hover:bg-white/5'
      : 'text-gray-900 hover:bg-gray-50';

    return (
      <button
        ref={ref}
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between py-4 px-1 font-medium transition-colors ${triggerStyles} ${className}`}
        {...props}
      >
        <span>{children}</span>
        <HiChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isChristmasMode ? 'text-[#d4af37]' : 'text-gray-500'}`}
        />
      </button>
    );
  }
);
AccordionTrigger.displayName = 'AccordionTrigger';

// AccordionContent
export type AccordionContentProps = React.HTMLAttributes<HTMLDivElement>;

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className = '', ...props }, ref) => {
    const { isOpen } = useAccordionItemContext();
    const { isChristmasMode } = useContext(AccordionContext);

    if (!isOpen) {
      return null;
    }

    const contentStyles = isChristmasMode
      ? 'text-[#f8f1e7]/80'
      : 'text-gray-600';

    return (
      <div
        ref={ref}
        className={`pb-4 ${contentStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AccordionContent.displayName = 'AccordionContent';
