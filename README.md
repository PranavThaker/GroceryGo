# GroceryGo — Full-Stack Grocery E-Commerce App

A full-stack grocery e-commerce application built with the MERN stack, containerized with Docker, backed by a 52-case automated test suite, and load-tested with k6.

## Features

### Customer
- **Authentication** — signup/login with bcrypt-hashed passwords and server-side sessions
- **Product Browsing** — search, category filtering, and sorting (by name/price/category)
- **Shopping Cart** — add, update quantity, and remove items with live total calculation
- **Quick Picks** — randomized product recommendations on the homepage
- **Profile Management** — update personal details (name, phone, address)

### Admin
- **Role-Based Access Control** — protected admin routes gated by an `isAdmin` flag on the user session
- **Product Management** — full CRUD (create, read, update, delete) on the product catalogue
- **User Directory** — view all registered users (read-only)

## Tech Stack

**Frontend:** React.js, React Router, Bootstrap 5, Axios
**Backend:** Node.js, Express.js, Mongoose, express-session, bcrypt
**Database:** MongoDB
**Testing:** Jest, Supertest, mongodb-memory-server (backend) · Jest, React Testing Library (frontend)
**Infrastructure:** Docker, Docker Compose
**Load Testing:** k6

## Architecture

Three containerized services orchestrated via Docker Compose:
- `frontend` — React app, built and served as static files
- `backend` — Express REST API
- `mongo` — MongoDB with a persistent named volume

Configuration (database URI, session secret, CORS origin) is externalized via environment variables — no secrets are hardcoded in source.

## Getting Started

### Prerequisites
- Docker and Docker Compose

### Run with Docker

```bash
# 1. Copy the example env file and fill in real values
cp backend/.env.example backend/.env

# 2. Build and start all services
docker compose up --build

# 3. Seed the product catalogue (first run only)
docker compose exec backend node seed.js
```

The app will be available at `http://localhost:3000`, with the API at `http://localhost:5000`.

### Run without Docker (local development)

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, SESSION_SECRET, CLIENT_ORIGIN
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm start
```

## Testing

**Backend** — 27 test cases (auth, cart, admin route protection) using Jest + Supertest against an in-memory MongoDB instance:
```bash
cd backend
npm test
```

**Frontend** — 25 test cases covering Login, Signup, Cart, and App shell using Jest + React Testing Library:
```bash
cd frontend
npm test
```

## Load Testing

The API has been load-tested with [k6](https://k6.io/) simulating a full user journey (signup → login → browse → add to cart → update cart) at 50 concurrent virtual users against the Dockerized stack:

- **0% request failure rate**
- **p95 latency: 81.46ms**
- **618 completed user journeys**, 6,180/6,180 checks passed

See [`load-test/RESULTS.md`](./load-test/RESULTS.md) for full details and [`load-test/README.md`](./load-test/README.md) for how to run it yourself.

## Project Structure

```
GroceryGo/
├── backend/          # Express API, Mongoose models, Jest test suite
├── frontend/          # React app
├── load-test/          # k6 load testing script and results
└── docker-compose.yaml
```
