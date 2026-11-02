# FarmDirect — Transparent Farm-to-Consumer Marketplace

FarmDirect is a modern web application connecting conscious consumers directly with passionate local farmers. It eliminates middleman commissions, guarantees fair farmer remuneration, and brings radical transparency to fresh harvest provenance.

---

## 🌾 Tech Stack

### Frontend (Client)
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **Styling**: Vanilla CSS tokens & curated Tailwind utility classes
- **Icons**: Lucide React
- **State Management**: Centralized `ShopContext` and `AuthContext` with credentials-included API client

### Backend (Server — Session 5)
- **Runtime**: Node.js (ES Modules)
- **Web Framework**: Express.js
- **Database**: MySQL (XAMPP)
- **ORM**: Prisma ORM v5
- **Authentication**: JWT stored in secure HTTP-only cookies
- **Password Security**: bcryptjs (10 salt rounds)
- **Validation**: Zod schema validation
- **Security Headers**: Helmet, CORS with credentials

---

## 🌱 Agriculture Advisor (Added Feature)

Open **Agri Advisor** from the top navigation or visit `/agriculture-advisor`.

- **GPS-based location setting:** the user explicitly clicks “Use my GPS location” and grants browser permission. The page attempts to look up a district/state name; manual entry remains available if GPS or lookup fails.
- **Agriculture scheme discovery:** role, crop, state/district and search filters help shortlist common Indian schemes and official portals. The matching is a transparent rule-based recommender, not a trained AI model or an official eligibility decision.
- **Farmer and consumer view:** farmer assistance is shown separately from consumer-facing information so farmer-only benefits are not incorrectly presented as consumer entitlements.
- **Crop cultivation guide:** selectable crop guides include suitable soil, seed selection advice, cultivation stages, water needs and typical crop duration for rice, groundnut, tomato, banana, maize, millets and pulses.

**Important:** Scheme windows, notified crops, benefits and eligibility may change. Confirm details at the linked official portal or district agriculture office. Crop guides are educational and must be adapted to local soil tests, season and agricultural-extension advice. GPS is optional; the page does not save coordinates to the backend.

## 📁 Project Structure

```
farm-direct/
├── src/                                 # Frontend React Application
│   ├── api/                             # Centralized API client & endpoint modules
│   │   ├── client.js                    # Fetch wrapper with credentials: 'include'
│   │   ├── auth.js                      # /api/auth endpoints
│   │   ├── users.js                     # /api/users endpoints
│   │   ├── farmers.js                   # /api/farmers endpoints
│   │   └── products.js                  # /api/products endpoints
│   ├── auth/                            # Authentication state & route guards
│   │   ├── AuthContext.jsx              # Centralized user state synced with /api/auth/me
│   │   ├── ProtectedRoute.jsx           # Role & authentication route enforcement
│   │   └── demoUsers.js                 # Development & demo credentials
│   ├── components/                      # UI components (Navbar, AccountDropdown, etc.)
│   ├── pages/                           # Application views (Marketplace, Login, etc.)
│   └── context/ShopContext.jsx          # Cart, orders, and favorites state
├── server/                              # Backend Express & MySQL Service
│   ├── prisma/
│   │   ├── schema.prisma                # Relational schema (User, Profiles, Products, Orders)
│   │   ├── seed.js                      # Database seed script
│   │   └── migrate.js                   # Schema synchronization script
│   ├── src/
│   │   ├── config/                      # Database, server & environment config
│   │   ├── controllers/                 # Route controllers (auth, users, farmers, products)
│   │   ├── middleware/                  # Auth, role, validation, and error middlewares
│   │   ├── routes/                      # Express route definitions
│   │   ├── validations/                 # Zod validation schemas
│   │   ├── app.js                       # Express app configuration
│   │   └── server.js                    # Server entrypoint
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on v20.18.0)
- **npm**: v10+

### 2. Frontend Setup
```bash
# In project root
npm install
npm run dev
```
The frontend dev server runs on **http://localhost:5173**.

### 3. Backend Setup & Database (MySQL + XAMPP)
1. Open XAMPP Control Panel and start **MySQL**.
2. Open `http://localhost/phpmyadmin` and create a database named `farmdirect`.
3. Open a separate terminal in the project's `server` folder and run `npm install`.
4. Check that `server/.env` contains the following connection settings (the default XAMPP `root` account usually has no password):

