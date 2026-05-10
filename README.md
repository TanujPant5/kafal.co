# Kafal.co — E-Commerce Platform

A full-stack MERN e-commerce platform for handcrafted mountain goods from Uttarakhand. Consists of a Node.js/Express backend, a consumer-facing React storefront, and an admin React dashboard — with Razorpay payment integration.

## Project Structure

```
kafal.co/
├── backend/              # Express.js REST API
├── consumer-frontend/    # React storefront (Vite)
├── admin-frontend/       # React admin dashboard (Vite)
└── README.md
```

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env     # Fill in your actual values
npm install
npm run dev              # Starts on http://localhost:5000
```

### 2. Consumer Frontend

```bash
cd consumer-frontend
cp .env.example .env     # Set API URL and Razorpay key
npm install
npm run dev              # Starts on http://localhost:5173
```

### 3. Admin Frontend

```bash
cd admin-frontend
cp .env.example .env     # Set API URL
npm install
npm run dev              # Starts on http://localhost:5174
```

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing admin JWT tokens |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API Key Secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `CLIENT_URLS` | Comma-separated allowed frontend URLs |

### Consumer Frontend (`.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Key ID (public) |

### Admin Frontend (`.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

## Razorpay Setup

1. Create an account at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Navigate to Settings → API Keys
3. Generate **Test Mode** keys
4. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in backend `.env`
5. Set `VITE_RAZORPAY_KEY_ID` in consumer frontend `.env`

> **Switching to Live Mode:** Replace test keys with live keys from the Razorpay dashboard. Test keys start with `rzp_test_`, live keys start with `rzp_live_`.

## Deployment

### Backend (Railway / Render)
1. Push `backend/` to a Git repo
2. Set all environment variables in the hosting dashboard
3. Set start command: `npm start`
4. Update `CLIENT_URLS` with your deployed frontend URLs

### Consumer Frontend (Vercel / Netlify)
1. Push `consumer-frontend/` to a Git repo
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set `VITE_API_URL` to your deployed backend URL
5. Set `VITE_RAZORPAY_KEY_ID` to your Razorpay key

### Admin Frontend (Vercel / Netlify)
1. Push `admin-frontend/` to a Git repo
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set `VITE_API_URL` to your deployed backend URL

## API Endpoints

### Public
- `GET /api/categories` — All categories
- `GET /api/products` — Products (filter: `?category=ID&search=term`)
- `GET /api/products/:id` — Single product
- `POST /api/orders/create` — Create Razorpay order
- `POST /api/orders/verify` — Verify payment & save order
- `GET /api/orders/track` — Track order (`?orderId=X` or `?email=X`)

### Admin (JWT protected)
- `POST /api/admin/login` — Login
- `GET /api/admin/orders` — All orders (filter: `?status=X`)
- `PATCH /api/admin/orders/:id/status` — Update order status
- `POST /api/admin/products` — Add product (multipart)
- `PUT /api/admin/products/:id` — Edit product (multipart)
- `DELETE /api/admin/products/:id` — Delete product
- `POST /api/admin/categories` — Add category
- `DELETE /api/admin/categories/:id` — Delete category

## Tech Stack
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), Razorpay, Cloudinary, JWT
- **Frontend:** React 18 (Vite), React Router, Axios, Lucide Icons
- **Design:** Custom CSS, Google Fonts (Playfair Display, DM Sans, DM Serif Display, Baloo 2)
