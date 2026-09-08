import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Cart from './Cart';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Cart Component', () => {
  const mockUpdateCartCount = jest.fn();

  const mockCartItems = [
    {
      _id: 'cart-1',
      product: {
        _id: 'prod-milk',
        name: 'Organic Milk',
        price: 60,
        category: 'Dairy',
        image: 'milk',
      },
      quantity: 2,
    },
    {
      _id: 'cart-2',
      product: {
        _id: 'prod-apples',
        name: 'Fresh Apples',
        price: 150,
        category: 'Fruits',
        image: 'apples',
      },
      quantity: 1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('redirects to /login when user is not logged in', () => {
    render(<Cart isLoggedIn={false} updateCartCount={mockUpdateCartCount} />);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('displays loading spinner while fetching cart items', () => {
    global.fetch.mockImplementationOnce(() => new Promise(() => { }));

    render(<Cart isLoggedIn={true} updateCartCount={mockUpdateCartCount} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
  });

  test('renders empty cart state and allows navigating to /products', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<Cart isLoggedIn={true} updateCartCount={mockUpdateCartCount} />);

    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Add some products to get started!')).toBeInTheDocument();

    const browseBtn = screen.getByRole('button', { name: /browse products/i });
    expect(browseBtn).toBeInTheDocument();

    fireEvent.click(browseBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/products');
  });

  test('renders cart items, quantities, and calculates totals accurately', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCartItems,
    });

    render(<Cart isLoggedIn={true} updateCartCount={mockUpdateCartCount} />);

    // Cart Items header count: 2 + 1 = 3
    expect(await screen.findByText('Cart Items (3)')).toBeInTheDocument();

    // Verify item details
    expect(screen.getByText('Organic Milk')).toBeInTheDocument();
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('Fresh Apples')).toBeInTheDocument();
    expect(screen.getByText('Fruits')).toBeInTheDocument();

    // Unit prices and line totals
    expect(screen.getByText('₹60')).toBeInTheDocument();
    expect(screen.getAllByText('₹150')).toHaveLength(2); // unit price & line total (150 * 1)

    // Line totals: 60 * 2 = 120
    expect(screen.getByText('₹120')).toBeInTheDocument();

    // Order Summary calculations
    // Subtotal: 120 + 150 = 270
    expect(screen.getByText('Subtotal (3 items):')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument(); // Shipping

    // Total displayed in summary
    const totalElements = screen.getAllByText('₹270');
    expect(totalElements.length).toBeGreaterThanOrEqual(1);
  });

  test('handles quantity increment (+ button) and invokes updateCartCount', async () => {
    // Initial fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCartItems,
    });
    // PUT update
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Quantity updated' }),
    });
    // Re-fetch after update
    const updatedItems = [
      {
        ...mockCartItems[0],
        quantity: 3,
      },
      mockCartItems[1],
    ];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedItems,
    });

    render(<Cart isLoggedIn={true} updateCartCount={mockUpdateCartCount} />);

    await screen.findByText('Cart Items (3)');

    const milkRow = screen.getByText('Organic Milk').closest('.border-bottom');
    const buttons = milkRow.querySelectorAll('button');
    const plusBtn = buttons[1]; // [0] is minus, [1] is plus, [2] is trash

    fireEvent.click(plusBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/cart/prod-milk',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: 3 }),
          credentials: 'include',
        })
      );
      expect(mockUpdateCartCount).toHaveBeenCalled();
    });
  });

  test('disables decrement button when item quantity is 1', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCartItems,
    });

    render(<Cart isLoggedIn={true} updateCartCount={mockUpdateCartCount} />);

    await screen.findByText('Cart Items (3)');

    const applesRow = screen.getByText('Fresh Apples').closest('.border-bottom');
    const buttons = applesRow.querySelectorAll('button');
    const minusBtn = buttons[0];

    expect(minusBtn).toBeDisabled();
  });

  test('handles quantity decrement (- button) when quantity > 1', async () => {
    // Initial fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCartItems,
    });
    // PUT update
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Quantity updated' }),
    });
    // Re-fetch after update
    const updatedItems = [
      {
        ...mockCartItems[0],
        quantity: 1,
      },
      mockCartItems[1],
    ];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedItems,
    });

    render(<Cart isLoggedIn={true} updateCartCount={mockUpdateCartCount} />);

    await screen.findByText('Cart Items (3)');

    const milkRow = screen.getByText('Organic Milk').closest('.border-bottom');
    const buttons = milkRow.querySelectorAll('button');
    const minusBtn = buttons[0];

    expect(minusBtn).not.toBeDisabled();
    fireEvent.click(minusBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/cart/prod-milk',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: 1 }),
          credentials: 'include',
        })
      );
      expect(mockUpdateCartCount).toHaveBeenCalled();
    });
  });

  test('handles item removal (trash button) and invokes updateCartCount', async () => {
    // Initial fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCartItems,
    });
    // DELETE update
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Item deleted' }),
    });
    // Re-fetch after delete
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockCartItems[0]],
    });

    render(<Cart isLoggedIn={true} updateCartCount={mockUpdateCartCount} />);

    await screen.findByText('Cart Items (3)');

    const applesRow = screen.getByText('Fresh Apples').closest('.border-bottom');
    const buttons = applesRow.querySelectorAll('button');
    const trashBtn = buttons[2];

    fireEvent.click(trashBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/cart/prod-apples',
        expect.objectContaining({
          method: 'DELETE',
          credentials: 'include',
        })
      );
      expect(mockUpdateCartCount).toHaveBeenCalled();
    });
  });

  test('navigates to home when "Continue Shopping" button is clicked', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCartItems,
    });

    render(<Cart isLoggedIn={true} updateCartCount={mockUpdateCartCount} />);

    await screen.findByText('Cart Items (3)');

    const continueBtn = screen.getByRole('button', { name: /continue shopping/i });
    fireEvent.click(continueBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
