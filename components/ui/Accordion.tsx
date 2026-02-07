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
 */

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
export type AccordionProps = React.HTMLAttributes<HTMLDivElement>;

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`divide-y divide-edge ${className}`} {...props}>
        {children}
      </div>
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

    return (
      <button
        ref={ref}
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between py-4 px-1 font-medium transition-colors text-ink hover:bg-ground ${className}`}
        {...props}
      >
        <span>{children}</span>
        <HiChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-spot`}
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

    if (!isOpen) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={`pb-4 text-ink-sub ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AccordionContent.displayName = 'AccordionContent';
