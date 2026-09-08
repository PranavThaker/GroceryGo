import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  const mockSetIsLoggedIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders login form with heading, inputs, and submit button', () => {
    render(<Login setIsLoggedIn={mockSetIsLoggedIn} />);

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });

  test('updates input values when typing', () => {
    render(<Login setIsLoggedIn={mockSetIsLoggedIn} />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(emailInput, { target: { name: 'email', value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'secret123' } });

    expect(emailInput.value).toBe('user@example.com');
    expect(passwordInput.value).toBe('secret123');
  });

  test('clears error message when user types again', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    render(<Login setIsLoggedIn={mockSetIsLoggedIn} />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(emailInput, { target: { name: 'email', value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'wrongpass' } });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText('Invalid credentials');
    expect(errorMessage).toBeInTheDocument();

    // User types to fix email
    fireEvent.change(emailInput, { target: { name: 'email', value: 'user2@example.com' } });
    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
  });

  test('successfully logs in user, calls setIsLoggedIn(true), and navigates to home', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: 'u1', email: 'user@example.com', name: 'John Doe' } }),
    });

    render(<Login setIsLoggedIn={mockSetIsLoggedIn} />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { name: 'email', value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { name: 'password', value: 'correctpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com', password: 'correctpass' }),
        credentials: 'include',
      })
    );

    await waitFor(() => {
      expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('shows an error message on failed login response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials. Check email and password.' }),
    });

    render(<Login setIsLoggedIn={mockSetIsLoggedIn} />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { name: 'email', value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { name: 'password', value: 'wrong' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    const errorMsg = await screen.findByText('Invalid credentials. Check email and password.');
    expect(errorMsg).toBeInTheDocument();
    expect(mockSetIsLoggedIn).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('shows fallback error message when response message is missing', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<Login setIsLoggedIn={mockSetIsLoggedIn} />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { name: 'email', value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { name: 'password', value: 'wrong' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    const errorMsg = await screen.findByText('Login failed. Please check your credentials.');
    expect(errorMsg).toBeInTheDocument();
  });

  test('shows network error message when server is unreachable', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<Login setIsLoggedIn={mockSetIsLoggedIn} />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { name: 'email', value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { name: 'password', value: 'secret' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    const errorMsg = await screen.findByText('Network error. Please check if the server is running.');
    expect(errorMsg).toBeInTheDocument();
  });

  test('disables submit button and shows loading state while request is in progress', async () => {
    let resolveFetch;
    global.fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    render(<Login setIsLoggedIn={mockSetIsLoggedIn} />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { name: 'email', value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { name: 'password', value: 'secret' },
    });

    const submitBtn = screen.getByRole('button', { name: /^login$/i });
    fireEvent.click(submitBtn);

    // While in flight
    expect(screen.getByRole('button', { name: /logging in\.\.\./i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logging in\.\.\./i })).toBeDisabled();

    // Resolve fetch
    resolveFetch({
      ok: true,
      json: async () => ({ user: { id: 'u1' } }),
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
