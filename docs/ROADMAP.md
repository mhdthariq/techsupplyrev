# Project Roadmap

This document outlines the strategic plan for the "techsupplyrev" project, focusing on technical debt reduction, feature expansion, and scalability.

## Phase 1: Immediate Improvements (Q4 2024)

_Focus: Code Quality, Stability, and Developer Experience_

### Technical Infrastructure

- [x] **Testing Suite**:
  - Implement **Jest** for unit testing utility functions and hooks.
  - Set up **Playwright** for end-to-end (E2E) testing of critical flows (Checkout, Auth).
- [x] **Code Quality Tools**:
  - Configure **Prettier** for consistent code formatting.
  - Set up **Husky** and **lint-staged** to enforce linting and formatting on commit.
  - Strict TypeScript configuration to reduce `any` usage.

### Refactoring

- [x] **Admin Page Refactor**:
  - Break down the monolithic `app/admin/page.tsx` into smaller, reusable components (e.g., `ProductTable`, `OrderSummary`, `AdminSidebar`).
  - Move admin-specific logic to custom hooks (e.g., `useAdminStats`, `useProductManagement`).

## Phase 2: Feature Expansion (Q1 2025)

_Focus: User Experience and Admin Capabilities_

### Admin Dashboard

_Goal: Create a comprehensive control center for store management._

- [ ] **Dashboard Overview**:
  - Real-time analytics (Sales, Visitor count, Conversion rate).
  - Recent activity feed.
- [ ] **Order Management**:
  - View all orders with status filtering.
  - Update order status (Processing, Shipped, Delivered).
  - Print packing slips/invoices.
- [ ] **User Management**:
  - View customer list and purchase history.
  - Manage user roles (Admin/Customer).
- [ ] **Inventory Management**:
  - Low stock alerts.
  - Bulk price updates.
  - _Note: Product Category and Banner management are excluded as per current requirements._

### User Experience (Storefront)

- [ ] **Customer Features**:
  - **Wishlist**: Allow users to save products for later.
  - **Order History**: Dedicated page for users to track past orders.
  - **Profile Management**: Update address and payment methods.
- [ ] **Search & Discovery**:
  - Implement advanced filtering (Price range, Brand, Rating).
  - Add instant search suggestions.

### Performance & SEO

- [ ] **SEO Optimization**:
  - Implement `next-sitemap` for dynamic sitemap generation.
  - Add structured data (JSON-LD) for products.
- [ ] **PWA Support**:
  - Make the application installable on mobile devices.
  - Offline support for browsing previously visited pages.

## Phase 3: Scalability & DevOps (Q2 2025)

_Focus: Automation, Monitoring, and Scale_

### DevOps

- [ ] **CI/CD Pipelines**:
  - GitHub Actions for automated testing and linting on PRs.
  - Automated deployment to Vercel on merge to main.
- [ ] **Monitoring**:
  - Integrate **Sentry** for error tracking and performance monitoring.
  - Set up custom alerts for critical failures (e.g., Payment failure).

### Architecture

- [ ] **State Management**:
  - Evaluate **TanStack Query (React Query)** for server state management to replace `useEffect` data fetching.
  - Consider **Zustand** for complex client-side state if needed.
- [ ] **Database Optimization**:
  - Review Supabase query performance and add necessary indexes.
  - Implement database backups.
