# TakaSmart AI — Implementation Log
**Date:** Tuesday, 28 July 2026  
**Session type:** Feature development (Dev B tasks — Sprints 3–5 Phase 2)

---

## 1. Codebase Refactor — Personal vs Business Dashboard Extraction

### Problem
`personal/page.tsx` and `business/page.tsx` shared approximately 500 lines of near-identical code. Any bug fix or change had to be made in both files, creating a silent drift risk.

### What was extracted

#### `src/lib/constants/materials.ts`
Moved shared pure-data constants out of both pages:
- `materialTypes`, `MaterialType`
- `materialStyles` — per-material badge colors and labels
- `statusStyle()` — returns text/border color for listing status
- `ticketSerial()` — formats a listing ID into a 6-character display serial
- Color palette: `INK`, `CREAM`, `PAPER`, `KRAFT`, `KRAFT_LIGHT`, `OCHRE`, `TEAL`, `RUST`, `GREEN`

#### `src/lib/uploadImage.ts`
Extracted the `uploadImage(file)` utility — builds FormData, POSTs to the upload endpoint, returns the image URL. Previously duplicated in both pages.

#### `src/hooks/useListings.ts`
Extracted all listing logic into a shared hook:
- State: `form`, `listings`, `loadingListings`, `submitting`, `message`, `error`, `photoError`, `uploadingPhotos`
- Handlers: `loadListings()`, `handlePhotoSelect()`, `removePhoto()`, `handleSubmit()`
- Both pages now call `useListings(user)` and destructure identical behavior.

#### `src/components/tickets/TicketIntakeForm.tsx`
Extracted the "Open a new ticket" form JSX (all 3 fieldsets: batch details, pickup location, photos). Props-driven — no internal state. Both pages render `<TicketIntakeForm ... />`.

#### `src/components/tickets/TicketsList.tsx`
Extracted the "My tickets" list JSX — handles loading, empty, and populated states. Accepts `listings`, `loadingListings`, `isPreview` as props.

### Result
- `personal/page.tsx`: ~305 lines → ~90 lines
- `business/page.tsx`: ~700 lines → ~250 lines (business-only code only)

---

## 2. UserType Correction — Frontend Normalisation

### Problem
The backend stores `userType` as `SELLER | BUYER | ADMIN` in the database. The `AuthContext` was using that same enum on the frontend, but the login and register pages were already using `PERSONAL` and `BUSINESS` — causing 11 TypeScript errors and breaking the preview flow.

### Decision
`PERSONAL` and `BUSINESS` are more descriptive and accurate for the frontend. The DB value `SELLER` is a backend concern only.

### Changes

#### `src/context/AuthContext.tsx`
- `UserType` redefined as `"PERSONAL" | "BUSINESS" | "BUYER" | "ADMIN"` — `SELLER` removed from the frontend entirely.
- New `RawUser` type matches what the `/me` API actually returns.
- New `normaliseUser()` function: maps `SELLER` → `PERSONAL` or `BUSINESS` using `sellerProfile.accountType`. This is the only place in the codebase that knows about the DB enum.
- `previewAs()` updated to produce correct preview users for all 4 types — Personal gets `uniqueCode: "TK-0000"`, Business gets `businessName: "Demo Business Ltd"`.

#### `src/components/ProtectedRoute.tsx`
- `getDashboardPath()` now routes directly off `user.userType` — no `sellerProfile.accountType` detour needed since the type is already normalised.
- `allowedUserType` prop is now strictly typed as `UserType`.

#### `src/hooks/useListings.ts`, `app/dashboard/business/page.tsx`, `app/seller/page.tsx`
- All `userType === "SELLER"` checks replaced with `userType === "PERSONAL" || userType === "BUSINESS"`.

### Result
Zero TypeScript errors. Preview buttons for Personal and Business route correctly to their respective dashboards.

---

## 3. Sprint 4 — Drop-offs, Points & Vouchers

