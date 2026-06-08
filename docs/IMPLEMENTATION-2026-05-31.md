# Implementation Notes - 2026-05-31

This document records the work completed today while moving the project from the older React + Vite plan toward the current Next.js application structure.

## High-Level Summary

The project now has a Next.js client foundation with:

- a real TakaSmart home page instead of the default Next.js starter screen
- a reusable API helper for calling the Express backend
- an authentication context for session state
- login and registration pages
- protected seller, buyer, and admin dashboard placeholders
- application-level provider wiring
- updated README documentation for the Next.js direction
- an archived copy of the old Vite README for reference

The backend auth endpoints are not implemented yet, so the frontend auth flow is structurally ready but not end-to-end functional until the Express server exposes the expected routes.

## Follow-Up Implementation - 2026-06-01

This section records the follow-up work completed after the initial Next.js/auth foundation. The focus was on making the current frontend easier to preview without backend authentication and improving the visual quality of the Sprint 1 screens.

### Summary Of 2026-06-01 Changes

What was added:

- development-only dashboard preview mode
- reusable `BrandMark` component
- reusable `DashboardShell` component
- elevated home page design
- elevated login page design
- elevated register page design
- elevated seller, buyer, and admin dashboard stubs
- clearer Sprint 2 placeholder messaging
- light global styling cleanup

What stayed the same:

- the app still uses Next.js App Router
- dashboards are still protected by `ProtectedRoute`
- the real backend auth routes are still pending
- preview mode does not create a real server session

Why this follow-up was needed:

The frontend auth structure existed, but there was no way to see the dashboards without implementing backend auth first. A temporary preview path was added so the UI can be reviewed and refined while backend authentication is still in progress. After that, the screens were visually improved so the project feels more like a real marketplace product and less like raw scaffolding.

## 2026-06-01 Client Components

### `client/src/components/BrandMark.tsx`

Purpose:

This component is the reusable TakaSmart identity block.

What was implemented:

- A compact `TS` square mark.
- A two-line text lockup:
  - `TakaSmart`
  - `AI marketplace`
- A `href` prop so the mark can link somewhere, defaulting to `/`.
- Uses `next/link` so navigation stays inside the Next.js app.

Why:

Several pages needed the same brand identity: home, login, register, and dashboard headers. Repeating the same logo/name markup in every file would make future brand changes tedious and inconsistent.

How it works:

Any page can render:

```tsx
<BrandMark />
```

or pass a custom destination:

```tsx
<BrandMark href="/login" />
```

Current usage:

- `client/app/page.tsx`
- `client/app/login/page.tsx`
- `client/app/register/page.tsx`
- `client/src/components/DashboardShell.tsx`

Design role:

This is not a final logo system. It is a clean placeholder brand mark for Sprint 1 that gives the UI a consistent identity until a formal brand/logo is designed.

### `client/src/components/DashboardShell.tsx`

Purpose:

This component provides a shared dashboard layout for seller, buyer, and admin pages.

What was implemented:

- Top dashboard header.
- Shared `BrandMark`.
- Signed-in user name display.
- Sign out button.
- Dashboard eyebrow text.
- Dashboard title.
- Dashboard description.
- Small "Today" stats panel.
- Content slot for each dashboard page.

Props:

```ts
type DashboardShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  userName?: string;
  onLogout: () => void;
  children: React.ReactNode;
};
```

Why:

The seller, buyer, and admin dashboards all need the same page frame. Without a shared shell, each dashboard would duplicate:

- header layout
- brand area
- logout button
- title section
- summary panel
- page spacing

Duplicating that code would make small design changes expensive and would increase the chance that dashboards drift visually.

How it works:

Each dashboard page wraps its unique content inside `DashboardShell`.

Example shape:

```tsx
<DashboardShell
  eyebrow="Seller dashboard"
  title={`Welcome, ${user.name}`}
  description="Manage recyclable material listings..."
  userName={user.name}
  onLogout={() => void logout()}
>
  <SellerSpecificContent />
</DashboardShell>
```

Design role:

This creates a consistent operational dashboard style: restrained, clean, and ready for repeated workflows rather than a marketing-style layout.

