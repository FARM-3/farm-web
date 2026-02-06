# RUGYEYO FARM MANAGEMENT SYSTEM

## Technical Manual
### Complete Technical Implementation Guide

---

**Version:** 1.0
**Date:** 28th January 2026
**Organisation:** Rugyeyo Farm
**Document Type:** Internal Technical Documentation

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 Purpose of the Technical Manual
   - 1.2 Scope of the System
   - 1.3 Intended Audience
   - 1.4 Definitions, Acronyms, and Abbreviations
   - 1.5 About Rugyeyo Farm
   - 1.6 Document Structure Overview

2. [System Overview](#2-system-overview)
   - 2.1 System Description
   - 2.2 Business Objectives
   - 2.3 Key Functional Requirements
   - 2.4 Non-Functional Requirements
   - 2.5 Supported User Roles
   - 2.6 High-Level System Capabilities

3. [User Journeys & Workflows](#3-user-journeys--workflows)
   - 3.1 Authentication User Journey
   - 3.2 Dashboard User Journey
   - 3.3 Wages Management Workflow
   - 3.4 Sales Management Workflow
   - 3.5 Coffee Processing Workflow
   - 3.6 Task Management Workflow

4. [System Architecture & Design](#4-system-architecture--design)
   - 4.1 Architectural Overview
   - 4.2 High-Level System Architecture
   - 4.3 Frontend Architecture (React + Vite)
   - 4.4 Backend Architecture (Django REST Framework)
   - 4.5 Component Structure

5. [Technology Stack](#5-technology-stack)
   - 5.1 Frontend Technologies
   - 5.2 Backend Technologies
   - 5.3 Third-Party Services & APIs
   - 5.4 Hosting and Deployment Overview

6. [Core Functional Modules](#6-core-functional-modules)
   - 6.1 Dashboard Module
   - 6.2 Staff Management Module
   - 6.3 Wages Management Module
   - 6.4 Sales Management Module
   - 6.5 Expenses Management Module
   - 6.6 Aggregation Module
   - 6.7 Harvest Module
   - 6.8 Processing Module
   - 6.9 Task Management Module

7. [Security & Compliance](#7-security--compliance)
   - 7.1 Authentication & Authorization
   - 7.2 Data Protection
   - 7.3 Session Management

8. [API Reference](#8-api-reference)
   - 8.1 API Configuration
   - 8.2 Authentication Endpoints
   - 8.3 Core Data Endpoints
   - 8.4 Processing Endpoints

9. [Deployment & Maintenance](#9-deployment--maintenance)
   - 9.1 Environment Configuration
   - 9.2 Build & Deployment
   - 9.3 Maintenance Guidelines

10. [Appendices](#10-appendices)
    - 10.1 File Structure
    - 10.2 Color Theme Reference
    - 10.3 Troubleshooting Guide

---

## 1. Introduction

### 1.1 Purpose of the Technical Manual

The purpose of this technical manual is to provide detailed documentation of the Rugyeyo Farm Management System, including its architecture, functionality, user workflows, and operational procedures. This manual serves as a reference for understanding how the system is designed, implemented, operated, and maintained.

It is intended to support system administrators, developers, and authorized stakeholders in effectively deploying, managing, and troubleshooting the Rugyeyo Farm Management platform.

### 1.2 Scope of the System

This manual covers the technical and functional aspects of the Rugyeyo Farm Management System, including:

- System overview and architecture
- User journeys for farm administrators and staff
- Core features and workflows for coffee farm operations
- API and system integrations
- Data management and security mechanisms
- Coffee processing pipeline management
- Financial tracking (wages, sales, expenses)
- System maintenance and deployment procedures

The manual does not cover third-party systems in detail beyond their integration points with the platform.

### 1.3 Intended Audience

This document is intended for the following audiences:

- **System Administrators** responsible for managing and maintaining the platform
- **Developers** involved in system development, integration, or enhancement
- **Technical Support Personnel** providing system support and troubleshooting
- **Farm Management** requiring an understanding of the system's technical design
- **Project Stakeholders** requiring technical oversight

Basic knowledge of web-based systems, React.js, and REST APIs is assumed.

### 1.4 Definitions, Acronyms, and Abbreviations

| Term/Acronym | Description |
|--------------|-------------|
| Rugyeyo | A coffee farm management system for tracking operations, finances, and processing |
| Staff | Farm employees who perform various agricultural tasks |
| Farmer | External coffee suppliers who deliver harvested coffee to the farm |
| Harvest | Coffee beans collected from farmers or farm workers |
| Processing | The stages of converting raw coffee cherries to exportable coffee |
| Aggregation | Collection and tracking of coffee from external farmers |
| API | Application Programming Interface |
| UI | User Interface |
| JWT | JSON Web Token |
| PIN | Personal Identification Number (4-digit) |
| REST | Representational State Transfer |
| CRUD | Create, Read, Update, Delete |
| SPA | Single Page Application |
| KPI | Key Performance Indicator |
| UGX | Ugandan Shillings (currency) |
| QR Code | Quick Response Code |
| PDF | Portable Document Format |
| SOP | Standard Operating Procedure |

### 1.5 About Rugyeyo Farm

Rugyeyo Farm is a coffee production and processing facility focused on high-quality coffee cultivation, processing, and export. The farm operates across multiple blocks and manages relationships with external farmers who supply additional coffee harvests.

The Rugyeyo Farm Management System was developed to:
- Digitize and streamline farm operations
- Track financial transactions (wages, sales, expenses)
- Monitor coffee processing from harvest to bagging
- Manage staff and task assignments
- Aggregate coffee from external farmer suppliers
- Generate verifiable payment vouchers and sales receipts

### 1.6 Document Structure Overview

This document is organized into logical sections:

- **Section 1-2:** Introduction and system overview
- **Section 3:** User journeys and workflows
- **Section 4-5:** Technical architecture and technology stack
- **Section 6:** Detailed module documentation
- **Section 7:** Security and compliance
- **Section 8:** API reference
- **Section 9:** Deployment and maintenance
- **Section 10:** Appendices and reference materials

---

## 2. System Overview

### 2.1 System Description

The Rugyeyo Farm Management System is a web-based platform designed to manage comprehensive coffee farm operations. The system provides tools for:

- **Financial Management:** Tracking wages, sales, and expenses
- **Staff Administration:** Employee registration and management
- **Coffee Aggregation:** Recording harvests from external farmers
- **Processing Pipeline:** Managing coffee through quality control, fermentation, drying, hulling, and bagging
- **Task Management:** Assigning and tracking daily farm operations
- **Document Generation:** Creating verifiable vouchers and receipts with QR codes

The platform is accessible via standard web browsers and is designed for use by farm administrators, supervisors, and authorized staff members.

### 2.2 Business Objectives

The Rugyeyo Farm Management System supports the following business objectives:

**Streamline Farm Operations**
- Centralize all farm management activities in a single digital platform
- Reduce manual record-keeping and paper-based processes

**Financial Transparency**
- Track all financial transactions with detailed records
- Generate verifiable payment vouchers and sales receipts
- Provide real-time financial dashboards and reporting

**Coffee Traceability**
- Track coffee from harvest through processing stages
- Maintain records of farmer suppliers and harvest quantities
- Monitor processing batches through quality control

**Operational Efficiency**
- Manage staff assignments and task scheduling
- Monitor task completion and exceptions
- Support data-driven decision making through analytics

**Accountability**
- Generate QR-code verifiable documents
- Maintain audit trails for all transactions
- Enable verification of payments and receipts

### 2.3 Key Functional Requirements

#### 1. User Management
- Secure login using phone number and 4-digit PIN
- Security questions for PIN recovery
- Session management with "Remember Me" functionality
- Role-based access to system features

#### 2. Staff Management
- Staff registration with personal and contact details
- Staff categorization by role and department
- Bulk staff registration via spreadsheet import
- Staff profile management and search

#### 3. Wages Management
- Record individual and bulk wage payments
- Calculate wages based on days worked and daily rates
- Generate PDF wage vouchers with QR verification
- Track payment history and export to Excel

#### 4. Sales Management
- Record coffee sales transactions
- Generate sales receipts with QR verification
- Track customer information and payment status
- Export sales data to Excel

#### 5. Expenses Management
- Record farm operational expenses
- Categorize expenses by type
- Track expense history and trends
- Generate expense reports

#### 6. Aggregation & Harvest
- Register external farmer suppliers
- Record farmer harvest deliveries
- Track weights, prices, and payments to farmers
- Monitor aggregation statistics

#### 7. Coffee Processing
- **Quality Control:** Ripeness scoring and floating tests
- **Processing Types:** Fermentation, natural sundrying, washing
- **Drying:** Monitor drying progress and completion
- **Hulling:** Track hulling operations
- **Bagging:** Record final bagging and weights

#### 8. Task Management
- Create and assign tasks to staff members
- Schedule tasks with dates and priorities
- Track task completion and submissions
- Handle exceptions and weather conditions

#### 9. Dashboard & Analytics
- Real-time KPI cards (sales, expenses, wages, staff count)
- Sales vs. expenses comparison charts
- Recent transactions and activities feed
- Financial distribution visualization

### 2.4 Non-Functional Requirements

#### 1. Performance Requirements
- Support multiple concurrent users
- Page load times under 3 seconds
- Efficient data fetching with pagination support
- Auto-refresh dashboards every 5 minutes

#### 2. Security Requirements
- PIN-based authentication with JWT tokens
- Protected routes requiring authentication
- Security questions for account recovery
- Secure session management

#### 3. Reliability Requirements
- Graceful error handling and user feedback
- Fallback to cached data when API unavailable
- Auto-save functionality in forms

#### 4. Usability Requirements
- Mobile-responsive design
- Consistent coffee-themed UI across all pages
- Intuitive navigation with sidebar menu
- Clear visual feedback for actions

#### 5. Portability & Compatibility
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile-responsive for tablets and smartphones
- Environment-based configuration (development/production)

### 2.5 Supported User Roles

#### 1. Farm Administrator
**Description:** Primary system users responsible for overall farm management.

**Responsibilities:**
- Manage staff records and registrations
- Record and approve wage payments
- Track sales and expenses
- Monitor processing pipeline
- Assign tasks and manage operations

**Access:**
- Full access to all system modules
- Dashboard with complete financial overview
- Export capabilities for all data

#### 2. Farm Staff
**Description:** Workers who perform daily farm operations and receive task assignments.

**Responsibilities:**
- View assigned tasks
- Submit task completion reports
- Report exceptions and issues

**Access:**
- Task management module (via mobile app integration)
- Limited profile management

### 2.6 High-Level System Capabilities

The system provides the following high-level capabilities:

#### Financial Management
- Complete tracking of wages, sales, and expenses
- Real-time financial dashboards with KPIs
- Comparison charts and distribution analytics
- Export to Excel for external reporting

#### Document Generation
- PDF wage vouchers with employee details
- Sales receipts with transaction information
- QR codes for document verification
- Professional formatting with company branding

#### Coffee Supply Chain Tracking
- Farmer registration and harvest recording
- Processing stage tracking (quality control → bagging)
- Batch management through processing pipeline
- Weight and quality metrics at each stage

#### Operational Management
- Task creation and assignment
- Staff scheduling and tracking
- Exception reporting with evidence upload
- Weather condition logging

---

## 3. User Journeys & Workflows

### 3.1 Authentication User Journey

The authentication flow ensures secure access to the system:

**Step 1: Welcome Screen**
- User accesses the platform URL
- Landing page displays Rugyeyo Farm branding
- "Get Started" button initiates login flow

**Step 2: Login**
- User enters 10-digit phone number
- User enters 4-digit PIN
- Optional "Remember Me" for persistent login
- System validates credentials against backend API

**Step 3: Security Questions (First-time Setup)**
- If user hasn't set up security questions
- System redirects to security questions setup
- User selects and answers 3 security questions
- Answers stored for future PIN recovery

**Step 4: Dashboard Access**
- Upon successful authentication
- JWT token stored in localStorage/sessionStorage
- User redirected to main dashboard

**PIN Reset Flow:**
1. User clicks "Reset PIN" on login page
2. Enters phone number for verification
3. Answers 3 security questions
4. Sets new 4-digit PIN
5. Returns to login with new PIN

### 3.2 Dashboard User Journey

**Access Dashboard:**
- User navigates to `/dashboard` after login
- System fetches data from multiple API endpoints in parallel

**View Financial KPIs:**
- Total Sales (UGX)
- Total Expenses (UGX)
- Active Staff count
- Total Wages paid

**Analyze Charts:**
- Sales vs. Expenses bar chart (last 6 months)
- Financial distribution pie chart
- Hover interactions for detailed values

**Review Recent Activity:**
- Recent transactions list (sales and expenses)
- Activity feed showing system actions
- Manual refresh capability

### 3.3 Wages Management Workflow

**Step 1: Access Wages Module**
- Navigate to Wages from sidebar
- View existing wage records in table format

**Step 2: Record New Wage**
- Click "Record Wages" button
- Select staff member from dropdown
- Enter days missed, daily rate, deductions
- System calculates total amount
- Submit wage record

**Step 3: Bulk Wage Recording**
- Click "Bulk Record" option
- Spreadsheet interface for multiple entries
- Import from Excel or manual entry
- Batch submission of records

**Step 4: Generate Voucher**
- Click eye icon on wage record
- View detailed wage voucher
- Voucher includes:
  - Employee details
  - Payment breakdown
  - Amount in words
  - QR code for verification
- Download as PDF or print

**Step 5: Voucher Verification**
- External party scans QR code
- Redirected to `/verify-voucher` page
- System validates voucher authenticity
- Displays payment details if valid

### 3.4 Sales Management Workflow

**Step 1: Record Sale**
- Navigate to Sales module
- Click "New Sale" button
- Enter sale details:
  - Customer name and contact
  - Item sold
  - Quantity and rate
  - Payment status

**Step 2: Generate Receipt**
- View sale record
- Click to generate receipt
- Receipt includes:
  - Sale transaction details
  - Customer information
  - Total amount
  - QR code for verification

**Step 3: Export Data**
- Select date range
- Export to Excel format
- Download for external reporting

### 3.5 Coffee Processing Workflow

The processing pipeline follows these stages:

**Stage 1: Quality Control**
- Record harvest batch
- Perform ripeness scoring
- Conduct floating test
- Determine processing route

**Stage 2: Processing Type Selection**
- Based on quality assessment
- Route to appropriate process:
  - **Washed Process:** Washing → Fermentation → Drying
  - **Natural Process:** Natural sundrying
  - **Honey Process:** Partial washing → Drying

**Stage 3: Fermentation (Washed)**
- Record fermentation start
- Monitor fermentation duration
- Complete fermentation process

**Stage 4: Drying**
- Record drying start
- Monitor moisture levels
- Track drying completion

**Stage 5: Hulling**
- Process dried coffee
- Remove parchment layer
- Record output weight

**Stage 6: Bagging**
- Final processing stage
- Record bag weights
- Generate batch records

**Harvest Tracking:**
- Enter harvest ID at any stage
- View complete processing history
- Track current stage and progress

### 3.6 Task Management Workflow

**Step 1: Create Task**
- Access Task Management module
- Click "Create Task"
- Enter task details:
  - Title and description
  - Select activity type
  - Assign to staff member(s)
  - Set date and priority

**Step 2: Task Assignment**
- Tasks appear on staff's mobile app
- Staff receive notifications
- Calendar view shows scheduled tasks

**Step 3: Task Execution**
- Staff mark task as in-progress
- Upload photos/evidence if required
- Log weather conditions
- Record exceptions if any

**Step 4: Task Completion**
- Staff submit completed task
- Include completion notes
- Upload supporting evidence
- Task status updates to completed

**Step 5: Review & Monitoring**
- Admins view task submissions
- Review evidence and notes
- Handle exceptions
- Generate completion reports

---

## 4. System Architecture & Design

### 4.1 Architectural Overview

The Rugyeyo Farm Management System follows a modern client-server architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            React SPA (Vite Build)                   │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │    │
│  │  │  Pages   │ │Components│ │   Utilities      │    │    │
│  │  └──────────┘ └──────────┘ └──────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (REST API)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Django REST Framework Backend               │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │    │
│  │  │   Auth   │ │   APIs   │ │   Business Logic │    │    │
│  │  └──────────┘ └──────────┘ └──────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              PostgreSQL Database                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 High-Level System Architecture

The system consists of three primary layers:

**1. Client Layer (Frontend)**
- Single Page Application built with React + Vite
- Tailwind CSS for styling
- Client-side routing with React Router
- State management using React hooks

**2. Application Layer (Backend)**
- Django REST Framework API server
- JWT-based authentication
- RESTful API endpoints
- Business logic processing

**3. Data Layer**
- PostgreSQL relational database
- Structured data storage
- Transaction support

### 4.3 Frontend Architecture (React + Vite)

**Build System:**
- Vite 7.1.9 for fast development and optimized production builds
- Hot Module Replacement (HMR) for development
- Tailwind CSS plugin for styling

**Application Structure:**
```
src/
├── App.jsx              # Main application with routing
├── main.jsx             # Application entry point
├── index.css            # Global styles
├── components/          # Reusable UI components
│   ├── SideNav.jsx      # Main navigation sidebar
│   ├── ProcessingNav.jsx# Processing module navigation
│   ├── VoucherTemplate.jsx
│   └── ...
├── pages/               # Page components (routes)
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── wages.jsx
│   ├── Sales.jsx
│   └── ...
├── services/            # API configuration
│   └── ApiConfig.js
├── utils/               # Utility functions
│   ├── voucherGeneration.js
│   └── autoExpenseCreation.js
└── assets/              # Static assets (images, logos)
```

**Routing Structure:**
```javascript
// Public Routes
/                    → Login page
/verify-voucher      → Voucher verification (QR code landing)
/verify-receipt      → Receipt verification (QR code landing)

// Protected Routes (require authentication)
/dashboard           → Main dashboard
/wages               → Wages management
/sales               → Sales management
/expenses            → Expenses management
/staff               → Staff management
/aggregation         → Farmer/harvest aggregation
/harvest             → Harvest management
/processing/*        → Processing pipeline
/tasks               → Task management
/settings            → System settings
```

### 4.4 Backend Architecture (Django REST Framework)

The backend API provides RESTful endpoints for all system operations:

**API Base URL:** `{VITE_API_URL}/api/`

**Core API Modules:**
- **Authentication:** `/api/users/` - Login, security questions, profile
- **Staff:** `/api/staff/` - CRUD operations for staff records
- **Wages:** `/api/wages/` - Wage payment records
- **Sales:** `/api/sales/` - Sales transactions
- **Expenses:** `/api/expenses/` - Expense records
- **Aggregation:** `/api/aggregation/` - Farmer and harvest data
- **Processing:** `/api/processing/` - Coffee processing stages
- **Tasks:** `/api/tasks/` - Task management

**Authentication Flow:**
1. Client sends phone + PIN to `/api/users/login/`
2. Server validates credentials
3. Server returns JWT access token (and refresh token)
4. Client stores token in localStorage/sessionStorage
5. Client includes token in Authorization header for subsequent requests

### 4.5 Component Structure

**Layout Components:**
- `SideNav` - Main application layout with navigation sidebar
- `ProcessingNav` - Sub-navigation for processing module

**Page Components:**
Each page follows a consistent pattern:
1. Import dependencies and API config
2. Define color theme constants
3. Define sub-components (cards, lists, modals)
4. Main component with state management
5. useEffect for data fetching
6. Render with SideNav wrapper

**Reusable Components:**
- `Button` - Styled button component
- `Input` - Form input component
- `FormLayout` - Consistent form styling
- `VoucherTemplate` - Voucher/receipt formatting
- `BulkWageSpreadsheet` - Spreadsheet for bulk data entry
- `BulkStaffSpreadsheet` - Spreadsheet for staff import

---

## 5. Technology Stack

### 5.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI component library |
| Vite | 7.1.9 | Build tool and dev server |
| React Router DOM | 7.9.4 | Client-side routing |
| Tailwind CSS | 4.1.14 | Utility-first CSS framework |
| Axios | 1.12.2 | HTTP client for API calls |
| Lucide React | 0.544.0 | Icon library |
| Recharts | 3.4.1 | Charting library |
| jsPDF | 3.0.3 | PDF generation |
| html2canvas | 1.4.1 | HTML to canvas conversion |
| QRCode | 1.5.4 | QR code generation |
| xlsx | 0.18.5 | Excel file handling |
| ExcelJS | 4.4.0 | Advanced Excel operations |
| Handsontable | 16.2.0 | Spreadsheet component |
| React Leaflet | 5.0.0 | Map integration |
| Firebase | 12.4.0 | Backend services (if applicable) |

### 5.2 Backend Technologies

| Technology | Purpose |
|------------|---------|
| Python | Backend programming language |
| Django | Web framework |
| Django REST Framework | RESTful API development |
| PostgreSQL | Relational database |
| JWT | Token-based authentication |

### 5.3 Third-Party Services & APIs

**Geolocation Services:**
- Geoapify Geocoder Autocomplete for location search

**Document Generation:**
- jsPDF for PDF voucher/receipt generation
- html2canvas for HTML-to-image conversion
- QRCode for verification QR codes

**Data Export:**
- xlsx/ExcelJS for Excel export functionality

### 5.4 Hosting and Deployment Overview

**Development Environment:**
```
Frontend: http://localhost:5173 (Vite dev server)
Backend:  http://localhost:8000 or http://192.168.1.95:8000
```

**Production Environment:**
```
Frontend: Deployed web application
Backend:  http://142.93.94.236:8000 (DigitalOcean)
```

**Environment Configuration:**
Environment variables are managed via `.env` files:
```
VITE_API_URL=http://142.93.94.236:8000
VITE_FRONTEND_URL=https://your-domain.com
```

**Build Process:**
```bash
npm run build    # Creates optimized production build in /dist
npm run preview  # Preview production build locally
```

---

## 6. Core Functional Modules

### 6.1 Dashboard Module

**File:** `src/pages/Dashboard.jsx`

**Purpose:** Provides a comprehensive financial overview of farm operations.

**Features:**
- **KPI Cards:**
  - Total Sales (UGX)
  - Total Expenses (UGX)
  - Active Staff count
  - Total Wages paid

- **Sales vs. Expenses Chart:**
  - Bar chart comparing monthly totals
  - Last 6 months of data
  - Visual comparison of revenue vs. costs

- **Financial Distribution:**
  - Pie chart showing allocation
  - Sales, Expenses, and Wages breakdown
  - Percentage calculations

- **Recent Transactions:**
  - Combined list of sales and expenses
  - Color-coded by type (green=sale, red=expense)
  - Date and amount display

- **Recent Activities:**
  - System activity feed
  - User actions (created, updated, deleted)
  - Timestamp with relative time display

**Data Flow:**
1. Component mounts and calls `fetchDashboardData()`
2. Parallel API calls to Sales, Expenses, Wages, Staff, Activities
3. Data aggregated and calculated client-side
4. Auto-refresh every 5 minutes

### 6.2 Staff Management Module

**Files:**
- `src/pages/StaffManagement.jsx`
- `src/pages/StaffRegistration.jsx`
- `src/components/BulkStaffSpreadsheet.jsx`

**Purpose:** Manage employee records and registrations.

**Features:**
- Staff listing with search and filter
- Individual staff registration form
- Bulk registration via spreadsheet import
- Staff profile viewing and editing
- Staff categorization and department assignment

**Data Fields:**
- First name, Last name
- Phone number, Email
- National ID (NIN)
- Department, Role
- Employment date
- Status (active/inactive)

### 6.3 Wages Management Module

**Files:**
- `src/pages/wages.jsx`
- `src/pages/WageEntry.jsx`
- `src/pages/voucher.jsx`
- `src/pages/VoucherVerification.jsx`
- `src/components/BulkWageSpreadsheet.jsx`
- `src/utils/voucherGeneration.js`

**Purpose:** Record and track wage payments to staff.

**Features:**
- Wage record listing with pagination
- Individual wage entry form
- Bulk wage recording via spreadsheet
- Automatic calculation (daily rate × days worked - deductions)
- PDF voucher generation with:
  - Employee details
  - Payment breakdown
  - Amount in words
  - QR code for verification
- Voucher verification via QR code scan
- Excel export functionality

**Voucher Generation Process:**
1. User clicks view voucher on wage record
2. System generates HTML voucher template
3. QR code created with verification URL
4. User can download as PDF or print

### 6.4 Sales Management Module

**Files:**
- `src/pages/Sales.jsx`
- `src/pages/SalesEntry.jsx`
- `src/pages/receipt.jsx`
- `src/pages/ReceiptVerification.jsx`

**Purpose:** Track coffee sales and generate receipts.

**Features:**
- Sales record listing
- New sale entry form
- Customer information tracking
- Receipt generation with QR verification
- Payment status tracking
- Excel export functionality

**Data Fields:**
- Customer name and contact
- Item description
- Quantity and rate
- Total amount
- Date of payment
- Payment status

### 6.5 Expenses Management Module

**Files:**
- `src/pages/Expenses.jsx`
- `src/pages/ExpenseEntry.jsx`
- `src/utils/autoExpenseCreation.js`

**Purpose:** Track farm operational expenses.

**Features:**
- Expense record listing
- Expense categorization
- New expense entry
- Expense trend tracking
- Excel export functionality

**Expense Categories:**
- Farm supplies
- Equipment
- Labor (auto-created from wages)
- Transportation
- Utilities
- Miscellaneous

### 6.6 Aggregation Module

**File:** `src/pages/Aggregation.jsx`

**Purpose:** Manage external farmer relationships and harvest collections.

**Features:**
- **Farmer Registry:**
  - Farmer registration
  - Contact and location information
  - Coffee variety grown
  - Number of trees
  - Land ownership details

- **Farmer Harvest Tracking:**
  - Record harvest deliveries
  - Track weight on delivery
  - Record price per kg and amount paid
  - Coffee type classification
  - Delivery location and GPS coordinates

- **KPI Dashboard:**
  - Total farmers registered
  - Total harvests received
  - Total weight delivered
  - Monthly harvest chart

**Expandable Row Details:**
- Click chevron to view additional information
- Price per kg, amount paid (hidden by default)
- Coffee type, location, GPS coordinates
- Number of bags, paid by information

### 6.7 Harvest Module

**File:** `src/pages/harvest.jsx`

**Purpose:** Manage coffee harvest operations from farm workers.

**Features:**
- Harvest record entry
- Worker assignment
- Weight and quality recording
- Batch ID generation
- Processing routing

### 6.8 Processing Module

**Files:**
- `src/pages/Processing.jsx`
- `src/pages/ProcessingOverview.jsx`
- `src/pages/QualityControl.jsx`
- `src/pages/ProcessingType.jsx`
- `src/pages/Fermenting.jsx`
- `src/pages/NaturalSundrying.jsx`
- `src/pages/Washing.jsx`
- `src/pages/Drying.jsx`
- `src/pages/Hulling.jsx`
- `src/pages/Bagging.jsx`
- `src/components/ProcessingNav.jsx`

**Purpose:** Track coffee through all processing stages.

**Processing Overview Dashboard:**
- Total batches in system
- In-progress batches
- Completed batches
- Average processing time
- Harvest ID search/tracking

**Quality Control:**
- Ripeness scoring (1-5 scale)
- Floating test results
- Grade assignment
- Processing route determination

**Processing Types:**
1. **Washed Process:**
   - Washing stage
   - Fermentation monitoring
   - Drying to target moisture

2. **Natural Process:**
   - Natural sundrying
   - Extended drying period

3. **Honey Process:**
   - Partial mucilage removal
   - Controlled drying

**Drying Module:**
- Track drying start/end dates
- Monitor moisture levels
- Multiple drying beds/tables

**Hulling Module:**
- Remove parchment layer
- Record input/output weights
- Calculate yield percentage

**Bagging Module:**
- Final bagging operations
- Bag weight recording
- Batch completion

**Harvest Tracking Feature:**
- Enter harvest ID
- View complete processing history
- Current stage indicator
- Timeline of all stages

### 6.9 Task Management Module

**File:** `src/pages/TaskManagement.jsx`

**Purpose:** Manage daily farm operations and staff assignments.

**Features:**
- **Task Creation:**
  - Title and description
  - Activity type selection
  - Staff assignment (single or multiple)
  - Date and time scheduling
  - Priority levels (low, medium, high)

- **Task Views:**
  - List view with expandable details
  - Calendar view (week/month)
  - Filter by status and date

- **Task Execution:**
  - Mobile app integration
  - Photo evidence upload
  - Weather condition logging
  - Exception reporting

- **Surveillance & Monitoring:**
  - Task completion tracking
  - SLA timers
  - Exception management
  - Completion rate analytics

**Task Statuses:**
- Pending
- In Progress
- Completed
- Overdue
- Exception

---

## 7. Security & Compliance

### 7.1 Authentication & Authorization

**Authentication Method:**
The system uses phone number + 4-digit PIN authentication:

```javascript
// Login request
POST /api/users/login/
{
  "phone": "0700000000",
  "pin": "1234"
}

// Response
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {
    "id": 1,
    "phone": "0700000000",
    "full_name": "John Doe",
    "security_answers_set": true
  }
}
```

**Token Storage:**
- "Remember Me" checked: localStorage
- "Remember Me" unchecked: sessionStorage

**Authorization Header:**
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

**Protected Routes:**
```javascript
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken') ||
                sessionStorage.getItem('authToken');
  return token ? children : <Navigate to="/" replace />;
};
```

### 7.2 Data Protection

**Security Questions:**
- Users set up 3 security questions on first login
- Questions used for PIN recovery
- Answers stored in lowercase for case-insensitive matching

**PIN Reset Flow:**
1. User provides phone number
2. System returns user's 3 security questions
3. User answers all 3 questions
4. User sets new 4-digit PIN
5. System verifies answers and updates PIN

**Input Validation:**
- Phone numbers: exactly 10 digits
- PIN: exactly 4 digits
- Security answers: minimum 2 characters
- Alphanumeric characters only for answers

### 7.3 Session Management

**Session Handling:**
```javascript
// Logout function
const performLogout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userSession');
  localStorage.removeItem('userPhone');
  localStorage.removeItem('refreshToken');
  sessionStorage.clear();
  window.location.href = '/';
};
```

**Token Refresh:**
- Refresh token provided at login
- Used to obtain new access tokens
- Stored alongside access token

---

## 8. API Reference

### 8.1 API Configuration

**Configuration File:** `src/services/ApiConfig.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}/api/${endpoint}/`;
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/users/login/`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  USER_ME: `${API_BASE_URL}/api/users/me/`,

  // Security
  RANDOM_SECURITY_QUESTIONS: `${API_BASE_URL}/api/users/random-security-questions/`,
  SETUP_SECURITY_ANSWERS: `${API_BASE_URL}/api/users/setup-security-answers/`,
  USER_SECURITY_QUESTIONS: `${API_BASE_URL}/api/users/user-security-questions/`,
  VERIFY_ANSWERS_RESET_PIN: `${API_BASE_URL}/api/users/verify-answers-reset-pin/`,

  // Core Data
  STAFF: getApiUrl('staff'),
  WAGES: getApiUrl('wages'),
  SALES: getApiUrl('sales'),
  EXPENSES: getApiUrl('expenses'),

  // Aggregation
  FARMER_HARVEST: `${API_BASE_URL}/api/aggregation/farmer-harvest/`,
  HARVESTS: `${API_BASE_URL}/api/harvests/`,

  // Processing
  RIPENESS: `${API_BASE_URL}/api/processing/ripeness/`,
  FLOATING: `${API_BASE_URL}/api/processing/floating/`,
  FERMENTING: `${API_BASE_URL}/api/processing/fermenting/`,
  NATURAL_SUNDRYING: `${API_BASE_URL}/api/processing/sundrying/`,
  WASHING: `${API_BASE_URL}/api/processing/washing/`,
  DRYING: `${API_BASE_URL}/api/processing/drying/`,
  BAGGING: `${API_BASE_URL}/api/processing/bagging/`,
  HARVEST_TRACKING: `${API_BASE_URL}/api/processing/track/`,

  // Tasks
  TASKS: `${API_BASE_URL}/api/tasks/`,
  TASK_SUBMISSIONS: `${API_BASE_URL}/api/tasks/submissions/`,
  SEASONS: `${API_BASE_URL}/api/tasks/seasons/`,

  // Farm Management
  BLOCKS: `${API_BASE_URL}/api/blocks/`,
  ACTIVITIES: `${API_BASE_URL}/api/activities/activities/?platform=web`,
};
```

### 8.2 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/login/` | User login with phone + PIN |
| GET | `/api/users/me/` | Get current user profile |
| POST | `/api/users/random-security-questions/` | Get random security questions |
| POST | `/api/users/setup-security-answers/` | Set up security answers |
| POST | `/api/users/user-security-questions/` | Get user's security questions |
| POST | `/api/users/verify-answers-reset-pin/` | Verify answers and reset PIN |

### 8.3 Core Data Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/staff/` | List all staff |
| POST | `/api/staff/` | Create new staff |
| GET | `/api/staff/{id}/` | Get staff details |
| PUT | `/api/staff/{id}/` | Update staff |
| DELETE | `/api/staff/{id}/` | Delete staff |
| GET | `/api/wages/` | List all wages |
| POST | `/api/wages/` | Create wage record |
| GET | `/api/sales/` | List all sales |
| POST | `/api/sales/` | Create sale record |
| GET | `/api/expenses/` | List all expenses |
| POST | `/api/expenses/` | Create expense record |

### 8.4 Processing Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/processing/ripeness/` | List ripeness scores |
| POST | `/api/processing/ripeness/` | Record ripeness score |
| GET | `/api/processing/floating/` | List floating tests |
| POST | `/api/processing/floating/` | Record floating test |
| GET | `/api/processing/fermenting/` | List fermentation records |
| POST | `/api/processing/fermenting/` | Record fermentation |
| GET | `/api/processing/drying/` | List drying records |
| POST | `/api/processing/drying/` | Record drying |
| GET | `/api/processing/bagging/` | List bagging records |
| POST | `/api/processing/bagging/` | Record bagging |
| GET | `/api/processing/track/` | Track harvest processing |

---

## 9. Deployment & Maintenance

### 9.1 Environment Configuration

**Development Setup:**

1. Clone repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file:
   ```
   VITE_API_URL=http://localhost:8000
   VITE_FRONTEND_URL=http://localhost:5173
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

**Production Configuration:**

Create `.env.production`:
```
VITE_API_URL=http://142.93.94.236:8000
VITE_FRONTEND_URL=https://your-domain.com
```

### 9.2 Build & Deployment

**Build for Production:**
```bash
npm run build
```

This creates an optimized build in the `/dist` directory.

**Preview Build:**
```bash
npm run preview
```

**Deployment Steps:**
1. Build the application
2. Upload `/dist` contents to web server
3. Configure web server (Nginx/Apache) to serve SPA
4. Ensure all routes redirect to `index.html`

**Nginx Configuration Example:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/rugyeyo/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://142.93.94.236:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 9.3 Maintenance Guidelines

**Regular Tasks:**
- Monitor API endpoint availability
- Review error logs
- Update dependencies periodically
- Backup environment configurations

**Troubleshooting Common Issues:**

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Login fails | Incorrect API URL | Check VITE_API_URL in .env |
| Data not loading | Token expired | Re-login to get new token |
| QR codes not working | Wrong frontend URL | Update VITE_FRONTEND_URL |
| PDF generation fails | Missing logo | Ensure logo.png in /public |

---

## 10. Appendices

### 10.1 File Structure

```
rugyeyo-web/
├── public/
│   ├── img/
│   │   └── coffee harvest.png
│   └── logo.png
├── src/
│   ├── assets/
│   │   └── rugyeyo_logo.png
│   ├── components/
│   │   ├── BulkStaffSpreadsheet.jsx
│   │   ├── BulkWageSpreadsheet.jsx
│   │   ├── Button.jsx
│   │   ├── CustomAutocomplete.jsx
│   │   ├── FarmMap.jsx
│   │   ├── FormLayout.jsx
│   │   ├── Input.jsx
│   │   ├── LocationSelector.jsx
│   │   ├── NavBar.jsx
│   │   ├── pin.jsx
│   │   ├── ProcessingNav.jsx
│   │   ├── ProfilePopup.jsx
│   │   ├── SideNav.jsx
│   │   └── VoucherTemplate.jsx
│   ├── pages/
│   │   ├── Aggregation.jsx
│   │   ├── Bagging.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Drying.jsx
│   │   ├── ExpenseEntry.jsx
│   │   ├── Expenses.jsx
│   │   ├── Fermenting.jsx
│   │   ├── harvest.jsx
│   │   ├── Hulling.jsx
│   │   ├── Login.jsx
│   │   ├── NaturalSundrying.jsx
│   │   ├── Processing.jsx
│   │   ├── ProcessingOverview.jsx
│   │   ├── ProcessingType.jsx
│   │   ├── QualityControl.jsx
│   │   ├── receipt.jsx
│   │   ├── ReceiptVerification.jsx
│   │   ├── Sales.jsx
│   │   ├── SalesEntry.jsx
│   │   ├── SecurityQuestions.jsx
│   │   ├── Settings.jsx
│   │   ├── StaffManagement.jsx
│   │   ├── StaffRegistration.jsx
│   │   ├── TaskManagement.jsx
│   │   ├── voucher.jsx
│   │   ├── VoucherVerification.jsx
│   │   ├── WageEntry.jsx
│   │   ├── wages.jsx
│   │   └── Washing.jsx
│   ├── services/
│   │   └── ApiConfig.js
│   ├── utils/
│   │   ├── autoExpenseCreation.js
│   │   ├── receiptNavigation.js
│   │   └── voucherGeneration.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env
├── .env.example
├── .env.production
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js
```

### 10.2 Color Theme Reference

The application uses a consistent coffee-themed color palette:

```javascript
const CoffeeColors = {
    // Backgrounds
    SCREEN_BG: '#F8F9FB',      // Light gray background
    SIDEBAR_BG: '#F8F9FB',     // Sidebar background
    LIGHT_BG: '#efebe9',       // Light brown accent

    // Browns
    DARK_BROWN: '#4A3423',     // Primary dark brown
    MEDIUM_BROWN: '#795548',   // Medium brown
    BUTTON_BROWN: '#8B4513',   // Button/action brown
    CARD_BROWN: '#8B5A3C',     // Card accent brown
    LIGHT_BROWN: '#D4A574',    // Light brown accent

    // Text
    WHITE_TEXT: '#FFFFFF',     // White text
    GRAY_TEXT: '#666666',      // Secondary text

    // Borders
    BORDER_GRAY: '#E0E0E0',    // Border color

    // Status Colors
    SUCCESS_GREEN: '#4CAF50',  // Success/positive
    ERROR_RED: '#D32F2F',      // Error/negative
    SALE_GREEN: '#C8E6C9',     // Sale indicator
    EXPENSE_RED: '#FFCDD2',    // Expense indicator
};
```

### 10.3 Troubleshooting Guide

**Authentication Issues:**

| Symptom | Diagnosis | Resolution |
|---------|-----------|------------|
| "Cannot connect to server" | API unreachable | Check network, verify API URL |
| "Invalid credentials" | Wrong phone/PIN | Verify credentials, use PIN reset |
| "User not registered" | Phone not in system | Contact admin for registration |
| Session expires quickly | Using sessionStorage | Check "Remember Me" for persistence |

**Data Loading Issues:**

| Symptom | Diagnosis | Resolution |
|---------|-----------|------------|
| Dashboard shows 0s | API calls failing | Check console for errors, verify token |
| Table shows "Loading..." | Slow API response | Wait or refresh, check backend |
| "No records found" | Empty database | Verify data exists in backend |

**Document Generation Issues:**

| Symptom | Diagnosis | Resolution |
|---------|-----------|------------|
| Logo not showing | Wrong path | Ensure logo.png in /public |
| QR code fails | Frontend URL wrong | Update VITE_FRONTEND_URL |
| PDF download fails | Browser blocking | Allow popups/downloads |

**Processing Module Issues:**

| Symptom | Diagnosis | Resolution |
|---------|-----------|------------|
| Harvest not found | Invalid harvest ID | Verify ID exists in system |
| Processing stages missing | Incomplete data | Check each stage has records |

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 28 Jan 2026 | Technical Team | Initial documentation |

---

*This document is confidential and intended for internal use only.*

*Rugyeyo Farm Management System - Technical Manual v1.0*
