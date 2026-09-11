import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metrics to track specific operations and errors
export const errorRate = new Rate('custom_errors');
export const signupLatency = new Trend('signup_duration');
export const loginLatency = new Trend('login_duration');
export const browseLatency = new Trend('browse_duration');
export const addToCartLatency = new Trend('add_to_cart_duration');
export const updateCartLatency = new Trend('update_cart_duration');
export const successfulJourneys = new Counter('successful_user_journeys');

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:5000';

export const options = {
  stages: [
    { duration: '10s', target: 50 }, // Ramp-up to 50 concurrent users
    { duration: '30s', target: 50 }, // Sustain 50 concurrent users
    { duration: '5s', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],    // HTTP error rate below 5%
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2000ms
  },
};

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

export default function () {
  const uniqueId = `${__VU}_${__ITER}_${Date.now()}`;
  const user = {
    name: `User_${uniqueId}`,
    email: `loadtest_${uniqueId}@grocerygo.local`,
    password: `Pass_${uniqueId}!`,
  };

  let journeyPassed = true;

  // 1. Signup Flow
  group('01_Signup', () => {
    const signupRes = http.post(
      `${BASE_URL}/api/auth/signup`,
      JSON.stringify(user),
      { headers: JSON_HEADERS }
    );
    signupLatency.add(signupRes.timings.duration);

    const signupOk = check(signupRes, {
      'signup status is 201': (r) => r.status === 201,
      'signup returned user': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body && body.user && body.user.email === user.email;
        } catch (_) {
          return false;
        }
      },
    });

    if (!signupOk) {
      errorRate.add(1);
      journeyPassed = false;
    }
  });

  sleep(0.5); // Realistic user pause

  // 2. Login Flow (sets session cookie connect.sid in k6 VU jar)
  group('02_Login', () => {
    const loginRes = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({ email: user.email, password: user.password }),
      { headers: JSON_HEADERS }
    );
    loginLatency.add(loginRes.timings.duration);

    const loginOk = check(loginRes, {
      'login status is 200': (r) => r.status === 200,
      'login session established': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body && body.user && body.user.email === user.email;
        } catch (_) {
          return false;
        }
      },
    });

    if (!loginOk) {
      errorRate.add(1);
      journeyPassed = false;
    }
  });

  sleep(0.5);

  let selectedProductId = null;

  // 3. Browse Products
  group('03_Browse_Products', () => {
    const productsRes = http.get(`${BASE_URL}/api/products`);
    browseLatency.add(productsRes.timings.duration);

    const browseOk = check(productsRes, {
      'products status is 200': (r) => r.status === 200,
      'products list not empty': (r) => {
        try {
          const body = JSON.parse(r.body);
          if (Array.isArray(body) && body.length > 0) {
            // Pick a random product from catalogue
            const randomIndex = Math.floor(Math.random() * body.length);
            selectedProductId = body[randomIndex]._id;
            return true;
          }
          return false;
        } catch (_) {
          return false;
        }
      },
    });

    if (!browseOk) {
      errorRate.add(1);
      journeyPassed = false;
    }
  });

  sleep(0.5);

  // 4. Add to Cart
  if (selectedProductId) {
    group('04_Add_To_Cart', () => {
      const addRes = http.post(
        `${BASE_URL}/api/cart`,
        JSON.stringify({ productId: selectedProductId, quantity: 1 }),
        { headers: JSON_HEADERS }
      );
      addToCartLatency.add(addRes.timings.duration);

      const addOk = check(addRes, {
        'add to cart status is 200': (r) => r.status === 200,
        'cart contains items': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body && body.cart && Array.isArray(body.cart.items);
          } catch (_) {
            return false;
          }
        },
      });

      if (!addOk) {
        errorRate.add(1);
        journeyPassed = false;
      }
    });

    sleep(0.5);

    // 5. Update Cart Item Quantity
    group('05_Update_Cart', () => {
      const updateRes = http.put(
        `${BASE_URL}/api/cart/${selectedProductId}`,
        JSON.stringify({ quantity: 3 }),
        { headers: JSON_HEADERS }
      );
      updateCartLatency.add(updateRes.timings.duration);

      const updateOk = check(updateRes, {
        'update cart status is 200': (r) => r.status === 200,
        'updated cart returned': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body && body.cart && body.cart.items.some(
              (item) => item.product === selectedProductId && item.quantity === 3
            );
          } catch (_) {
            return false;
          }
        },
      });

      if (!updateOk) {
        errorRate.add(1);
        journeyPassed = false;
      }
    });
  }

  if (journeyPassed) {
    successfulJourneys.add(1);
  }

  sleep(1); // Think time between iterations
}
