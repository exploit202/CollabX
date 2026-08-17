# PHASE 2D — UNIFIED FRONTEND FORENSIC AUDIT REPORT

---

## 1. Overview of Existing Frontend Modules

The workspace contains three isolated frontend implementations:
1. `Working/authentication/frontend/`
2. `Working/brand-owner/frontend/`
3. `Working/content-creator/frontend/`

All three frontends share a nearly identical React + TypeScript + Vite + Tailwind CSS framework stack with Lucide icons and common modal/dashboard components.

---

## 2. Forensic Findings & Architectural Mismatches

| Component / Feature | Current State in Isolated Frontends | Target State for Unified Frontend |
|---|---|---|
| **Root Entry Point** | Three separate `App.tsx` & `main.tsx` instances | Single canonical `Working/frontend` app shell |
| **Authentication State** | Mock-based `AuthContext.tsx` using `mockBrands` & `mockCreators` | Unified `AuthContext` connected to `/api/brand/auth/*` & `/api/creator/auth/*` with token persistence |
| **API Client** | Separate API callers / raw fetch in `src/lib/api.ts` | Centralized Axios/Fetch client handling `Authorization: Bearer <token>` and `credentials: 'include'` |
| **Token Storage** | Non-persistent local React state or scattered localStorage keys | Single standardized `localStorage` token key (`collabx_token`) + HTTP-only cookie support |
| **Brand Routes & Data** | Using local `mockData.ts` objects | Mounted under `/brand/*` fetching real MongoDB data via `/api/brand/*` |
| **Creator Routes & Data** | Using local `mockData.ts` objects | Mounted under `/creator/*` fetching real MongoDB data via `/api/creator/*` |
| **Role Protection** | Client-side state switchers | `ProtectedRoute` enforcing `role === 'brand'`, `role === 'creator'`, or redirecting unauthenticated users to `/login` |

---

## 3. Canonical Frontend Migration Strategy

1. **Establish `Working/frontend`**: Use `Working/authentication/frontend` as the unified frontend root foundation.
2. **Unify `api.ts` Client**: Create a robust API client pointing to `http://localhost:5000/api` supporting both Bearer headers and credentials.
3. **Unify `AuthContext.tsx`**: Support real login, signup, logout, and automatic session restoration via profile endpoints (`/api/brand/profile` & `/api/creator/profile`).
4. **Connect All Pages to Live APIs**:
   - Brand Pages: `BrandDashboard`, `BrandCampaigns`, `BrandInvitations`, `BrandNegotiations`, `BrandActiveCollaborations`, `DiscoverCreators`, `SavedCreators`, `BrandNotifications`, `BrandSettings`.
   - Creator Pages: `CreatorDashboard`, `CampaignDiscoveryPage`, `CreatorInvitations`, `CreatorNegotiations`, `CreatorActiveCollaborations`, `CreatorNotifications`, `CreatorPortfolioPage`, `CreatorPricingPage`, `CreatorProfilePage`, `CreatorReviewsPage`.
5. **Unified Router**: Update `App.tsx` to handle public routes (`/login`, `/signup`, `/brand/signup`, `/creator/signup`), role-protected Brand routes (`/brand/*`), and role-protected Creator routes (`/creator/*`).