### Backend endpoints consumed (all pre-existing, no backend changes)
| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/api/points/collection-points` | Browse all active collection points |
| POST | `/api/points/register` | Register at a collection point |
| GET | `/api/points/balances` | View points per collection point |
| POST | `/api/points/redeem` | Redeem points for a voucher |
| POST | `/api/dropoffs/log` | Log a user drop-off (business only) |
| GET | `/api/dropoffs/vouchers` | View all generated vouchers |

### `src/hooks/usePointsAndVouchers.ts`
New hook for the personal dashboard:
- Loads collection points, balances, and vouchers in parallel on mount.
- Skips all API calls for preview accounts.
- `registerAtCollectionPoint(id)` — handles 409 (already registered) gracefully as a success.
- `redeemPoints(cpId, points, currentPoints)` — enforces 100pt minimum client-side before calling the API. If below threshold, shows an inline error rather than blocking the button entirely (button is always visible and clickable).

### Personal dashboard additions (`app/dashboard/personal/page.tsx`)

**1. Unique drop-off code**  
Displays `user.sellerProfile.uniqueCode` prominently (e.g. `TK-2847`). Shows an animated skeleton if `uniqueCode` is null — it may not be generated yet for older accounts.

**2. Browse & register collection points**  
Grid of active collection points. Each card shows name, address, area, material tags, and a Register button. On success, the balances list refreshes automatically.

**3. Points per collection point**  
Balance cards with a visual progress bar toward 100 pts. Redeem button is always visible — if points < 100, clicking shows the message "You need at least 100 points. You have X pts at this collection point." On successful redemption, the voucher code is revealed in a highlighted card.

**4. Vouchers list**  
Shows all generated vouchers with code, KES value, partner name, Active/Redeemed status, and creation date.

### Business dashboard additions (`app/dashboard/business/page.tsx`)

**Log drop-off tab**  
Form fields: unique code (auto-uppercased), material type dropdown, quantity in kg.  
Calls `POST /api/dropoffs/log`. On success shows "X points awarded to [user]".  
Handles all three specific API error strings:
- "User code not found."
- "This user is not registered at your collection point."
- "No active collection point found for your account."

A reference panel on the right explains the workflow for staff.

---

## 4. Sprint 4 — Buyer Interest Flow

### Backend endpoints consumed
| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/api/listings/:id/interest` | Express interest on a listing |
| GET | `/api/listings/:id/interests` | Get all interested buyers for a listing |
| PATCH | `/api/listings/:id/interest/:interestId` | Accept or reject an interest |
| GET | `/api/users/notifications` | Get all notifications |
| PATCH | `/api/users/notifications/:id/read` | Mark one notification as read |
| PATCH | `/api/users/notifications/read-all` | Mark all as read |

### `src/hooks/useNotifications.ts`
- Fetches notifications on mount, skips preview accounts.
- `markRead(id)` — optimistic update, reverts on failure.
- `markAllRead()` — optimistic, reloads full list on failure.
- Exposes `unreadCount` as a derived value.

### `src/hooks/useListingInterests.ts`
- Keyed by `listingId` so multiple listings can have their drawers open simultaneously.
- `loadInterests(listingId)` — lazy loads on first expand.
- `updateInterestStatus(listingId, interestId, "ACCEPTED" | "REJECTED")` — patches in place, shows per-interest error on failure.

### `src/components/NotificationsPanel.tsx`
Shared component used by both seller dashboards:
- Unread count badge on the header.
- "Mark all read" button (only shown when there are unread items).
- `timeAgo()` helper for relative timestamps.
- Unread items highlighted with a teal border and tinted background.
- `INTEREST_ACCEPTED` notifications surface the seller's phone number inline.
- `INTEREST_RECEIVED` notifications navigate to the dashboard on click.
- Replaces the "Coming soon" placeholder in both personal and business dashboards.

### `src/components/tickets/TicketsList.tsx` — interests drawer
Each ticket card that has at least one interest shows a "View interested buyers" toggle. On first expand it lazily loads the interests list. Each buyer card shows:
- Company name, phone number
- Optional message (quoted)
- Status badge (Pending / Accepted / Rejected)
- Accept and Reject buttons — visible only while status is PENDING, hidden once actioned
- Per-interest error message on failure

