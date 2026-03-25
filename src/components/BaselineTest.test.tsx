import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Baseline Test', () => {
  it('renders a react component successfully', () => {
    render(<div>Hello World</div>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
