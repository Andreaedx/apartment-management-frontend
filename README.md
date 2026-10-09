# Apartment Management – Frontend

React (Vite) frontend for the Apartment Management System ("RENT A HOME").

## Running locally
1. Start the backend first (see the backend README).
2. `npm install`
3. Copy `.env.example` to `.env`. The default `VITE_API_URL=http://localhost:5000` points at the local backend.
4. `npm run dev`, then open http://localhost:5173

`npm run lint` checks the code and `npm run build` creates the production build in `dist/`.

## Roles
- **Visitor:** browse properties at `/` and `/property/:id` without logging in.
- **Tenant:** tenancy, invoices, payments (can pay invoices) and maintenance requests.
- **Manager:** registers as a manager and is approved by an admin. Manages their own properties, apartments (with images), tenancies, invoices and maintenance requests.
- **Admin:** created with `npm run create-admin` on the backend. Manages users, approves manager requests, and can manage any property.

## Deploying
1. Set `VITE_API_URL` to the deployed backend URL in the hosting service's environment settings, then build.
2. On the backend, set `FRONTEND_URL` to this site's URL and `NODE_ENV=production` (see the backend README).
3. Deep links like `/properties` need every path to serve `index.html`. That's already configured for **Vercel** (`vercel.json`) and **Netlify** (`public/_redirects`).
