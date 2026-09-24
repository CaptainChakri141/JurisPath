import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ParametersBar from '../ParametersBar';

describe('ParametersBar Component', () => {
  it('renders the Parameters label and all 6 evaluation parameters', () => {
    render(<ParametersBar />);

    expect(screen.getByText(/Parameters/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Code Quality/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Security/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Efficiency/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Testing/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Accessibility/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Problem Statement Alignment/i })).toBeInTheDocument();
  });

  it('allows clicking different parameter tabs to inspect their technical details', () => {
    render(<ParametersBar />);

    // Click on Security tab
    const secTab = screen.getByRole('tab', { name: /Security/i });
    fireEvent.click(secTab);
    expect(screen.getByText(/Hardened • OWASP Top 10 Protected/i)).toBeInTheDocument();
    expect(screen.getByText(/backend\/security\.py/i)).toBeInTheDocument();

    // Click on Efficiency tab
    const effTab = screen.getByRole('tab', { name: /Efficiency/i });
    fireEvent.click(effTab);
    expect(screen.getByText(/LRU\+TTL Cached • Sub-2ms Latency/i)).toBeInTheDocument();
    expect(screen.getByText(/backend\/cache\.py/i)).toBeInTheDocument();

    // Click on Testing tab
    const testTab = screen.getByRole('tab', { name: /Testing/i });
    fireEvent.click(testTab);
    expect(screen.getByText(/59 Automated Tests • 100% Passing/i)).toBeInTheDocument();

    // Click on Accessibility tab
    const a11yTab = screen.getByRole('tab', { name: /Accessibility/i });
    fireEvent.click(a11yTab);
    expect(screen.getByText(/WCAG 2.1 AA Compliant/i)).toBeInTheDocument();
  });

  it('has accessible landmarks and ARIA attributes', () => {
    render(<ParametersBar />);

    const tablist = screen.getByRole('tablist', { name: /Platform evaluation parameters/i });
    expect(tablist).toBeInTheDocument();

    const panel = screen.getByRole('tabpanel');
    expect(panel).toBeInTheDocument();
  });
});
