import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StartHintDialog } from './StartHintDialog';

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLProps<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onStart: vi.fn(),
};

describe('StartHintDialog', () => {
  it('isOpen: true のとき表示される', () => {
    render(<StartHintDialog {...defaultProps} />);
    expect(screen.getByText('一杯をおいしく淹れるために')).toBeInTheDocument();
  });

  it('isManualMode: true のとき「手順はタップで進みます」が表示される', () => {
    render(<StartHintDialog {...defaultProps} isManualMode={true} />);
    expect(screen.getByText('手順はタップで進みます')).toBeInTheDocument();
  });

  it('isManualMode: false のとき「手順はタップで進みます」が表示されない', () => {
    render(<StartHintDialog {...defaultProps} isManualMode={false} />);
    expect(screen.queryByText('手順はタップで進みます')).not.toBeInTheDocument();
  });

  it('isManualMode 未指定のとき「手順はタップで進みます」が表示されない', () => {
    render(<StartHintDialog {...defaultProps} />);
    expect(screen.queryByText('手順はタップで進みます')).not.toBeInTheDocument();
  });
});
