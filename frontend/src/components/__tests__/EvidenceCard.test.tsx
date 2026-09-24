import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EvidenceCard from '../EvidenceCard';
import { Evidence } from '@/lib/api';

const mockEvidence: Evidence = {
  doc_name: 'Sample_Residential_Rental_Agreement.txt',
  page_number: 1,
  section_number: 'Section 5',
  section_title: 'Lock-In Period and Termination Notice',
  text: 'Both parties agree to an initial mandatory Lock-in Period of 6 (six) months.',
  similarity_score: 0.98,
};

describe('EvidenceCard', () => {
  it('renders evidence details correctly', () => {
    render(<EvidenceCard evidence={mockEvidence} />);
    expect(screen.getByText(/Verified Evidence/i)).toBeInTheDocument();
    expect(screen.getByText(/Page 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Section 5/i)).toBeInTheDocument();
    expect(screen.getByText(/Lock-In Period and Termination Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/mandatory Lock-in Period of 6/i)).toBeInTheDocument();
  });

  it('triggers onNavigate callback when clicked', () => {
    const handleNavigate = vi.fn();
    render(<EvidenceCard evidence={mockEvidence} onNavigate={handleNavigate} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(handleNavigate).toHaveBeenCalledTimes(1);
    expect(handleNavigate).toHaveBeenCalledWith(1, 'Section 5', mockEvidence.text);
  });

  it('triggers onNavigate callback on keyboard Enter key', () => {
    const handleNavigate = vi.fn();
    render(<EvidenceCard evidence={mockEvidence} onNavigate={handleNavigate} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(handleNavigate).toHaveBeenCalledTimes(1);
  });

  it('has accessible aria-label containing citation source', () => {
    render(<EvidenceCard evidence={mockEvidence} />);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Sample_Residential_Rental_Agreement.txt')
    );
  });
});
