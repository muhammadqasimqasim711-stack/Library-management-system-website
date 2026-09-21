# 🏛️ University Library Management System (ULMS)
### Enterprise Multi-Role Resource & Circulation Platform

A production-grade, centralized University Library Management System designed for large-scale academic institutions managing hundreds of thousands of physical copies across specialized departments, faculties, and library stacks.

---

## 🌟 Key Architecture & Highlights

### 1. Fundamental Domain Decoupling: Book Title ≠ Physical Book Copy
A core architectural requirement of enterprise library management:
- **`Book` (Catalog Entity)**: Bibliographic catalog metadata (Title, Subtitle, ISBN, Authors, Publisher, Classification Number, Subject, Department, Section, Abstract).
- **`BookCopy` (Physical Asset)**: Unique inventory asset possessing an independent Barcode (Code128 format), Copy Number, Physical Condition (`NEW`, `GOOD`, `FAIR`, `POOR`, `DAMAGED`), Multi-Tier Coordinates (`Building` → `Floor` → `Section` → `Shelf` → `Rack`), and Lifecycle Status (`AVAILABLE`, `BORROWED`, `RESERVED`, `ON_HOLD`, `OVERDUE`, `UNDER_REPAIR`, `DAMAGED`, `LOST`, `MISSING`, `WITHDRAWN`).

### 2. High-Speed Barcode Circulation Desk (`/admin/circulation`)
- Built for continuous hardware barcode scanning and keyboard-only operation.
- **Shortcut Keys**: `F2` for Check-Out (Issue), `F3` for Check-In (Return).
- **Atomic Transactions (`prisma.$transaction`)**: Prevents race conditions, double checkouts, or orphaned loan records.
- **Automated Calculations**:
  - Automatically calculates due dates based on the borrower's configured lending policy tier.
  - Automatically computes overdue duration and fine charges based on grace periods and daily fine rates.
  - Automatically progresses the reservation queue on return—transitioning the copy to `ON_HOLD` for the next member in line.

### 3. Configurable Lending Policies (`/admin/policies`)
Rules are **never hardcoded**:
- Configurable per member tier (`STUDENT`, `FACULTY`, `RESEARCHER`, `STAFF`):
  - Maximum Active Loans
  - Loan Duration (Days)
  - Maximum Renewals
  - Reservation / Hold Queue Limit
  - Daily Overdue Fine Rate ($/day)
  - Grace Period (Days)
  - Lost-Book Multiplier (e.g. 1.5x of acquisition cost)

### 4. Live Shelf Inventory Audit Station (`/admin/inventory/audit`)
- Allows inventory staff to audit physical stacks in real-time.
- Compares expected holdings registered to a shelf against physical barcode scans.
- Categorizes discrepancies live into:
  - **MATCHED**: Correct copy on the designated shelf.
  - **MISPLACED**: Belongs to another shelf/section in the library.
  - **MISSING**: Registered to this shelf but absent during the audit.
  - **UNEXPECTED**: Unknown or withdrawn barcode.

### 5. Director Executive Suite (`/admin/*`)
- **Executive Dashboard**: High-level KPIs, 7-day circulation velocity chart, collection distribution by discipline, overdue alerts, and recent audit logs.
- **Fines, Penalties & Waivers**: Cashier balance settlements and formal Director Waivers with mandatory institutional audit justification.
- **Acquisitions & Budget**: Purchase requests, vendor registry, and institutional budget category tracking (`Allocated`, `Committed`, `Spent`, `Remaining`).
- **Security & RBAC Matrix**: 27 granular permission codes mapped across 10 institutional roles.
- **Immutable Activity Logs**: Tamper-evident log with actor identity, action type, entity, timestamp, IP, and state transition diff inspector.