Current limitation:

The "Today" stats panel currently shows placeholder zero values:

- `0 active`
- `0 pending`
- `0 messages`

These should later be connected to real backend data.

## 2026-06-01 Auth Preview Changes

### `client/src/context/AuthContext.tsx`

Additional purpose:

Beyond real auth state, this file now supports temporary development preview users.

What was added:

- `previewAs(userType: UserType)`
- Preview user creation for:
  - seller
  - buyer
  - admin
- Logout behavior that skips the backend `/auth/logout` request for preview users.

Why:

Before backend auth exists, protected dashboards cannot be reached normally because:

- `/auth/me` does not exist yet
- login cannot create a real cookie session
- protected pages redirect unauthenticated users to `/login`

The preview mode creates a temporary frontend-only user so protected dashboards can be reviewed before backend auth is done.

How it works:

Calling:

```ts
previewAs("SELLER")
```

creates a temporary user like:

```ts
{
  id: "preview-seller",
  name: "Preview Seller",
  phoneNumber: "+254700000000",
  userType: "SELLER",
  verified: true
}
```

Then the page can redirect to:

```ts
dashboardByUserType[user.userType]
```

Preview users are identified by IDs that start with:

```text
preview-
```

On logout, if the user is a preview user, the frontend clears local state and routes to `/login` without calling the backend.

Important limitation:

Preview auth exists only in memory. If the page is refreshed, the preview user is lost and the dashboard redirects back to `/login`.

Security note:

This is not a real authentication system. It is only for local UI preview while backend auth is missing.

### `client/app/login/page.tsx`

Additional purpose:

The login page now acts as both the real sign-in form and the temporary dashboard preview entry point.

What was added:

- Development preview panel.
- Preview buttons for:
  - Seller
  - Buyer
  - Admin
- Calls `previewAs()` when a preview button is clicked.
- Routes the preview user to the matching dashboard.
- Improved visual layout with a two-column desktop structure.

Why:

The user needed a way to view `/seller`, `/buyer`, and `/admin` before backend auth was implemented. Putting preview buttons on `/login` keeps the temporary behavior discoverable but clearly separate from real auth.

How it works:

When the Seller preview button is clicked:

```ts
const user = previewAs("SELLER");
router.push(dashboardByUserType[user.userType]);
```

Equivalent flow exists for Buyer and Admin.

Development-only behavior:

The preview buttons are wrapped in:

```tsx
process.env.NODE_ENV === "development"
```

This means they are intended to appear during local development and not as a production-facing feature.

Design changes:

- Added `BrandMark`.
- Added a structured card for the login form.
- Added a dark preview panel.
- Improved field styling.
- Improved error styling.
- Added explanatory text that preview mode does not create a real session.

## 2026-06-01 Page Design Updates

### `client/app/page.tsx`

Purpose:

This remains the public entry page for the application.

What changed:

- Replaced the very simple first-pass hero with a more polished marketplace entry screen.
- Added a top header with `BrandMark`.
- Added Sign in and Register navigation.
- Added stronger product positioning:
  - Nairobi recycling marketplace
  - sellers posting recyclable materials
  - buyers discovering nearby supply
  - AI-assisted matching
- Added a marketplace preview panel.
- Added material category rows for:
  - Plastic
  - Metal
  - Paper
  - Glass
  - E-waste
- Added a sample listing-style card:
  - `42 kg PET bottles`
  - nearest buyer distance
  - sample KES/kg range
  - sample match time

Why:

The home page needed to feel like the beginning of the actual TakaSmart product, not just a generic landing placeholder. It still stays simple, but it now communicates the marketplace concept visually and immediately.

How it works:

This page remains a public server-rendered Next.js page. It uses:

- `next/link` for navigation
- `BrandMark` for consistent identity
- static placeholder marketplace data

Current limitation:

The marketplace preview data is hardcoded. It is visual/product context only and is not connected to backend listings yet.

### `client/app/register/page.tsx`

Purpose:

This remains the registration page for creating seller or buyer accounts.

What changed:

- Added `BrandMark`.
- Reworked the layout into a two-column desktop design.
- Added explanatory product copy about seller and buyer account types.
- Added small informational cards:
  - Seller: `Post recyclable materials`
  - Buyer: `Source nearby supply`
