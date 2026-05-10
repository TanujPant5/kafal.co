# Kafal.co Deployment Guide

This project is configured for a MERN stack deployment with the backend on **Render** and frontends on **Vercel**.

## 🔗 Live Links
*   **Storefront:** [https://kafal-co.vercel.app](https://kafal-co.vercel.app)
*   **Admin Dashboard:** [https://kafal-co-admin.vercel.app](https://kafal-co-admin.vercel.app)
*   **Backend API:** [https://kafal-co.onrender.com](https://kafal-co.onrender.com)

---

## 🏗️ Deployment Architecture
*   **Backend:** Node/Express on Render (Web Service)
*   **Frontends:** React/Vite on Vercel (Two separate projects)
*   **Database:** MongoDB Atlas

---

## 🛠️ Environment Variables Configuration

### Backend (Render)
| Variable | Description |
|---|---|
| `PORT` | `10000` |
| `MONGO_URI` | MongoDB Connection String |
| `JWT_SECRET` | Secret for Admin Tokens |
| `CLIENT_URLS` | `https://kafal-co.vercel.app,https://kafal-co-admin.vercel.app` |
| `ADMIN_USERNAME` | Admin Login Username |
| `ADMIN_PASSWORD` | Admin Login Password |
| `RAZORPAY_KEY_ID` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET`| Razorpay Key Secret |
| `CLOUDINARY_...` | Cloudinary Credentials |

### Frontends (Vercel)
Both `consumer-frontend` and `admin-frontend` require:
*   `VITE_API_URL`: `https://kafal-co.onrender.com/api`

The `consumer-frontend` also requires:
*   `VITE_RAZORPAY_KEY_ID`: Razorpay Public Key

---

## 🔄 Updating the Project
1.  **Push to GitHub:** Any changes pushed to the `main` branch will automatically trigger redeployments on both Vercel and Render.
2.  **CORS Errors:** If you change your frontend URLs, remember to update the `CLIENT_URLS` variable on Render.