### 6. Student & Faculty OPAC Portal (`/portal/*`)
- **Search Catalog**: Faceted discovery across academic departments, disciplines, and live availability.
- **Shelf Navigator**: Real-time physical location coordinates (Building, Floor, Section, Shelf Code, Rack).
- **My Loans**: Active loans, remaining days, and 1-click renewal.
- **My Reservations**: Queue priority status and ready-for-pickup hold alerts.
- **My Fines**: Financial breakdown and online settlement simulator.
- **Facilities**: Collaborative study rooms and research carrel scheduler.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with SQLite (WAL mode, Foreign Keys, ACID transactions; PostgreSQL-ready)
- **Barcode Engine**: [JsBarcode](https://lindell.me/JsBarcode/) (Code128 high-density barcode rendering and printable sticker sheets)
- **Testing**: Automated integration test suite (`test-system.js`)

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Push Schema
```bash
npx prisma db push
```

### 3. Seed Realistic University Data
```bash
node prisma/seed.js
```

### 4. Run Automated Integration Tests
```bash
node test-system.js
```

### 5. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 👥 Institutional Roles & Demo Personas

Use the persistent **University RBAC Engine** bar at the very top of the application to switch between personas with 1 click:

| Role | Persona Name | Member ID | Core Responsibilities |
|---|---|---|---|
| **Library Director** | Dr. Eleanor Vance | `DIR-001` | Executive KPIs, budget oversight, policy configuration, fine waivers |
| **Circulation Staff** | Sarah Jenkins | `CIRC-001` | High-speed barcode scanning, rapid checkout, return, damage assessment |
| **Librarian & Cataloger** | Marcus Chen, MLIS | `LIB-001` | Master book titles cataloging, physical copy & barcode generation |
| **Inventory Auditor** | David Miller | `INV-001` | Physical shelf auditing, misplaced and missing book reconciliation |
| **Active Student** | Muhammad Ali | `STU-2026-001` | Undergraduate borrowing (14 days, 5 max), OPAC search, hold queues |
| **Restricted Student** | James Chen | `STU-2026-003` | Overdue loans & unpaid fines trigger automated checkout restriction |
| **Faculty Member** | Prof. Alan Turing | `FAC-2026-001` | Extended borrowing quota (45 days, 15 max), course reserves |
| **Super Administrator** | Dr. Alexander Wright | `ADMIN-001` | System configuration, RBAC permissions matrix, audit monitoring |

---

## 🏷️ Test Barcodes for Rapid Circulation

| Type | Barcode / Identifier | Description |
|---|---|---|
| **Member ID** | `STU-2026-001` | Active student eligible for borrowing |
| **Member ID** | `FAC-2026-001` | Academic faculty member |
| **Member ID** | `STU-2026-003` | Restricted student (Overdue loan & pending fines) |
| **Physical Copy** | `LIB-CS-00001` | *Database System Concepts* (Available on Shelf CS-02) |
| **Physical Copy** | `LIB-CS-00002` | *Database System Concepts* (Available on Shelf CS-02) |
| **Physical Copy** | `LIB-CS-00010` | *Clean Code* (Available on Shelf CS-01) |
| **Physical Copy** | `LIB-CS-00020` | *Artificial Intelligence: A Modern Approach* (Available on Shelf CS-03) |
| **Physical Copy** | `LIB-CS-00030` | *Modern Operating Systems* (Available on Shelf CS-04) |
| **Physical Copy** | `LIB-CS-00040` | *Introduction to Algorithms* (Available on Shelf CS-01) |
| **Borrowed Copy** | `LIB-CS-00003` | Currently borrowed by Muhammad Ali |
| **Overdue Copy** | `LIB-CS-00011` | Overdue by 6 days (James Chen) |

---

## 🔒 Security & Concurrency Design

- **Atomic Transactions**: All circulation operations (`issue`, `return`, `renew`, `reserve`) run within ACID database transactions to prevent race conditions (e.g. double-checkout of the same physical copy).
- **Server-Side RBAC**: Every API route validates user permissions against the permission matrix before executing data mutations.
- **Tamper-Evident Auditing**: Critical operations (`FINE_WAIVE`, `POLICY_UPDATE`, `COPY_STATUS_CHANGE`, `LOAN_ISSUE`) log an immutable record containing actor credentials, action, entity, before/after JSON diffs, IP address, and timestamp.
- **Soft-Archiving**: Critical catalog records and copies are soft-archived rather than deleted to ensure complete historical circulation integrity.

---

## 📜 License
University Institutional License — Academic Software Architecture.