- Improved the account creation form styling.
- Improved the role selector styling.
- Improved error presentation.

Why:

Registration is one of the first serious product moments. It should clearly explain the difference between user types without becoming a long onboarding flow.

How it works:

The form behavior did not change. It still calls:

```ts
register({ name, phoneNumber, password, userType })
```

and then routes the user to their dashboard based on returned `userType`.

Current limitation:

The backend `/auth/register` route still does not exist, so real registration still cannot complete yet.

### `client/app/seller/page.tsx`

Purpose:

This is the protected seller dashboard stub.

What changed:

- Replaced the earlier three-card dashboard layout with the shared `DashboardShell`.
- Kept the dashboard protected with:

```tsx
<ProtectedRoute allowedUserType="SELLER">
```

- Added exact Sprint 1 stub message:

```text
Post a listing - coming soon
```

- Added a short description of what the Sprint 2 listing flow will support:
  - material type
  - quantity
  - photos
  - location
  - AI-assisted price suggestions
- Added placeholder feature chips:
  - Material details
  - Pickup location
  - Price guidance
- Added a setup status side panel explaining:
  - profile state is connected
  - protected routing is active
  - backend auth is next

Why:

This aligns the Next.js dashboard with the original Sprint 1 intent: a stub only, not full functionality. It also makes the stub feel deliberate instead of empty.

How it works:

The page:

1. reads `user` and `logout` from `useAuth()`
2. uses `ProtectedRoute` to require `SELLER`
3. passes seller-specific copy into `DashboardShell`
4. renders a seller-specific placeholder content area

Current limitation:

There is no create-listing form yet. That belongs in Sprint 2.

### `client/app/buyer/page.tsx`

Purpose:

This is the protected buyer dashboard stub.

What changed:

- Replaced the earlier three-card dashboard layout with the shared `DashboardShell`.
- Kept the dashboard protected with:

```tsx
<ProtectedRoute allowedUserType="BUYER">
```

- Added exact Sprint 1 stub message:

```text
Marketplace - coming soon
```

- Added a short description of what the Sprint 2 marketplace will support:
  - material listings
  - proximity filters
  - seller details
  - buyer interest actions
- Added placeholder feature chips:
  - Nearby listings
  - Material filters
  - Seller messages
- Added a setup status side panel explaining:
  - role-based routing is active
  - marketplace UI is scaffolded
  - listing APIs are pending

Why:

This aligns the buyer dashboard with the original Sprint 1 goal: show a clear placeholder for the future marketplace without building Sprint 2 functionality too early.

How it works:

The page:

1. reads `user` and `logout` from `useAuth()`
2. uses `ProtectedRoute` to require `BUYER`
3. passes buyer-specific copy into `DashboardShell`
4. renders a buyer-specific placeholder content area

Current limitation:

There is no listing browsing, filtering, or buyer interest flow yet. Those belong in Sprint 2.

### `client/app/admin/page.tsx`

Purpose:

This is the protected admin dashboard stub.

What changed:

- Replaced the earlier simple dashboard layout with the shared `DashboardShell`.
- Kept the dashboard protected with:

```tsx
<ProtectedRoute allowedUserType="ADMIN">
```

- Added three admin placeholder cards:
  - Users
  - Listings
  - Activity
- Each card is marked `Coming soon`.

Why:

The Prisma schema includes an `ADMIN` role, and `dashboardByUserType` maps admins to `/admin`. This route needs to exist so admin preview users and future real admin users do not land on a missing page.

How it works:

The page:

1. reads `user` and `logout` from `useAuth()`
2. uses `ProtectedRoute` to require `ADMIN`
3. passes admin-specific copy into `DashboardShell`
4. renders admin placeholder cards

Current limitation:

No real admin management tools exist yet. User management, listing moderation, and activity monitoring are future features.

### `client/app/globals.css`

Purpose:

This file controls global styling values for the Next.js client.

What changed:

- Changed the global background from pure white to the app's light marketplace background:

```css
--background: #f4f7f1;
```

- Changed the global foreground to the app's green-black text color:

