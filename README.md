# PK Road App

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-ffca28.svg)](https://firebase.google.com/)

A modern, full-stack residential operations and community web application designed for **Panchkuian Road Railway Colony** in New Delhi, India.

The application serves two distinct user experiences from a unified single-page application (SPA):
1. **Public Guest Portal:** A clean, accessible web presence for visitors, guests, and prospective residents containing verified colony information, public notices, and colony coordinates.
2. **Authenticated Role-Based Operations Portal:** A role-based residential management platform for residents, security guards, departmental maintenance authorities, and RWA (Resident Welfare Association) administrators.

---

## 📍 Colony Identity & Verified Location

* **Colony Name:** Panchkuian Road Railway Colony
* **Locality:** Railway Colony, Paharganj
* **City:** New Delhi
* **State:** Delhi
* **PIN Code:** 110055
* **Country:** India
* **Coordinates & Directions:** [Open on Google Maps](https://maps.app.goo.gl/R54A6rW274PAqUE28)

*Configuration single source of truth:* `src/public-colony-config.ts`

---

## 🏛️ Architecture Overview

The PK Road App is built as a single Vite React SPA backed by Express and Firebase Firestore.

```
                    ┌────────────────────────────────────────────────────────┐
                    │                   Browser Client                       │
                    │               (Hash-based Router)                      │
                    └───────────┬────────────────────────────────┬───────────┘
                                │                                │
                    Public Guest Routes                  Authenticated Role Routes
                    (No auth required)                   (Requires Firebase Auth / Role)
                                │                                │
            ┌───────────────────┴──────────┐        ┌────────────┴──────────────────────┐
            │   • #/home                   │        │ • #/resident (My Flat & Issues)   │
            │   • #/chat (Public Inquiry)  │        │ • #/security (Gate Control)       │
            │   • #/announcements          │        │ • #/authority (Work Orders)       │
            │   • #/login & #/register     │        │ • #/admin (RWA Management)        │
            └──────────────────────────────┘        └───────────────────────────────────┘
                                                                 │
                                                    ┌────────────┴─────────────┐
                                                    │ Real-time AppContext     │
                                                    │ Local Optimistic State   │
                                                    └────────────┬─────────────┘
                                                                 │
                                     ┌───────────────────────────┴───────────────────────────┐
                                     │                                                       │
                          ┌──────────┴──────────┐                                 ┌──────────┴──────────┐
                          │ Express API Backend │                                 │  Firebase Firestore │
                          │ (/api/classify-issue│                                 │ (Security-hardened  │
                          │  /api/health)       │                                 │  RBAC Rules)        │
                          └─────────────────────┘                                 └─────────────────────┘
```

### Key Architectural Principles

1. **Strict Data Privacy Boundary:** Public routes never read private Firestore collections. Public notices, facilities, and posts are loaded from verified static configuration (`public-colony-config.ts`) and show clean, honest empty states when unverified.
2. **Optimistic Local-First UI:** User actions (logging visitor approvals, status updates, posting comments, reacting to posts) update the client state instantly, followed by background writes to Firestore.
3. **Query/Rule Compatibility:** Firestore security rules enforce least-privilege role-based access control (RBAC). Client queries in `AppContext` strictly mirror server-side Firestore rule filters to prevent unauthorized reads and avoid query rejection errors.
4. **Immediate Public Route Hydration:** Public routes evaluate prior to Firebase authentication state loading, ensuring guests never encounter authentication spinners or blank screens.
5. **Full-Stack Authentication (Email/Password + Google):** Complete email and password authentication with client validation, password strength rating, password reset, server audit logging, and automated unverified resident profile creation. Includes one-click test credentials for evaluating role workflows.

---

## 👥 Roles & Feature Matrix

| Feature | Guest | Resident | Security Guard | Authority Worker | RWA Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Colony Info & Public Notices** | ✅ Read | ✅ Read | ✅ Read | ✅ Read | ✅ Read |
| **Public Chat / Inquiries** | ✅ Read | ✅ Read | ✅ Read | ✅ Read | ✅ Read |
| **Submit Maintenance Issues** | ❌ | ✅ Create/Track | ❌ | ❌ | ✅ Track All |
| **Resolve Assigned Tickets** | ❌ | ❌ | ❌ | ✅ Update/Resolve | ✅ Supervise |
| **Pre-Approved Visitor Passes** | ❌ | ✅ Create/Share | ✅ Verify & Admit | ❌ | ✅ View |
| **Gate Visitor Registration** | ❌ | ❌ | ✅ Register/Log Exit| ❌ | ✅ Audit |
| **Visitor Entry Approval** | ❌ | ✅ Approve/Deny | ✅ View Status | ❌ | ✅ View |
| **Delivery Tracking** | ❌ | ✅ Flat-scoped | ✅ Gate-scoped | ❌ | ✅ View |
| **Community Board (Posts/React)** | ❌ | ✅ Verified Only | ✅ View | ✅ View | ✅ Moderate |
| **Publish Announcements** | ❌ | ❌ | ❌ | ❌ | ✅ Author/Broadcast |
| **Residency Verification** | ❌ | ✅ Submit Proof | ❌ | ❌ | ✅ Review/Approve |

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS (`@tailwindcss/vite`)
- **Icons:** Lucide React
- **Routing:** Custom client-side hash router with deep link parameter extraction (`src/router/Router.tsx`)
- **Backend / Server:** Node.js Express (`server.ts`) serving production build and API routes
- **Database & Auth:** Firebase Web SDK (v11) with Firestore & Firebase Authentication
- **AI Integration:** Google Gemini API (`@google/genai`) for automatic maintenance ticket classification and department routing (`api/classify-issue.ts`)
- **Execution & Tooling:** TypeScript Execution (`tsx`) for automated test and verification runners

---

## 📂 Project Directory Structure

```
├── api/
│   ├── classify-issue.ts        # AI ticket triage & classification endpoint
│   └── auth-handler.ts          # Auth validation, roles registry, and audit handlers
├── plans/                       # Advisory Phase 2 implementation & verification plans
│   ├── 001-public-routes-auth-loading-branding.md
│   ├── 002-announcement-detail-deep-link.md
│   ├── 003-notifications-routing-and-read-scope.md
│   ├── 004-firestore-rules-safety.md
│   ├── 005-resident-shell-state-and-delivery-events.md
│   └── README.md
├── scripts/
│   └── verify-phase2-plan001.ts # Automated test runner for Phase 2 deep verification
├── src/
│   ├── components/
│   │   ├── AdminApp/            # RWA Admin dashboard & verification queue
│   │   ├── AuthorityApp/        # Maintenance worker departmental queue & resolution
│   │   ├── ResidentApp/         # Resident dashboard, visitors hub, passes, posts
│   │   ├── SecurityApp/         # Guard gate terminal, expedited pass lookup
│   │   ├── Header.tsx           # Authenticated application navigation bar
│   │   ├── LoginPage.tsx        # Firebase Authentication sign-in
│   │   ├── RegisterPage.tsx     # New user registration & residency setup
│   │   ├── PublicHeader.tsx     # Public website navigation bar
│   │   ├── PublicHomePage.tsx   # Public colony welcome page & map links
│   │   ├── PublicChatPage.tsx   # Public inquiry desk
│   │   └── PublicAnnouncementsPage.tsx # Public colony notices
│   ├── context/
│   │   └── AppContext.tsx       # Global state, Firestore listeners, mutation handlers
│   ├── data/
│   │   └── seedData.ts          # Demo personas, flat records, and initial fixtures
│   ├── router/
│   │   └── Router.tsx           # Hash-based route parser and role access guards
│   ├── App.tsx                  # Root shell rendering public or authenticated view
│   ├── firebase.ts              # Firebase initialization and error handling
│   ├── main.tsx                 # React DOM root entrypoint
│   ├── public-colony-config.ts  # Verified colony identity & public content configuration
│   └── types.ts                 # TypeScript interfaces and domain models
├── firestore.rules              # Production Firebase security rules
├── server.ts                    # Express server entrypoint
├── vite.config.ts               # Vite build configuration
├── tsconfig.json                # TypeScript compiler configuration
└── package.json                 # Project dependencies and npm scripts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm 9.x or higher

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-org/pk-road-app.git
cd pk-road-app

# Install dependencies (use legacy-peer-deps if peer conflicts occur)
npm install --legacy-peer-deps
```

### Environment Configuration

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Key environment variables:
- `VITE_DEMO_MODE`: Set to `true` to enable instant persona switching for local development and demos.
- `GEMINI_API_KEY`: API key for Google Gemini issue classification (optional).

### Development Server

Start the development server:

```bash
npm run dev
```

The application runs at `http://localhost:3000`.

### Building for Production

Compile TypeScript and build the production bundle:

```bash
npm run build
```

Run the production server:

```bash
npm start
```

### Type Checking & Linting

```bash
npm run lint
```

*(Runs `tsc --noEmit` to validate all TypeScript code across the repository.)*

### Running the Test Verification Suite

To run the automated deep verification test suite for Phase 2:

```bash
npx tsx scripts/verify-phase2-plan001.ts
```

This verifies:
- Public guest routing (`/home`, `/chat`, `/announcements`, `/login`, `/register`)
- Deep link parameter parsing (`/announcements/:id`, `/resident/announcements/:id`, etc.)
- Public branding cleanliness (ensures no legacy placeholder names exist in public code)
- Firestore rule and query compatibility
- Express backend endpoints
- Demo vs production data isolation

---

## 🔒 Security & Data Privacy

### Firestore Access Control (`firestore.rules`)
- **User Profiles (`/users/{uid}`):** Authenticated users can modify their own contact info (`name`, `phone`, `avatarUrl`), but critical fields (`role`, `verified`, `block`, `flatNumber`) are strictly immutable by clients and can only be set by RWA Administrators.
- **Visitor Logs (`/visitors/{visitorId}`):** Readable by security guards, admins, and strictly by residents whose `flatNumber` and `block` match the visitor record.
- **Pre-Approved Passes (`/preapproved_visitors/{passId}`):** Residents can only query and view passes they created (`residentId == request.auth.uid`). Guards and admins can view all passes for gate entry validation.
- **Notifications (`/notifications/{notificationId}`):** Scoped to specific `userId` or validated `'ALL'` broadcasts for colony residents and staff. Cross-tenant notification leakage is blocked at the rule level.
- **Community Posts (`/posts/{postId}`):** Creation restricted to verified residents. Reaction and comment updates are constrained to field-specific increment diffs.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
