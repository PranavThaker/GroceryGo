# GroceryGo Load Testing with k6

This directory contains the k6 load testing script for GroceryGo simulating a realistic end-to-end user journey across the application backend.

## User Flow Tested

Each virtual user (VU) executes the following realistic journey in sequence:
1. **Signup (`POST /api/auth/signup`)**: Registers a new user with unique credentials.
2. **Login (`POST /api/auth/login`)**: Authenticates the user and establishes an HTTP-only session cookie (`connect.sid`).
3. **Browse Catalogue (`GET /api/products`)**: Fetches product listings and selects a product at random.
4. **Add to Cart (`POST /api/cart`)**: Adds the chosen product to the user's cart.
5. **Update Cart (`PUT /api/cart/:productId`)**: Updates item quantity in the cart.

Between operations, realistic simulated user pacing / think time (`sleep()`) is introduced.

## Prerequisites

- [k6](https://k6.io/) installed (`k6 version`).
- GroceryGo backend running (default: `http://localhost:5000`).
- MongoDB running with products seeded.

## Running the Load Test

### Default Stages (50 VUs with ramp-up/steady/ramp-down)
```bash
k6 run load-test/script.js
```

### Direct Concurrency (e.g., 50 VUs for 30s)
```bash
k6 run --vus 50 --duration 30s load-test/script.js
```

### Custom Target Host (e.g., Remote / Staging)
```bash
k6 run -e TARGET_URL=http://your-remote-host:5000 load-test/script.js
```
