# Premiura - Premium Clothing & Fabric Studio

This project has been successfully migrated from Vite to Next.js (App Router).

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v4 & PostCSS
- **State Management**: React Context API
- **Animations**: Framer Motion
- **Payments**: Stripe Checkout
- **Database Backend**: Firebase

## Setup & Running Locally

1. **Install Dependencies**
   Make sure you have Node installed, then run:
   ```bash
   npm install
   ```

2. **Environment Variables**
   Ensure your `.env` file contains necessary keys (e.g. Firebase credentials, Stripe Secret Key):
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   ```

3. **Start Development Server**
   Run the following command to start the Next.js development server:
   ```bash
   npm run dev
   ```
   *Note: If a process was previously running on port 3000 (like the Vite express server), make sure to stop it or Next.js will automatically pick the next available port (e.g., 3001).*

4. **Build for Production**
   ```bash
   npm run build
   ```

5. **Start Production Server**
   ```bash
   npm start
   ```

## Next.js Project Structure

- `app/` - Contains all Next.js Pages and App Router architecture.
  - `app/layout.tsx` - Root layout containing Next.js Metadata for SEO, Providers, Navigation, and Footer.
  - `app/page.tsx` - The home page.
  - `app/api/...` - Next.js Route Handlers (Replaces old custom Express Server API logic).
- `src/components/` - Global components optimized for Next.js.
- `src/context/` - Client-side state managed through contexts.
- `next.config.mjs` - Next.js configuration. Configured hostnames for `next/image` optimizing.
- `postcss.config.mjs` - PostCSS configuration required by Tailwind CSS v4 in standard Next.js setup.

## Firebase Database Schema

To correctly run this project, your Firestore database requires **6 main collections**. Below is the exact schema, including what you have correctly defined and the **missing or incorrect fields** you need to adjust to match the frontend application (`src/types.ts`).

### 1. `products` Collection
**Missing/Required adjustments:** You must add `category`, `subcategory`, `rating` (number), and `reviewsCount` (number) otherwise the app will break or fail to filter correctly.

- `name` (string)
- `description` (string)
- `category` (string) - **MISSING** (Must be strictly `"clothing"` or `"fabric"`)
- `subcategory` (string) - **MISSING** (e.g., `"T-Shirts"`, `"Denim"`)
- `gender` (string) - (e.g., `"men"`, `"women"`, `"kids"`, `"unisex"`)
- `price` (number/int64)
- `priceINR` (number/int64)
- `priceUSD` (number/int64)
- `images` (array of strings)
- `stock` (number/int64)
- `sellerId` (string)
- `sellerName` (string)
- `rating` (number/int64) - **MISSING** (Default to 0)
- `reviewsCount` (number/int64) - **MISSING** (Default to 0)
- `createdAt` (string/timestamp) - *(You have `updatedAt` but you also need `createdAt`)*
- `color` (string) - *Optional*
- `isTrending` (boolean) - *Optional*
- `season` (string) - *Optional* (`"summer"`, `"winter"`, `"all"`)
- `variants` (map) - *Optional* (Contains `sizes`: array of strings, `colors`: array of strings)
- `fabricInfo` (map) - **REQUIRED if category is "fabric"** (Contains `gsm`: number, `material`: string, `colors`: array, `minOrder`: number)

### 2. `users` Collection
**Status:** Your defined schema is **perfect**.

- `uid` (string)
- `email` (string)
- `displayName` (string)
- `photoURL` (string)
- `role` (string) - (`"admin"`, `"seller"`, or `"user"`)
- `address` (string)
- `createdAt` (string)

### 3. `orders` Collection
**Missing/Required adjustments:** The `items` array must be an array of objects (maps), not an array of empty strings.

- `userId` (string)
- `items` (array of MAPS) - **CORRECTION REQUIRED** (Each object must contain:)
  - `productId` (string)
  - `name` (string)
  - `price` (number/int64)
  - `quantity` (number/int64)
  - `variant` (string) - *Optional*
  - `isFabric` (boolean) - *Optional*
- `totalAmount` (number/int64)
- `advancePaid` (number/int64)
- `status` (string) - (`"pending"`, `"paid"`, `"shipped"`, `"delivered"`, `"cancelled"`)
- `paymentMethod` (string) - (`"cod"`, `"online"`)
- `shippingAddress` (string)
- `createdAt` (string)

### 4. `reviews` Collection
**Missing/Required adjustments:** The `rating` field must be a number datatype, not a string.

- `productId` (string)
- `userId` (string)
- `userName` (string)
- `rating` (number/int64) - **CORRECTION REQUIRED** (Change from string to number format, e.g., 5)
- `comment` (string)
- `createdAt` (string)

### 5. `hero` Collection
**Status:** Works with Admin Panel. Add items directly from `/admin`.

- `image` (string url)
- `tag` (string)
- `title` (string)
- `description` (string)
- `primaryBtn` (map)
  - `text` (string)
  - `link` (string)
- `secondaryBtn` (map)
  - `text` (string)
  - `link` (string)
- `createdAt` (string/timestamp)

### 6. `budgetSpotlight` Collection
**Status:** Designed to configure "Budget Spotlight" / "Exclusive Deals" items dynamically via `/admin`.

- `brand` (string)
- `deal` (string) e.g., "UNDER 499"
- `img` (string url)
- `createdAt` (string/timestamp)
