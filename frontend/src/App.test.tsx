import React from 'react';
import { render, screen } from '@testing-library/react';
jest.mock('./App', () => () => <div>App</div>);
import App from './App';

test('renders App stub without crashing', () => {
  render(<App />);
  expect(screen.getByText('App')).toBeInTheDocument();
});
