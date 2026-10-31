# AR Fashion House - Complete Production Deployment Guide

This guide gives you step-by-step instructions to host the **AR Fashion House** e-commerce website and admin panel for free on **Render** (Recommended for zero-database-setup) or **Vercel** (with free Neon / Supabase PostgreSQL).

---

## Prerequisites: Push Code to GitHub

Before deploying to either Render or Vercel, push your project code to your GitHub account:

1. Open your terminal in the project directory:
   ```bash
   git add .
   git commit -m "Production release: Indian store details, clean admin panel, WhatsApp checkout"
   ```
2. Create a new repository on GitHub (e.g. `ar-fashion-house`).
3. Link your remote and push:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ar-fashion-house.git
   git branch -M main
   git push -u origin main
   ```

---

## Option 1: Deploy on Render.com (Recommended — Easiest, 100% Free)

Render runs a persistent Node.js environment where Next.js, SQLite database, and product uploads work out-of-the-box without configuring an external database.

### Step 1: Sign up & Connect GitHub
1. Go to [https://render.com](https://render.com) and sign in with GitHub.
2. Click **New +** in the top navigation and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and select your `ar-fashion-house` repository.

### Step 2: Configure Service Settings
Fill in the following fields:
- **Name:** `ar-fashion-house` (or your preferred store name)
- **Region:** `Singapore` (closest to India for fastest speeds) or `Frankfurt`
- **Branch:** `main` (or `master`)
- **Runtime:** `Node`
- **Build Command:**
  ```bash
  npm install --include=dev && npx prisma db push && npm run build
  ```
- **Start Command:**
  ```bash
  npm run start
  ```
- **Instance Type:** `Free`

### Step 3: Add Environment Variables
In the **Environment Variables** section, add:
| Key | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations |
| `JWT_SECRET` | `ar-fashion-house-prod-jwt-secret-2026-key` | Secure token key for Admin logins |
| `DATABASE_URL` | `file:./ar_fashion.db` | Local SQLite database location |

### Step 4: Deploy & Seed
1. Click **Create Web Service**.
2. Render will clone your code, generate Prisma client, build Next.js, and start the app.
3. Once the deployment says **"Live"**, your store will be live at `https://ar-fashion-house.onrender.com`.
4. Open the Render Shell tab and run:
   ```bash
   node prisma/seed.js
   ```
   *(This ensures your initial products, categories, Indian helpline, and admin account are loaded into the production database).*
5. Open `https://ar-fashion-house.onrender.com/admin/login` and log in:
   - **Email:** `admin@arfashion.com`
   - **Password:** `Admin@12345`

---

## Option 2: Deploy on Vercel (with Free Neon PostgreSQL)

Vercel is built specifically for Next.js. Because Vercel serverless functions are stateless, it requires a free cloud database like Neon.tech or Supabase.

### Step 1: Create a Free PostgreSQL Database on Neon.tech (Takes 1 Minute)
1. Go to [https://neon.tech](https://neon.tech) and sign up with GitHub or Google.
2. Click **Create Project**, name it `ar-fashion-house`, and select region **AWS Asia Pacific (Mumbai)**.
3. Neon will display your database connection string, for example:
   ```
   postgresql://username:password@ep-cool-butterfly-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Copy this connection string.

### Step 2: Switch Prisma Provider to PostgreSQL for Vercel
In `prisma/schema.prisma`, update the datasource:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Then run locally:
```bash
npx prisma db push
node prisma/seed.js
```
Commit and push the change to GitHub:
```bash
git add prisma/schema.prisma
git commit -m "Switch to PostgreSQL for Vercel deployment"
git push
```

### Step 3: Import Project to Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** -> **Project**.
3. Select your `ar-fashion-house` repository and click **Import**.
4. In **Environment Variables**, add:
   - `DATABASE_URL` = your Neon PostgreSQL connection string.
   - `JWT_SECRET` = `ar-fashion-house-super-secure-production-jwt-secret-key-2026`
   - `NODE_ENV` = `production`
5. Click **Deploy**.
6. Vercel will build and deploy your website to a custom `.vercel.app` URL within 60 seconds!

---

## Option 3: Deploy on Railway.app (1-Click Alternative)

1. Go to [https://railway.app](https://railway.app) and log in with GitHub.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `ar-fashion-house`.
4. In Variables, add `JWT_SECRET` and `NODE_ENV=production`.
5. Under Settings -> Networking, click **Generate Domain**.
6. Your website is live immediately!

---

## Production Security & Admin First Steps

Once your store is live:
1. Log in to `/admin/login` using `admin@arfashion.com` / `Admin@12345`.
2. Go to **Store Settings** (`/admin/settings`):
   - Confirm your Primary WhatsApp Number (`+917304396709`) and Secondary WhatsApp Number (`+918080010107`).
   - Add your physical showroom address if you have one.
   - Check the free shipping threshold and delivery fee.
3. Test a mock order on the live website:
   - Add a product to bag -> Checkout -> Verify that WhatsApp opens with the order details and the order appears on `/admin/orders`.
