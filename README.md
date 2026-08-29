# ShopLite — Full-Stack E-Commerce Platform

A production-style e-commerce application built to demonstrate end-to-end full-stack skills: secure authentication, relational data modeling, cart management, online payments, role-based admin tooling, and deployment-ready structure.

![Tech](https://img.shields.io/badge/React_19-Vite-61dafb) ![Backend](https://img.shields.io/badge/Express-Prisma-green) ![DB](https://img.shields.io/badge/PostgreSQL-16-blue)

---

## Features

### Customer
- Register / login with JWT authentication (bcrypt-hashed passwords)
- Product catalog with **search**, **category filters**, and **pagination**
- Product detail pages with live stock info
- Persistent shopping cart (database-backed — survives logout, syncs across devices)
- Stock-aware quantity controls (can't order more than available)
- Order history with status tracking

### Admin
- Role-based access control (`CUSTOMER` / `ADMIN` roles)
- Dashboard with revenue, orders, products, and user stats
- Full product CRUD (create, edit, delete with order-history protection)
- Order management: view all customer orders, update fulfillment status

### Payments
- Razorpay checkout integration with server-side **HMAC signature verification**
- Atomic order finalization: payment success → stock decrement → cart clear (single DB transaction)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TailwindCSS v4, React Router v7 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (7-day expiry), bcryptjs |
| Payments | Razorpay (test mode) |
| Dev Tools | Nodemon, Prisma Studio |

---

## Architecture

```
┌─────────────────┐         ┌──────────────────┐        ┌────────────┐
│  React Client   │  HTTP   │  Express Server   │ Prisma │ PostgreSQL │
│  (Vite, :5173)  │ ──────► │  (:4000)          │ ─────► │            │
│                 │         │                  │        │            │
│  Context state  │         │  Routes           │        │  6 tables  │
│  (Auth, Cart)   │         │  Controllers      │        │            │
│  Tailwind UI    │         │  Middleware (JWT) │        │            │
└─────────────────┘         └──────────────────┘        └────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │   Razorpay API   │
                            │  (checkout +     │
                            │   verification)  │
                            └──────────────────┘
```

**Key design decisions:**
- **Cart in the database, not localStorage** — carts survive device switches and let the server validate stock at checkout time.
- **Order snapshot pattern** — `OrderItem.priceAtPurchase` preserves historical prices even if product prices change later.
- **Lazy gateway client** — the Razorpay instance is created on first use so the API boots cleanly even without keys configured.
- **Signature-verified payments** — the client never marks an order paid; only a valid `razorpay_signature` HMAC match does.

---

## Database Schema

```
User      id, name, email*, passwordHash, role (CUSTOMER | ADMIN)
Category  id, name*
Product   id, name, description, price (paise), imageUrl, stock, categoryId → Category
CartItem  id, quantity, userId → User, productId → Product   (unique per user+product)
Order     id, total, status (PENDING→PAID→SHIPPED→DELIVERED | CANCELLED), paymentRef*, userId → User
OrderItem id, quantity, priceAtPurchase, orderId → Order, productId → Product
```

---

## API Overview

```
Auth:       POST /api/auth/register    POST /api/auth/login    GET /api/auth/me
Catalog:    GET  /api/products?search=&category=&page=     GET /api/products/:id
            GET  /api/categories
Cart:       GET/POST /api/cart         PATCH/DELETE /api/cart/:id          [auth]
Checkout:   POST /api/checkout         POST /api/checkout/verify           [auth]
Orders:     GET /api/orders            GET /api/orders/:id                 [auth]
Admin:      GET /api/admin/stats       POST/PUT/DELETE /api/admin/products [admin]
            GET /api/admin/orders      PATCH /api/admin/orders/:id/status  [admin]
```

---

## Running Locally

**Prerequisites:** Node 18+, PostgreSQL running locally.

```bash
# 1. Backend
cd server
npm install
cp .env.example .env        # fill in DATABASE_URL + keys
npx prisma db push          # create tables
npm run db:seed             # demo data
npm run dev                 # http://localhost:4000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

**Demo accounts** (after seeding):

| Role | Email | Password |
|---|---|---|
| Customer | `customer@shop.com` | `password123` |
| Admin | `admin@shop.com` | `admin123` |

**Test card** (Razorpay test mode): `4111 1111 1111 1111`, any future expiry, any CVV.

---

## Deployment

- **Client** → Vercel (set build command `npm run build`; add rewrite for SPA routing)
- **Server** → Render / Railway (set all `.env` vars; start command `npm start`)
- **Database** → Render PostgreSQL / Neon (update `DATABASE_URL`, run `prisma db push`)
- Point `CLIENT_URL` on the server at the deployed frontend URL.

---

## Roadmap
- [ ] Webhook-based payment confirmation (Razorpay webhooks) as backup to client redirect
- [ ] Product image uploads (Cloudinary) instead of URLs
- [ ] Order confirmation emails
- [ ] Unit + integration tests (Jest / Supertest)

---

## What This Project Demonstrates
- REST API design with consistent error handling
- Relational modeling with foreign keys and unique constraints
- Authentication + authorization middleware patterns
- Third-party payment integration done securely (server-side verification)
- Transactional writes for data integrity
- Component-based frontend with global state via Context
