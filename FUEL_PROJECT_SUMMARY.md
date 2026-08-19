# Fuel Management Dashboard - Project Summary & API Configuration

This document contains a complete summary of the API details, configuration setup, and page overhauls implemented in the dashboard. You can copy this file or present it to any AI agent in the future to immediately context-load the project state.

---

## 1. API Configurations & Credentials
- **Base URL:** `https://api.fmafrica.com:4801/`
- **Login Credentials:**
  - **Endpoint:** `POST /api/Users/login`
  - **Request Body:** `{"email": "godfrey@mastersystems.com.pg", "password": "cIk_X!VCJ9J.eIyp"}`
  - **Response:** Returns `token` (Bearer token).
- **Core Endpoints:**
  - **Tank Levels:** `POST /api/fmatanklevels/GetLevels`
    - **Payload:** `{"clientid": number, "userid": number, "divisionid": number, "datefrom": "YYYY-MM-DD", "dateto": "YYYY-MM-DD", "tankno": number}`
  - **Deliveries:** `POST /api/fmaweldandeliveries/GetDeliveries`
    - **Payload:** `{"clientid": number, "userid": number, "divisionid": number, "datefrom": "YYYY-MM-DD", "dateto": "YYYY-MM-DD", "tankno": number}`
  - **Transactions:** `POST /api/fmacontrollertrans/GetTransactions`
    - **Payload:** `{"clientid": "string", "userid": number, "divisionid": number, "datefrom": "YYYY-MM-DD", "dateto": "YYYY-MM-DD"}`
    - *Note:* In `GetTransactions`, the `clientid` must be passed as a string, while `userid` and `divisionid` must be numbers.

- **Configured Identifiers (Clients 1, 2, 4, 5, 6):**
  - All default to: `ClientID: 2591`, `UserID: 2094`, `DivisionID: 845`. Managed via a client switcher.

---

## 2. Implemented Features & Routing
- **Clean API Integration:** All mock databases under `src/data/` were completely removed. Services connect directly to the live FMA port 4801 API endpoints.
- **Client Switcher:** Added to [`Header.tsx`](./src/components/layout/Header.tsx). Retains settings using a Zustand store inside [`api.ts`](./src/services/api.ts) and automatically reloads active page states on change.
- **Sidebar & Route Access:**
  - Removed **Dashboard** and **Reports** pages. Redirected `/dashboard` and `/reports` to `/fuel-levels` inside page components.
  - Added new routes in [`auth.ts`](./src/lib/auth.ts) to prevent middleware intercepts: `/fuel-efficiency-summary` and `/fuel-limits`.
- **Page Overhauls:**
  - **Fuel Levels Page:** Removed the "Current Tank Status" panel. Renders levels history directly from the `GetLevels` endpoint.
  - **Deliveries Page:** Removed `Supplier`, `Status`, and `Actions` columns from the listing table.
  - **Transactions Page:** Matches columns exactly to the layout (Date/Time, ID, Vehicle Req, Fleet Id, Vehicle Detail, Site, Litres, Pump, Odo Meter, Hour Meter, DEM).
  - **Fuel Efficiency Page:** Aggregates vehicles live from the Transactions API (`GetTransactions`), computing odometer, distance, and consumption.
  - **Fuel Efficiency Summary Page:** Aggregates transactions by vehicle to calculate live mileage (`Km/L` and `L/100Km`).
  - **Fuel Limits Page:** Features a popup modal to manually add vehicles. Monthly consumed fuel is calculated dynamically from live Transactions data.
  - **Reconciliation Page:** Dynamic calculations based on the 4 PM to 4 PM time boundaries from live levels, deliveries, and transactions.

---

## 3. Files Created / Modified
- [`src/services/api.ts`](./src/services/api.ts) - **[NEW]** Base HTTP fetch client, authentication token caching, and Client Selection Zustand store.
- [`src/services/fuelLevelService.ts`](./src/services/fuelLevelService.ts) - Connects to `/api/fmatanklevels/GetLevels`.
- [`src/services/deliveryService.ts`](./src/services/deliveryService.ts) - Connects to `/api/fmaweldandeliveries/GetDeliveries`.
- [`src/services/fuelIssueService.ts`](./src/services/fuelIssueService.ts) - Connects to `/api/fmacontrollertrans/GetTransactions`.
- [`src/services/vehicleService.ts`](./src/services/vehicleService.ts) - Aggregates vehicles live from the Transactions API.
- [`src/services/reconciliationService.ts`](./src/services/reconciliationService.ts) - Aggregates daily variance logs using 4 PM - 4 PM window.
- [`src/components/layout/Header.tsx`](./src/components/layout/Header.tsx) - Client switcher select element.
- [`src/components/layout/Sidebar.tsx`](./src/components/layout/Sidebar.tsx) - Cleaned up sidebar tabs and brand redirection.
- [`src/lib/auth.ts`](./src/lib/auth.ts) - Added permission routes.
- [`src/app/(dashboard)/fuel-efficiency-summary/page.tsx`](./src/app/\(dashboard\)/fuel-efficiency-summary/page.tsx) - **[NEW]** Fuel Efficiency Summary grouping logic.
- [`src/app/(dashboard)/fuel-limits/page.tsx`](./src/app/\(dashboard\)/fuel-limits/page.tsx) - **[NEW]** Manual limits CRUD and LocalStorage store.
- `src/data/` - **[DELETED]** Mock files folder.