### Buyer page (`app/buyer/page.tsx`)
Listings and `my-interests` are fetched in parallel on load and merged — each card knows its own interest state without extra round-trips.

**Express Interest flow:**
- Default state: "Express interest" button
- Clicked: inline form appears with optional message textarea
- Submitted: calls `POST /listings/:id/interest`
- After submission, `InterestIndicator` replaces the button:
  - **PENDING** — "Interest sent. Waiting for seller response."
  - **ACCEPTED** — green banner + seller phone number
  - **REJECTED** — rust banner with decline message

---

## 5. Sprint 5 — EPR Reports & Waste Logs

### Backend endpoints consumed
| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/api/epr/incoming` | Daily incoming waste log (defaults to today) |
| GET | `/api/epr/incoming?date=YYYY-MM-DD` | Incoming log for a specific date |
| GET | `/api/epr/outgoing` | Daily outgoing waste log |
| GET | `/api/epr/outgoing?date=YYYY-MM-DD` | Outgoing log for a specific date |
| GET | `/api/epr/monthly?month=M&year=YYYY` | Monthly EPR report as JSON |
| GET | `/api/epr/download?month=M&year=YYYY` | Monthly EPR as PDF (binary, not JSON) |

### `src/hooks/useEPR.ts`
- Daily logs load on mount and reload automatically when the date picker changes.
- `refreshDaily()` is exposed so the business page can call it after a successful drop-off, keeping the numbers live without a full page reload.
- `loadMonthly()` is on-demand — called when the user clicks "Preview report".
- `downloadPDF()` uses raw `fetch` with `credentials: "include"` — not `apiClient`, which would try to parse the binary response as JSON and fail.

### Business dashboard — EPR Reports tab
Replaces the Sprint 4 placeholder with three sections:

**1. Daily activity log**  
Date picker (defaults to today). Two side-by-side cards — Incoming (teal) and Outgoing (rust) — each showing total kg and a per-material breakdown list. Refreshes automatically after a drop-off is logged on the Log drop-off tab.

**2. Monthly EPR preview**  
Month and year dropdowns (month names, years 2025–2027). "Preview report" button calls `GET /epr/monthly`. On success renders:
- Business name and registration number
- Date range (from → to)
- Three summary metric cards: total incoming kg, total outgoing kg, net retained
- Two material breakdown tables (incoming and outgoing), each showing entry count

**3. PDF download**  
Appears inside the preview card once data is loaded. Downloads as `EPR_Report_YYYY_M.pdf`. Uses `fetch` directly per the sprint spec — never `apiClient`.

---

## 6. Sprint 5 Phase 2 — AI Listing Analysis

### Backend endpoint consumed
| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/api/ai/analyse` | Analyse an image, return condition + price suggestion |

### AI analysis response shape
```typescript
type AIAnalysis = {
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  conditionNote: string;      // one sentence describing what the AI sees
  materialMatch: boolean;     // does the photo match the selected material type?
  materialNote: string;       // one sentence confirming or correcting the material
  priceMin: number;           // minimum suggested KES price
  priceMax: number;           // maximum suggested KES price
  priceNote: string;          // one sentence explaining the price basis
};
```

### `src/hooks/useListings.ts` — extensions
- `initialForm` extended with `aiPriceMin`, `aiPriceMax`, `condition`, `conditionNote`.
- `AIAnalysis` and `IntakeFormState` types exported.
- `analysis`, `analysing`, `analyseError` state added.
- `handleAnalyse()` — calls `POST /ai/analyse` with `images[0]`, `materialType`, `quantityKg`. On success auto-fills form fields and advances `formStep` to 2.
- `formStep` (1 or 2), `skipToStep2()`, `backToStep1()` exported for the form component.
- `handleSubmit()` — now includes all AI fields in the POST body (`undefined` if empty, so they are omitted for listings without AI data).

### `src/components/tickets/TicketIntakeForm.tsx` — two-step form

