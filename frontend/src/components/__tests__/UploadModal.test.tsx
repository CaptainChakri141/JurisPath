import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UploadModal from '../UploadModal';

// Mock Next.js useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('UploadModal Component', () => {
  it('does not render when isOpen is false', () => {
    const handleClose = vi.fn();
    render(<UploadModal isOpen={false} onClose={handleClose} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal with accessible landmarks when isOpen is true', () => {
    const handleClose = vi.fn();
    render(<UploadModal isOpen={true} onClose={handleClose} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText(/Upload Legal Document/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Upload document dropzone/i)).toBeInTheDocument();
  });

  it('renders preloaded sample documents for quick exploration', () => {
    const handleClose = vi.fn();
    render(<UploadModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText(/Residential Rental Agreement/i)).toBeInTheDocument();
    expect(screen.getByText(/Tech Employment Agreement/i)).toBeInTheDocument();
    expect(screen.getByText(/Mutual Non-Disclosure Agreement/i)).toBeInTheDocument();
    expect(screen.getByText(/Consumer Legal Notice/i)).toBeInTheDocument();
  });

  it('triggers onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<UploadModal isOpen={true} onClose={handleClose} />);

    const closeButton = screen.getByRole('button', { name: /Close upload dialog/i });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(<UploadModal isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
