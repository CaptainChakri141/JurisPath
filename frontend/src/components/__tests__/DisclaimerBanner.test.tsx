import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DisclaimerBanner from '../DisclaimerBanner';

describe('DisclaimerBanner', () => {
  it('renders the legal compliance notice correctly', () => {
    render(<DisclaimerBanner />);
    expect(screen.getByText(/LEGAL INFORMATION NOTICE:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/JurisPath provides AI-powered document understanding and legal information assistance/i)
    ).toBeInTheDocument();
  });

  it('contains accessible region landmark and label', () => {
    render(<DisclaimerBanner />);
    const region = screen.getByRole('region', { name: /Legal Compliance Notice/i });
    expect(region).toBeInTheDocument();
  });

  it('displays the Indian and AP legal jurisdiction tag', () => {
    render(<DisclaimerBanner />);
    expect(screen.getByText(/Indian Law & AP Jurisdiction/i)).toBeInTheDocument();
  });
});