```css
--foreground: #123526;
```

- Removed the automatic dark-mode color swap from the first scaffold.
- Added global `box-sizing: border-box`.
- Added custom text selection colors.

Why:

The default starter styling was too generic and dark-mode switching created inconsistent visuals for the current custom palette. The app now has a more controlled base visual system.

How it works:

Pages still mostly use Tailwind utility classes, but global CSS now provides stable defaults for:

- page background
- text color
- box sizing
- selected text color

Current limitation:

This is not a full design system. It is a lightweight global baseline for the Sprint 1 frontend.

## Root Project Files

### `README.md`

Purpose:

This is now the main project README for the current Next.js version of TakaSmart AI.

What changed:

- Replaced the outdated React + Vite stack description with the current stack:
  - Next.js 16
  - React 19
  - TypeScript
  - Tailwind CSS
- Updated the client project structure to match the Next.js App Router layout.
- Changed frontend local URL from `http://localhost:5173` to `http://localhost:3000`.
- Updated frontend scripts to match `client/package.json`:
  - `npm run dev`
  - `npm run build`
  - `npm start`
  - `npm run lint`
- Added `NEXT_PUBLIC_API_URL=http://localhost:5000` as the expected client environment variable.

Why:

The old README described a Vite app with `src/App.jsx`, `main.jsx`, and React Router. The project has moved to Next.js, so keeping those instructions in the primary README would cause confusion.

How it fits:

This is the source of truth for how to set up and run the current project.

### `README.old-vite.md`

Purpose:

This file preserves the old React + Vite README as an archive.

What changed:

- Added a separate file containing the earlier Vite-based project notes.
- Added a note at the top explaining that it is archived and not the active setup.

Why:

You wanted to keep both versions. This keeps the active README clean while still preserving the old plan for reference.

How it fits:

Use this only when you want to look back at the older Vite architecture or compare how the project direction changed.

## Client Application

### `client/src/lib/api.ts`

Purpose:

This file provides one shared API helper for calling the Express backend from the Next.js frontend.

What was implemented:

- Removed the Axios-based implementation.
- Replaced it with a typed `fetch` wrapper.
- Added `API_URL`:

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
```

- Added cookie support with:

```ts
credentials: "include"
```

- Added JSON body handling for normal requests.
- Added support for `FormData` bodies.
- Added `ApiError` for structured API failures.
- Added automatic browser redirect to `/login` when a request returns `401`.
- Exported simple HTTP helpers:
  - `apiClient.get`
  - `apiClient.post`
  - `apiClient.put`
  - `apiClient.patch`
  - `apiClient.delete`

Why:

The previous file imported `axios`, but `axios` was not installed in `client/package.json`, causing the Next.js production build to fail. Using `fetch` avoids adding a dependency and works naturally in Next.js.

How it works:

Every request goes through the internal `request<T>()` function. It builds a full backend URL, sends cookies, parses the response, and throws `ApiError` when the backend returns a non-success status.

Expected backend shape:

The frontend currently expects backend routes such as:

- `GET /auth/me`
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`

These routes still need to be created in the Express backend.

### `client/src/context/AuthContext.tsx`

Purpose:

This file provides global authentication state for the Next.js client.

What was implemented:

- Created `AuthProvider`.
- Created `useAuth()` custom hook.
- Added `user` state.
- Added `loading` state.
- Added `login()`.
- Added `register()`.
- Added `logout()`.
- Added `refreshUser()`.
- On app load, calls:

```ts
GET /auth/me
```

to restore the session if a valid auth cookie exists.

Why:

In the old Vite plan, this would have been `src/context/AuthContext.jsx`. In Next.js with TypeScript, the equivalent is a client component at `src/context/AuthContext.tsx`.

How it works:

- `AuthProvider` runs once around the app.
- When the app loads, it checks whether the user already has a valid backend session.
- Login/register call the backend and store the returned `user`.
- Logout calls the backend and clears the frontend user state.
- `useAuth()` gives any client component access to auth state and actions.

Current user type model:

```ts
export type UserType = "SELLER" | "BUYER" | "ADMIN";
```

This matches the user types in the Prisma schema.

