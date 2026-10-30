# CreativeDesk – Your Creative Business, Organized.

A commercial SaaS web application designed for freelance graphic designers, photographers, video editors, and creative agencies. CreativeDesk unifies client briefs, Kanban project pipelines, versioned artwork review, and financial management in Kenyan Shillings (KES).

---

## 🎨 Visual Identity & Brand System

- **Product Name**: CreativeDesk
- **Tagline**: *Your Creative Business, Organized.*
- **Typography**: Inter (Google Fonts)
- **Palette**:
  - Primary Blue: `#2563EB`
  - Dark Navy: `#0F172A`
  - Secondary Slate: `#64748B`
  - Success Green: `#16A34A`
  - Warning Orange: `#F59E0B`
  - Light Background: `#F8FAFC`
  - Surface White: `#FFFFFF`

---

## 🚀 Live Demo Credentials

| Role | Email | Password | Quick Action |
|---|---|---|---|
| **Designer / Studio** | `designer@creativedesk.io` | `designer123` | Click *"Sign In as Designer"* on login screen |
| **Client / Brand** | `client@savannahcoffee.co.ke` | `client123` | Click *"Sign In as Client"* on login screen |

---

## 🛠️ Technology Architecture

### Frontend (`/client`)
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 with custom tokens
- **Routing**: React Router v7 (`BrowserRouter`, protected role routes)
- **Icons**: Lucide React
- **Analytics**: Recharts (Monthly Revenue AreaChart, Status Donut Chart)

### Backend (`/server`)
- **Runtime**: Node.js v24 + Express.js
- **Persistence**: Dual-mode engine supporting MongoDB and persistent disk JSON storage (`server/data/*.json`)
- **Security**: JWT (`jsonwebtoken`), password hashing with `bcryptjs`
- **File Ingestion**: Multer for proof asset uploads
- **Currency**: Native Kenyan Shillings (`KES`) calculation with M-Pesa STK push simulation

---

## 📦 Key Functional Modules

1. **Public Landing Page** (`/`):
   - Hero: *"Run Your Creative Business Like a Pro."*
   - Interactive live product preview tabs (Kanban Workflow, Artwork Proofing, KES Financials)
   - 6 Core features grid
   - 4-Step workflow breakdown
   - Freelancer vs. Agency comparison
   - Client testimonials with authentic avatars
   - Transparent pricing plans with Monthly/Annual 20% discount toggle (in KES)
   - Interactive FAQ accordion & footer

2. **Authentication** (`/login`, `/register`, `/forgot-password`, `/reset-password`):
   - Tabbed designer and client authentication
   - Instant 1-click test credential login buttons
   - Password reset workflow with token simulator

3. **Designer Command Center** (`/dashboard`):
   - 6 KPI metrics (Total Clients, Active Projects, Pending Briefs, Completed, Revenue KES, Outstanding KES)
   - Interactive monthly revenue chart & pipeline status breakdown
   - Real-time studio activities feed & urgent deadline alerts
   - 1-click brief acceptance directly into active projects

4. **Client Management Hub** (`/clients`):
   - Search & filter by sector tags (Retail, Logistics, Hospitality, VIP, Tech)
   - Register, edit, and delete client accounts
   - Client profile drawer showing lifetime project history & invoice ledger

5. **Design Requests Inbox** (`/requests`):
   - 10 Design categories (Logos, Branding, Social Media, Posters, Brochures, Motion Graphics, etc.)
   - Detailed brief inspector with reference moodboards, color palette hex swatches, dimensions, and budget
   - Auto-generated IDs (`REQ-2026-XXX`)
   - 1-click *"Accept & Convert to Project"* creating project & milestone deposit invoice

6. **Project Management & Kanban** (`/projects`):
   - 5 Production columns: `Pending`, `In Progress`, `Under Review`, `Revision Required`, `Completed`
   - Real-time progress percentage sliders
   - View mode toggle: Interactive Kanban Board vs. Data Table
   - Create project modal with client selector and target delivery dates

7. **Artwork Proofing & Version Control** (`/artwork`):
   - Strict version history preservation (`v1.0`, `v2.0`, `v3.0` – previous versions are never deleted)
   - High-resolution artwork stage with zoom and download capabilities
   - Client revision instruction tracker with pinned coordinates and feedback notes

8. **Financial Management (KES)** (`/financials`):
   - Automated quotation & invoice generation (`INV-2026-XXX`)
   - Automatic milestone accounting (e.g., 50% upfront deposit, remaining balance on sign-off)
   - Payment ledger supporting M-Pesa STK simulations and bank wire receipts

9. **Client Collaboration Portal** (`/portal`):
   - Separate client interface
   - Guided request submission wizard with color pickers and budget inputs
   - Artwork proof viewer with 1-click *"Approve Final Artwork"* or *"Request Revisions"*
   - Invoices & M-Pesa STK checkout simulator

---

## 🏃‍♂️ Quick Start Guide

### 1. Start the Backend API Server
```bash
cd server
npm install
npm start
# Server runs on http://localhost:5000
```

### 2. Start the Frontend Application
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```
