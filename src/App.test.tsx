import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navigation component', () => {
  render(<App />);
  const navElement = screen.getByText(/AI Cultural Journalist/i);
  expect(navElement).toBeInTheDocument();
});