### `client/src/components/ProtectedRoute.tsx`

Purpose:

This file protects dashboard pages from unauthenticated users or users with the wrong role.

What was implemented:

- Added `ProtectedRoute`.
- Added `LoadingScreen`.
- Added `dashboardByUserType`.

Route mapping:

```ts
SELLER -> /seller
BUYER  -> /buyer
ADMIN  -> /admin
```

Why:

The old Vite plan used a React Router `ProtectedRoute`. In Next.js, there is no `BrowserRouter`, so this protection is implemented as a client component that wraps protected page content.

How it works:

- If auth is still loading, it shows a loading spinner.
- If no user exists, it redirects to `/login`.
- If the user exists but has the wrong user type, it redirects to the correct dashboard.
- If the user is allowed, it renders the protected page content.

Important note:

This protects the user experience in the browser. Real security still needs backend authorization checks on protected API endpoints.

## Next.js App Router Files

### `client/app/providers.tsx`

Purpose:

This file provides client-side context providers to the App Router tree.

What was implemented:

- Created a `Providers` component.
- Wrapped all children with `AuthProvider`.

Why:

`client/app/layout.tsx` is a server component by default. Since `AuthProvider` uses hooks like `useState`, `useEffect`, and `useRouter`, it must live inside a `"use client"` wrapper.

How it works:

`layout.tsx` imports `Providers` and wraps the app with it. This makes `useAuth()` available throughout the client-side app.

### `client/app/layout.tsx`

Purpose:

This is the root layout for the Next.js application.

What changed:

- Imported `Providers`.
- Wrapped `{children}` with `<Providers>`.
- Updated metadata from the default Next.js text to TakaSmart branding:

```ts
title: "TakaSmart AI"
description: "AI-powered recyclable waste marketplace for Nairobi."
```

Why:

The old metadata still said `Create Next App`. The layout also needed provider wiring so all pages can access auth state.

How it works:

All routes rendered inside this layout now have access to the auth context.

### `client/app/page.tsx`

Purpose:

This is the public home page.

What changed:

- Removed the default Next.js starter page.
- Added a TakaSmart landing entry screen.
- Added navigation links to:
  - `/register`
  - `/login`

Why:

The project needed an actual product entry page instead of the starter instructions.

How it works:

This is a server-rendered public page with simple Next.js `Link` navigation.

### `client/app/login/page.tsx`

Purpose:

This is the login page.

What was implemented:

- Phone number input.
- Password input.
- Submit state.
- Error state.
- Calls `login()` from `useAuth()`.
- Redirects the user to their role-specific dashboard after login.

Why:

The auth plan needed a login route, but in Next.js it becomes `app/login/page.tsx` instead of a React Router route inside `App.jsx`.

How it works:

On submit, the page calls:

```ts
login({ phoneNumber, password })
```

The auth context then calls:

```ts
POST /auth/login
```

If the backend returns a user, the page redirects to `/seller`, `/buyer`, or `/admin`.

### `client/app/register/page.tsx`

Purpose:

This is the registration page.

What was implemented:

- Name input.
- Phone number input.
- Password input.
- Account type selector:
  - Seller
  - Buyer
- Submit state.
- Error state.
- Calls `register()` from `useAuth()`.
- Redirects the user to their role-specific dashboard after registration.

Why:

The app needs separate onboarding for marketplace user types. This creates the frontend structure for that flow.

How it works:

On submit, the page calls:

```ts
register({ name, phoneNumber, password, userType })
```

The auth context then calls:

```ts
POST /auth/register
```

If registration succeeds, the returned user type determines the next dashboard.

### `client/app/seller/page.tsx`

Purpose:

This is the protected seller dashboard placeholder.

What was implemented:

- Wrapped page content in:

```tsx
<ProtectedRoute allowedUserType="SELLER">
```

- Shows a personalized welcome message.
- Adds sign out button.
- Adds placeholder areas:
  - Create listing
  - My listings
  - Buyer interest

Why:

Sellers need a dedicated area to create and manage recyclable material listings.

How it works:

Only authenticated users with `userType === "SELLER"` can view this page. Others are redirected.