**Step 1 — Details & photo**  
All existing fields unchanged. The photo strip labels the first image with a teal "AI uses this" indicator. At the bottom:
- **Analyse with AI** button — disabled until at least one photo is uploaded and material + quantity are filled. Shows "Analysing your waste..." during the 3–6 second API call.
- **Skip AI** link — advances to step 2 without analysis (allowed when title, quantity, and location are filled).

**Step 2 — Review & post**  
- `AICard` at the top — condition badge (colour-coded: Excellent=green, Good=teal, Fair=amber, Poor=red), suggested KES price range, price note, and a red mismatch warning if `materialMatch: false`.
- If AI was skipped, a neutral "No AI analysis" placeholder is shown instead.
- Three editable fields pre-filled from the AI: condition dropdown, AI price min, AI price max. Seller can change any of them before posting.
- Post button and a "← Back to step 1" link.

### Buyer marketplace (`app/buyer/page.tsx`) — AI data surfaced
- `Listing` type extended with `aiPriceMin`, `aiPriceMax`, `condition`, `conditionNote` (all nullable for backward compatibility with older listings).
- Each listing card shows the suggested price range (KES min — max) in the bottom-right of the weight row — only if both values exist.
- An AI assessment card (condition label + condition note) appears below the description — only if `condition` is present.

---

## 7. Tab Navigation Fix — Business Dashboard

### Problem
The business dashboard sidebar links used `?tab=log-dropoff` etc. as URLs, but the page used `useState` to control the active tab. Clicking sidebar links updated the URL but the page didn't react.

### Fix

#### `app/dashboard/business/page.tsx`
- Replaced `useState<Tab>` with `useSearchParams()` from Next.js.
- Active tab is now derived from the URL: `?tab=log-dropoff` → log-dropoff tab active. No `?tab` param → overview.
- Tab bar converted from `<button onClick>` to `<Link href>` — navigation updates the URL.
- Wrapped in `<Suspense>` as required by the App Router when using `useSearchParams`.

#### `src/components/DashboardShell.tsx`
- Added `useSearchParams()` to read the current `?tab=` param.
- Active-item highlight logic updated: checks both pathname and the `?tab` param against each nav item's href, so the correct sidebar item highlights for each tab.
- Shell component wrapped in `<Suspense>` to satisfy the App Router requirement.

---

## TypeScript status at end of session

**0 errors** across the entire codebase on `tsc --noEmit`.

The only errors present at session start were 11 pre-existing errors in `login/page.tsx` and `register/page.tsx` (a `UserType` mismatch). These were fixed as part of item 2 above.

---

## Files created or modified this session

### New files
| File | Purpose |
|------|---------|
| `src/lib/constants/materials.ts` | Shared material/status/color constants |
| `src/lib/uploadImage.ts` | Extracted upload utility |
| `src/hooks/useListings.ts` | Shared listings logic hook |
| `src/hooks/usePointsAndVouchers.ts` | Points, balances, vouchers hook |
| `src/hooks/useNotifications.ts` | Notifications hook |
| `src/hooks/useListingInterests.ts` | Per-listing interests hook |
| `src/hooks/useEPR.ts` | EPR daily logs + monthly report + PDF download |
| `src/components/tickets/TicketIntakeForm.tsx` | Two-step listing intake form |
| `src/components/tickets/TicketsList.tsx` | Tickets list with interests drawer |
| `src/components/NotificationsPanel.tsx` | Shared notifications panel |

### Modified files
| File | Changes |
|------|---------|
| `src/context/AuthContext.tsx` | UserType normalisation, previewAs fix |
| `src/components/ProtectedRoute.tsx` | Routes off normalised UserType |
| `src/components/DashboardShell.tsx` | useSearchParams for active nav highlight |
| `app/dashboard/personal/page.tsx` | Sprint 4 + 5 sections, notifications |
| `app/dashboard/business/page.tsx` | All sprint features, tab nav fix |
| `app/buyer/page.tsx` | Interest flow, AI data on cards |
