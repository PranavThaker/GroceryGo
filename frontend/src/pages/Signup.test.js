import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Signup from './Signup';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders signup form with heading, inputs, and submit button', () => {
    render(<Signup />);

    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument();
  });

  test('updates input values when typing', () => {
    render(<Signup />);

    const nameInput = screen.getByPlaceholderText(/full name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(nameInput, { target: { name: 'name', value: 'Jane Doe' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'jane@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });

    expect(nameInput.value).toBe('Jane Doe');
    expect(emailInput.value).toBe('jane@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('successfully submits form, displays success message, and redirects after timeout', async () => {
    jest.useFakeTimers();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User registered' }),
    });

    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { name: 'name', value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { name: 'email', value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { name: 'password', value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      }),
    });

    const successMsg = await screen.findByText('Account created successfully! Please login.');
    expect(successMsg).toBeInTheDocument();

    // Fast-forward 2000ms timer
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');

    jest.useRealTimers();
  });

  test('shows an error message when email is already taken', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'User already exists' }),
    });

    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { name: 'name', value: 'Existing User' },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { name: 'email', value: 'existing@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { name: 'password', value: 'secret' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    const errorMsg = await screen.findByText('User already exists');
    expect(errorMsg).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('shows fallback error message when response message is not provided', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { name: 'name', value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { name: 'email', value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { name: 'password', value: 'secret' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    const errorMsg = await screen.findByText('Signup failed');
    expect(errorMsg).toBeInTheDocument();
  });

  test('shows network error message when server is down', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { name: 'name', value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { name: 'email', value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { name: 'password', value: 'secret' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    const errorMsg = await screen.findByText('Network error. Please try again.');
    expect(errorMsg).toBeInTheDocument();
  });

  test('disables button and shows loading text during registration submission', async () => {
    let resolveFetch;
    global.fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    render(<Signup />);

    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { name: 'name', value: 'Test' },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { name: 'email', value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { name: 'password', value: 'pass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    expect(screen.getByRole('button', { name: /creating account\.\.\./i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creating account\.\.\./i })).toBeDisabled();

    resolveFetch({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });

    await screen.findByText('Account created successfully! Please login.');
  });
});
