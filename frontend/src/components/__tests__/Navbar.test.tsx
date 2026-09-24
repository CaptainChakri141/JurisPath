import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navbar from '../Navbar';

describe('Navbar Component', () => {
  it('renders brand logo and main navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText(/JurisPath/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Compare/i)).toBeInTheDocument();
    expect(screen.getByText(/Legal Navigator/i)).toBeInTheDocument();
  });

  it('renders jurisdiction badge for India & AP', () => {
    render(<Navbar />);
    expect(screen.getByText(/India \(AP\)/i)).toBeInTheDocument();
  });

  it('has accessible landmark and buttons', () => {
    render(<Navbar />);
    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gemini API Key/i })).toBeInTheDocument();
  });
});