#### Environment Variables (`server/.env`):
```ini
DATABASE_URL="mysql://root:@localhost:3306/farmdirect"
JWT_SECRET="farmdirect_super_secret_jwt_key_session5_development_only_2026_dev_secure"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
PORT=5000
NODE_ENV="development"
```

#### Synchronize Database & Seed Demo Data:
Run these commands from the `server` folder:
```bash
npx prisma generate
npm run db:setup
npm run db:seed
npm run dev
```
The API server runs on **http://localhost:5000**.

---

## 🔑 Demo Accounts

The database includes predefined test accounts for streamlined evaluation:

| Role | Name | Email | Password | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Consumer** | Arun Kumar | `arun@example.com` | `DemoConsumer123!` | Active buyer account |
| **Farmer** | Ravi | `ravi@farmdirect.example` | `DemoFarmer123!` | Verified farm (`Ravi Farms`) |

> [!NOTE]
> On the `/login` page, clicking **"Continue as Consumer"** or **"Continue as Farmer"** automatically authenticates against the live backend API using these credentials. Newly registered farmers created via `/register` will have `verified: false` and `verificationStatus: "PENDING"`.

---

## 📡 API Documentation

Base URL: `http://localhost:5000/api`

### Health Check
| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | None | Public | Returns service status and MySQL connectivity probe |

### Authentication
| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | None | Public | Registers a new Consumer or Farmer, sets HTTP-only cookie |
| `POST` | `/auth/login` | None | Public | Authenticates credentials, sets HTTP-only JWT cookie |
| `POST` | `/auth/logout` | None | Public | Clears `farmdirect_token` cookie and invalidates session |
| `GET` | `/auth/me` | Yes (Cookie) | Any | Returns authenticated user info and associated profile |

### Users & Profiles
| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/users/me` | Yes | Any | Returns authenticated user profile |
| `PATCH` | `/users/me` | Yes | Any | Updates name, phone, and delivery location |
| `GET` | `/consumers/me` | Yes | `CONSUMER` | Returns consumer profile, orders, and favorites |
| `GET` | `/farmers/me` | Yes | `FARMER` | Returns private farmer store data, inventory, and stats |

### Public Farmers
| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/farmers` | None | Public | Returns list of registered farms (safe public fields only) |
| `GET` | `/farmers/:id` | None | Public | Returns single farm profile with its active products |

### Products
| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/products` | None | Public | Returns active products (supports `category`, `search`, `farmerId`) |
| `GET` | `/products/:id` | None | Public | Returns single product detail with transparency record |
| `POST` | `/products` | Yes | `FARMER` | Creates a new product for the authenticated farmer |
| `PATCH` | `/products/:id` | Yes | `FARMER` | Updates farmer's own product (rejects unauthorized access) |
| `DELETE` | `/products/:id` | Yes | `FARMER` | Deletes farmer's own product |

---

## 🔒 Security Architecture
- **HTTP-Only Cookies**: Authentication tokens are stored in `httpOnly`, `sameSite: 'lax'` cookies, completely immune to XSS token theft.
- **No Passwords in LocalStorage**: LocalStorage token storage from Session 4 is retired; the backend is the single source of truth.
- **Role Enforcement**: Route permissions are validated on the server from the signed database user session.
- **Password Hashing**: Stored using bcrypt with 10 salt rounds. Plaintext passwords and password hashes are never exposed.
- **Input Validation**: All request bodies, query params, and route parameters are strictly sanitized and parsed with Zod schemas.

---

## 🔮 Scope Boundaries (Session 5 vs Session 6)
- **Session 5 Scope**: Real Backend, MySQL Database, Prisma ORM, JWT Authentication via HTTP-only cookies, Role Authorization, and API Foundation.
- **Deferred to Session 6+**: Real payment gateways (Razorpay/Stripe), delivery dispatch APIs, dynamic AI product generation, QR code generation, and complex order checkout fulfillment.