### `client/app/buyer/page.tsx`

Purpose:

This is the protected buyer dashboard placeholder.

What was implemented:

- Wrapped page content in:

```tsx
<ProtectedRoute allowedUserType="BUYER">
```

- Shows a personalized welcome message.
- Adds sign out button.
- Adds placeholder areas:
  - Browse listings
  - Saved materials
  - Messages

Why:

Buyers need a dedicated area for discovering listings and contacting sellers.

How it works:

Only authenticated users with `userType === "BUYER"` can view this page. Others are redirected.

### `client/app/admin/page.tsx`

Purpose:

This is the protected admin dashboard placeholder.

What was implemented:

- Wrapped page content in:

```tsx
<ProtectedRoute allowedUserType="ADMIN">
```

- Shows a personalized welcome message.
- Adds sign out button.
- Adds placeholder areas:
  - Users
  - Listings
  - Platform activity

Why:

The Prisma schema includes an `ADMIN` user type. Adding this page prevents admin users from being redirected to a missing route.

How it works:

Only authenticated users with `userType === "ADMIN"` can view this page. Others are redirected.

## What Was Intentionally Not Implemented

### `client/src/App.jsx`

Not needed.

Reason:

Next.js App Router uses folder-based routing under `client/app/`. There is no need for a central React Router file.

### `BrowserRouter` and `Routes`

Not needed.

Reason:

Next.js handles routing automatically through the filesystem.

### `client/src/services/api.js`

Not created.

Reason:

The project already had `client/src/lib/api.ts`. Since this is a TypeScript Next.js app, the API helper belongs there.

### Axios

Not added.

Reason:

The project did not have Axios installed, and the earlier Axios import caused the build to fail. The current `fetch` helper provides the needed behavior without another dependency.

### Backend auth routes

Not implemented today.

Reason:

Today's work focused on the correct Next.js frontend plan. The Express backend still needs the matching endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

## Validation

The frontend production build was run successfully:

```bash
npm run build
```

Result:

- Next.js compiled successfully.
- TypeScript passed.
- Static pages generated successfully.

Routes generated:

- `/`
- `/login`
- `/register`
- `/seller`
- `/buyer`
- `/admin`

The frontend dev server was also started and verified on:

```text
http://localhost:3000
```

Additional validation after the 2026-06-01 preview and design updates:

- `npm run build` completed successfully again.
- TypeScript passed after adding:
  - `BrandMark`
  - `DashboardShell`
  - `previewAs`
  - redesigned home/auth/dashboard pages
- Next.js generated the same expected routes:
  - `/`
  - `/login`
  - `/register`
  - `/seller`
  - `/buyer`
  - `/admin`
- The development server was already available at:

```text
http://localhost:3000
```

Manual preview path:

1. Open `http://localhost:3000/login`.
2. Use the development preview buttons:
   - Seller
   - Buyer
   - Admin
3. Confirm the app routes to the matching dashboard.
4. Use Sign out to return to `/login`.

## Current Limitations

The frontend pages exist and build correctly, but authentication cannot fully work until the backend implements the expected auth API.

Protected dashboards still redirect to `/login` during a normal direct visit because `GET /auth/me` has no backend route yet.

Development preview mode can temporarily bypass this for UI review, but it is not persistent and does not create a backend session.

If a dashboard page is refreshed while using preview mode, the preview user is lost because it only lives in React state.

Login and register forms will show an error until the backend accepts:

- phone number
- password
- user type
- session cookie creation

Design limitations:

- Home page marketplace data is static placeholder content.
- Dashboard stats show placeholder zero values.
- Seller dashboard does not yet create listings.
- Buyer dashboard does not yet browse real listings.
- Admin dashboard does not yet manage real users, listings, or activity.
- The `TS` brand mark is a Sprint 1 identity placeholder, not a final logo.

## Recommended Next Step

Implement backend authentication in `server/src`:

- create auth routes
- create auth controller
- hash passwords with `bcryptjs`
- issue JWT in an HTTP-only cookie
- implement `/auth/me`
- implement `/auth/logout`
- connect the routes in `server/src/index.js`

After that, the frontend auth flow added today can be tested end to end.
