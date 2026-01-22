# TRAB Case Repository Frontend - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture](#architecture)
5. [Core Features](#core-features)
6. [API Services](#api-services)
7. [Routing & Navigation](#routing--navigation)
8. [Component Breakdown](#component-breakdown)
9. [Styling & Theming](#styling--theming)
10. [Configuration](#configuration)
11. [Development Guide](#development-guide)
12. [Deployment](#deployment)

---

## Project Overview

The **TRAB Case Repository Frontend** is a comprehensive Vue 3 application designed for the Tax Revenue Appeals Board (TRAB) to manage, search, and analyze tax appeal cases. The application provides advanced search capabilities (hybrid, full-text, and semantic), OCR document processing, TRAIS synchronization, and an interactive analytics dashboard.

### Key Objectives
- Provide efficient case search and retrieval
- Enable OCR processing of case documents
- Synchronize data from TRAIS (Tax Revenue Appeals Information System)
- Visualize case statistics and trends
- Manage user permissions and roles

---

## Technology Stack

### Core Framework
- **Vue 3** (v3.4.34) - Progressive JavaScript framework using Composition API
- **Vue Router** (v4.4.0) - Official routing library
- **Vite** (v5.3.1) - Next-generation frontend build tool

### UI Framework & Components
- **PrimeVue** (v4.0.0) - Enterprise-grade UI component library
- **PrimeIcons** (v6.0.1) - Icon set for PrimeVue
- **@primevue/themes** (v4.0.0) - Aura theme preset
- **Tailwind CSS** (v3.4.6) - Utility-first CSS framework
- **Chart.js** (v3.3.2) - Data visualization library

### Additional Libraries
- **Axios** (v1.7.7) - HTTP client for API requests
- **@vueuse/core** (v12.3.0) - Vue composition utilities (idle detection)
- **jsPDF** (v2.5.2) - PDF generation
- **xlsx** (v0.18.5) - Excel file handling
- **maska** (v3.0.3) - Input masking

### Development Tools
- **ESLint** (v8.57.0) - Code linting
- **Prettier** (v3.2.5) - Code formatting
- **Sass** (v1.55.0) - CSS preprocessor
- **TypeScript** - Type definitions and configurations

---

## Project Structure

```
case-repository-frontend/
├── src/
│   ├── assets/              # Static assets (styles, images)
│   │   ├── styles.scss      # Global SCSS styles
│   │   └── tailwind.css     # Tailwind CSS imports
│   │
│   ├── components/          # Reusable components
│   │   └── FloatingConfigurator.vue
│   │
│   ├── layout/              # Layout components
│   │   ├── AppLayout.vue    # Main application layout
│   │   ├── AppTopbar.vue    # Top navigation bar
│   │   ├── AppSidebar.vue   # Sidebar navigation
│   │   ├── AppMenu.vue      # Menu with permission filtering
│   │   ├── AppMenuItem.vue  # Individual menu items
│   │   ├── AppFooter.vue    # Footer component
│   │   ├── AppConfigurator.vue
│   │   └── composables/
│   │       └── layout.js    # Layout composition logic
│   │
│   ├── router/              # Routing configuration
│   │   └── index.js         # Route definitions
│   │
│   ├── service/             # API service layer
│   │   ├── Api.js           # Base API configuration
│   │   ├── SearchService.js # Search operations
│   │   ├── OcrService.js    # OCR management
│   │   ├── SyncService.js   # TRAIS synchronization
│   │   ├── DashboardService.js # Dashboard data
│   │   ├── AppealService.js # Appeal management
│   │   ├── LoginService.js  # Authentication
│   │   ├── UserManagement.js # User operations
│   │   ├── RoleService.js   # Role management
│   │   ├── NoticeService.js # Notice handling
│   │   ├── SummonsService.js # Summons handling
│   │   ├── PaymentService.js # Payment operations
│   │   ├── BillService.js   # Billing operations
│   │   ├── FeesService.js   # Fee management
│   │   ├── JudgeService.js  # Judge/chairperson data
│   │   ├── PartyService.js  # Party management
│   │   ├── SetupService.js  # Common setup
│   │   ├── ProductService.js # Product data
│   │   ├── CustomerService.js # Customer data
│   │   ├── CountryService.js # Country data
│   │   ├── NodeService.js   # Node tree data
│   │   ├── NoticeHighService.js # High court notices
│   │   └── PhotoService.js  # Photo handling
│   │
│   ├── utils/               # Utility functions
│   │   └── Config.js        # API configuration
│   │
│   ├── views/               # Page components
│   │   ├── Dashboard.vue    # Analytics dashboard
│   │   ├── SearchCases.vue  # Case search interface
│   │   ├── CaseDetails.vue  # Case detail view
│   │   ├── OcrManagement.vue # OCR dashboard
│   │   ├── SyncManagement.vue # TRAIS sync interface
│   │   ├── SearchCasesEnterprise.vue # Alternative search
│   │   │
│   │   └── pages/
│   │       ├── auth/
│   │       │   ├── Login.vue
│   │       │   ├── Access.vue
│   │       │   └── Error.vue
│   │       │
│   │       ├── appeals/
│   │       │   ├── Notices.vue
│   │       │   ├── Summons.vue
│   │       │   ├── NoticeHighCourt.vue
│   │       │   ├── Statements.vue
│   │       │   ├── Applications.vue
│   │       │   └── NotFound.vue
│   │       │
│   │       ├── payment/
│   │       │   ├── Payment.vue
│   │       │   └── Bill.vue
│   │       │
│   │       ├── reports/
│   │       │   ├── AppealReports.vue
│   │       │   ├── PaymentReports.vue
│   │       │   └── SummonReports.vue
│   │       │
│   │       ├── settings/
│   │       │   ├── UserManagement.vue
│   │       │   ├── RoleManagement.vue
│   │       │   ├── CommonSetup.vue
│   │       │   ├── Judge.vue
│   │       │   ├── Parties.vue
│   │       │   ├── Fees.vue
│   │       │   └── AppealStatusTrend.vue
│   │       │
│   │       └── defaults/
│   │           ├── Landing.vue
│   │           ├── Crud.vue
│   │           └── Empty.vue
│   │
│   ├── App.vue              # Root component
│   └── main.js              # Application entry point
│
├── public/                  # Public static assets
├── node_modules/            # Dependencies
├── vite.config.mjs          # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── package.json             # Project dependencies
└── .gitignore              # Git ignore rules
```

---

## Architecture

### Application Flow

```
main.js (Entry)
    ↓
App.vue (Root Component)
    ↓
Router (vue-router)
    ↓
AppLayout (Authenticated Routes)
    ├── AppTopbar
    ├── AppSidebar
    │   └── AppMenu (Permission-filtered)
    │       └── AppMenuItem
    └── Router View (Page Content)
```

### State Management
- **LocalStorage**: Used for authentication tokens and permissions
- **Reactive State**: Vue 3 Composition API (ref, reactive)
- **Service Layer**: Centralized API calls with Axios

### Idle Timeout System
Implemented in `main.js:18-94`:
- **Idle Timeout**: 15 minutes (900,000ms)
- **Warning Time**: 10 seconds before logout
- **Technology**: `@vueuse/core` useIdle and useCounter
- **Auto Logout**: Clears tokens and redirects to `/login`

---

## Core Features

### 1. Case Search System
**Location**: `src/views/SearchCases.vue`

**Search Types**:
- **Hybrid Search**: Combines full-text and semantic search with adjustable weights
- **Full-Text Search**: Traditional keyword-based matching
- **Semantic Search**: AI-powered meaning-based search

**Features**:
- Adjustable search weights (0-1 scale)
- Result limit configuration (1-100)
- Term highlighting in results
- Execution time display
- Rich case metadata display
- Direct navigation to case details

**API Integration**:
```javascript
SearchService.hybridSearch(query, limit, ftWeight, semWeight)
SearchService.fullTextSearch(query, limit)
SearchService.semanticSearch(query, limit)
```

---

### 2. OCR Management Dashboard
**Location**: `src/views/OcrManagement.vue`

**Features**:
- **Queue Statistics**: Real-time monitoring (waiting, active, completed, failed, total)
- **Document Statistics**: Processing status breakdown
- **Recent Jobs Table**: Paginated job history
- **Auto-refresh**: Updates every 5 seconds
- **Job Actions**: View details, reprocess failed jobs
- **Batch Processing**: Process all pending documents

**API Integration**:
```javascript
OcrService.getQueueStats()
OcrService.getDocumentStats()
OcrService.getRecentJobs()
OcrService.processPendingDocuments()
OcrService.reprocessDocument(documentId)
```

---

### 3. TRAIS Sync Management
**Location**: `src/views/SyncManagement.vue`

**Features**:
- Sync individual appeals by Appeal ID
- Sync history tracking
- Success/error notifications
- Integration with TRAIS API

**API Integration**:
```javascript
SyncService.syncAppeal(appealId)
```

**File Processing**:
- PDFs processed from: `/Users/mwendavano/trab/files/`

---

### 4. Analytics Dashboard
**Location**: `src/views/Dashboard.vue`

**Statistics Cards**:
- Total Cases
- Pending Cases
- Decided Cases
- Average Resolution Days

**Charts**:
1. **Cases by Status** (Pie Chart)
   - Pending, Decided, Appealed, Withdrawn, Settled

2. **Cases by Outcome** (Bar Chart)
   - Allowed, Dismissed, Partially Allowed, Remanded

3. **Cases by Tax Type** (Doughnut Chart)
   - Income Tax, VAT, Customs & Excise, Withholding Tax, PAYE

4. **Monthly Trends** (Line Chart)
   - Filed, Decided, Pending (12 months)

**Data Tables**:
- **Cases by Chairperson**: Total, outcomes, average resolution days
- **Recent Decisions**: Latest 5 decisions with full details

**API Integration**:
```javascript
DashboardService.getDashboardStats()
DashboardService.getCasesByJudge()
DashboardService.getCasesByStatus()
DashboardService.getCasesByOutcome()
DashboardService.getCasesByType()
DashboardService.getRecentDecisions()
```

**Data Aggregation**:
The `DashboardService` implements intelligent data fetching:
1. First attempts to fetch from `/api/v1/cases/stats`
2. Falls back to aggregating from `/api/v1/cases` if stats unavailable
3. Uses mock data as final fallback for development

---

## API Services

### Base Configuration
**File**: `src/utils/Config.js`

```javascript
API_BASE_URL: 'http://localhost:3000/api/v1'
```

### Service Architecture

All services follow a consistent pattern:
- Axios-based HTTP client
- Centralized error handling
- Promise-based async/await
- Console logging for debugging

### Core Services

#### SearchService.js
**Base URL**: `${API_BASE_URL}/search`

**Methods**:
- `hybridSearch(query, limit, ftWeight, semWeight)` - Hybrid search
- `fullTextSearch(query, limit)` - Full-text search
- `semanticSearch(query, limit)` - Semantic search

#### OcrService.js
**Base URL**: `${API_BASE_URL}/ocr`

**Methods**:
- `processPendingDocuments()` - Queue all pending documents
- `processDocument(documentId)` - Process specific document
- `reprocessDocument(documentId)` - Retry failed document
- `getDocumentStatus(documentId)` - Get processing status
- `getQueueStats()` - Queue statistics
- `getRecentJobs()` - Recent job history
- `getJobStatus(jobId)` - Specific job details
- `getDocumentStats()` - Document statistics

#### SyncService.js
**Base URL**: `${API_BASE_URL}/sync`

**Methods**:
- `syncAppeal(appealId)` - Sync from TRAIS by Appeal ID

#### DashboardService.js
**Base URL**: `${API_BASE_URL}/cases`

**Methods**:
- `getDashboardStats()` - Overall statistics
- `getCasesByJudge()` - Chairperson breakdown
- `getCasesByStatus()` - Status distribution
- `getCasesByOutcome()` - Outcome distribution
- `getCasesByType()` - Tax type distribution
- `getRecentDecisions()` - Latest decisions
- `getAllCases(page, limit)` - Paginated case list
- `getCaseById(id)` - Single case by UUID
- `getCaseByCaseNumber(caseNumber)` - Single case by case number

**Special Features**:
- Automatic data aggregation from case list if stats endpoint unavailable
- Mock data fallback for development
- Average resolution days calculation

---

## Routing & Navigation

### Router Configuration
**File**: `src/router/index.js`

**Router Mode**: HTML5 History Mode (`createWebHistory`)

### Route Structure

#### Public Routes
```javascript
/login          → Login.vue
/landing        → Landing.vue
/auth/access    → Access.vue (Access Denied)
/auth/error     → Error.vue
```

#### Protected Routes (AppLayout)
```javascript
/               → Redirect to /search
/search         → SearchCases.vue
/case/:id       → CaseDetails.vue
/ocr            → OcrManagement.vue
/sync           → SyncManagement.vue
/dashboard      → Dashboard.vue
```

#### Appeal Management Routes
```javascript
/pages/notices       → Notices.vue
/pages/high          → NoticeHighCourt.vue
/pages/summons       → Summons.vue
/pages/applications  → Applications.vue
/pages/statements    → Statements.vue
```

#### Settings Routes
```javascript
/common-setup           → CommonSetup.vue
/judges                 → Judge.vue
/parties                → Parties.vue
/fees                   → Fees.vue
/user-management/users  → UserManagement.vue
/user-management/roles  → RoleManagement.vue
```

#### Payment Routes
```javascript
/bill     → Bill.vue
/payment  → Payment.vue
```

#### Report Routes
```javascript
/reports/appeal-reports   → AppealReports.vue
/reports/payment-reports  → PaymentReports.vue
/reports/summons-reports  → SummonReports.vue
```

#### Default/Template Routes
```javascript
/pages/empty  → Empty.vue
/pages/crud   → Crud.vue
```

#### 404 Catch-All
```javascript
/:pathMatch(.*)*  → NotFound.vue
```

### Navigation Guards
Currently not implemented. Recommended to add:
- Authentication check
- Permission-based route access
- Redirect unauthenticated users to `/login`

---

## Component Breakdown

### Layout Components

#### AppLayout.vue
Main application wrapper containing topbar, sidebar, and router view.

#### AppTopbar.vue
**Location**: `src/layout/AppTopbar.vue`

Top navigation bar with:
- Application logo/branding
- User profile
- Notifications
- Theme switcher
- Logout button

**Styling**: Government enterprise theme (Navy Blue #1B365D)

#### AppSidebar.vue
**Location**: `src/layout/AppSidebar.vue`

Collapsible sidebar navigation with:
- Fixed icon opacity
- Responsive design
- Smooth transitions

#### AppMenu.vue
**Location**: `src/layout/AppMenu.vue:6-73`

**Permission System**:
```javascript
const permissionMapping = {
    'Manage Bill': ['Bill'],
    'Manage Settings': ['Common Setup', 'Judge', 'Parties', 'Fees', 'User Management'],
    'Manage Payment': ['Payment'],
    'Manage Notice': ['Notices'],
    'Manage Statement': ['Statements'],
    'Manage Application': ['Applications'],
    'Report Manager': ['Appeal Reports', 'Payment Reports']
}
```

**Menu Structure**:
```javascript
[
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
    },
    {
        label: 'TRAB Case Repository',
        items: [
            { label: 'Search Cases', icon: 'pi pi-fw pi-search', to: '/search' },
            { label: 'OCR Management', icon: 'pi pi-fw pi-file', to: '/ocr' },
            { label: 'Sync from TRAIS', icon: 'pi pi-fw pi-sync', to: '/sync' }
        ]
    },
    {
        label: 'Settings',
        items: [
            { label: 'Users', icon: 'pi pi-fw pi-user', to: '/user-management/users' },
            { label: 'Roles', icon: 'pi pi-fw pi-users', to: '/user-management/roles' }
        ]
    }
]
```

**Permission Filtering**:
- Reads permissions from `localStorage.getItem('permissions')`
- Filters menu items based on user permissions
- Handles comma-separated or array permission formats

---

### View Components

#### Dashboard.vue (Lines 1-523)
**Sections**:
1. **Header**: Title and description
2. **Stats Cards Grid**: 4 key metrics
3. **Chart Grid Row 1**: Status pie + Outcome bar
4. **Chart Grid Row 2**: Type doughnut + Monthly trends line
5. **Chairperson Table**: Sortable, paginated
6. **Recent Decisions Table**: Latest decisions

**Chart Configuration**:
- Responsive: `maintainAspectRatio: false`
- Fixed heights: 320px
- Government color scheme: #1B365D primary
- 2px border radius for formal appearance

**Data Flow**:
```
onMounted()
    ↓
loadDashboardData()
    ↓
DashboardService methods (parallel Promise.all)
    ↓
setupCharts()
    ↓
Render with Chart.js
```

#### SearchCases.vue (Lines 1-414)
**Search Flow**:
```
User input → performSearch()
    ↓
Switch searchType
    ↓
Call appropriate SearchService method
    ↓
Display results with highlighting
```

**Highlighting Algorithm** (Lines 276-291):
- Splits query into individual terms
- Escapes regex special characters
- Creates dynamic regex pattern
- Wraps matches in `<span class="highlight">`

**Result Card**:
- Case number and document/page info
- Score and match type tags
- Case metadata (type, status, appellant, respondent)
- Tax amount disputed
- Outcome badge
- Content snippet with highlighting
- Board members
- "View Full Case Details" button

#### OcrManagement.vue (Lines 1-372)
**Auto-Refresh System** (Lines 262-272):
```javascript
mounted() {
    this.loadData()
    this.autoRefreshInterval = setInterval(() => {
        this.loadData(true) // Silent refresh
    }, 5000) // 5 seconds
}

beforeUnmount() {
    clearInterval(this.autoRefreshInterval)
}
```

**Queue Stats Display**:
- 5 stat cards: Waiting, Active, Completed, Failed, Total
- Color-coded backgrounds: Blue, Yellow, Green, Red, Purple
- Icon indicators with animations (spinner for active)

**Jobs Table**:
- File name, status, progress bar
- Created/completed timestamps
- Actions: View details, Reprocess (if failed)
- Pages processed count

#### SyncManagement.vue (Lines 1-185)
**Features**:
- Appeal ID input (numeric, no grouping)
- Sync button (disabled if no ID)
- Sync history table
- Success/error messages
- Toast notifications

**Sync History**:
- Automatically updates after each sync
- Shows Appeal ID, Status (success/danger), Timestamp, Message
- Newest entries first (unshift)

---

## Styling & Theming

### Design System

**Primary Color**: Navy Blue `#1B365D`
- Government enterprise aesthetic
- Professional, formal appearance

**Secondary Colors**:
- Green: `#10B981` (Success)
- Orange: `#F59E0B` (Warning)
- Red: `#DC2626` (Danger)
- Purple: `#6366F1` (Info)

**Typography**:
- Font Family: `'Inter', 'Roboto', system-ui, sans-serif`
- Headings: Bold (700), Navy Blue
- Labels: Uppercase, 600 weight, letter-spacing 0.025em

**Border Radius**: 2px (formal, government style)

**Shadows**:
- Default: `0 1px 3px rgba(0, 0, 0, 0.05)`
- Hover: `0 4px 6px rgba(27, 54, 93, 0.1)`

### PrimeVue Theme
**Configuration** (main.js:98-105):
```javascript
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
})
```

### Tailwind CSS
**Configuration**: `tailwind.config.js`

**Integration**:
- Utility classes for rapid development
- Grid layouts: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Spacing: Tailwind spacing scale
- Responsive breakpoints: sm, md, lg, xl

### Custom SCSS
**File**: `src/assets/styles.scss`

Global styles for:
- PrimeVue component overrides
- Layout utilities
- Custom animations
- Responsive behaviors

### Component-Specific Styling

**Dashboard**:
- `.stat-card`: White background, hover lift effect
- `.card`: Consistent padding, border, shadow
- `:deep()` selectors for chart customization

**SearchCases**:
- `.highlight`: Yellow background `#FEF08A`, bold
- `.result-card`: Hover shadow effect
- `.content-snippet`: Max height 150px, scrollable

**OcrManagement**:
- `.stat-card`: Color-coded backgrounds (blue, yellow, green, red, purple)
- Hover transform: `translateY(-2px)`

---

## Configuration

### Environment Variables
Currently hardcoded in `src/utils/Config.js`:

```javascript
export const Config = {
    API_BASE_URL: 'http://localhost:3000/api/v1'
}
```

**Recommendation**: Use Vite environment variables
```javascript
// .env.development
VITE_API_BASE_URL=http://localhost:3000/api/v1

// .env.production
VITE_API_BASE_URL=https://your-production-url.com/api/v1

// Config.js
export const Config = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL
}
```

### Vite Configuration
**File**: `vite.config.mjs`

```javascript
export default defineConfig({
    optimizeDeps: {
        noDiscovery: true
    },
    plugins: [
        vue(),
        Components({
            resolvers: [PrimeVueResolver()]
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
```

**Features**:
- Auto-import PrimeVue components
- Path alias `@` → `src/`
- Vue plugin integration

### PrimeVue Auto-Import
Components are automatically imported via `unplugin-vue-components`:
- No manual imports needed
- `PrimeVueResolver()` handles component resolution
- Tree-shaking enabled

---

## Development Guide

### Prerequisites
- Node.js 16+ (recommended 18+)
- npm or yarn
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd case-repository-frontend

# Install dependencies
npm install
```

### Development Server

```bash
# Start dev server (default: http://localhost:5173)
npm run dev
```

**Features**:
- Hot Module Replacement (HMR)
- Fast refresh for Vue components
- Instant updates on file save

### Build for Production

```bash
# Create optimized production build
npm run build
```

**Output**: `dist/` directory
- Minified JavaScript/CSS
- Tree-shaken dependencies
- Optimized assets

### Preview Production Build

```bash
# Serve production build locally
npm run preview
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

### Project Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Development Best Practices

### Component Structure
```vue
<script setup>
// 1. Imports
import { ref, onMounted } from 'vue'
import ServiceName from '@/service/ServiceName'

// 2. Reactive state
const data = ref(null)
const loading = ref(false)

// 3. Lifecycle hooks
onMounted(async () => {
    await loadData()
})

// 4. Methods
async function loadData() {
    loading.value = true
    try {
        data.value = await ServiceName.getData()
    } catch (error) {
        console.error('Error:', error)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <!-- Template content -->
</template>

<style scoped>
/* Component-specific styles */
</style>
```

### Service Pattern
```javascript
import axios from 'axios'
import { Config } from '@/utils/Config'

const API_URL = Config.API_BASE_URL

export default {
    async methodName(params) {
        try {
            const response = await axios.get(`${API_URL}/endpoint`, { params })
            return response.data
        } catch (error) {
            console.error('Method error:', error)
            throw error
        }
    }
}
```

### Error Handling
- **Try-catch blocks**: Wrap all async operations
- **User feedback**: Toast notifications for errors
- **Fallback data**: Use mock data when APIs fail
- **Logging**: Console.error for debugging

### Performance Optimization
- **Lazy loading**: Route-based code splitting
- **Auto-refresh**: Clear intervals in `beforeUnmount()`
- **Pagination**: Limit large datasets
- **Debouncing**: Implement for search inputs

---

## Deployment

### Backend API Requirement
Ensure backend is running at configured API URL:
- Development: `http://localhost:3000/api/v1`
- Production: Update `Config.js` or use environment variables

### Backend Endpoints Required

**Search**:
- `GET /api/v1/search?q={query}&limit={limit}&ftWeight={weight}&semWeight={weight}`
- `GET /api/v1/search/full-text?q={query}&limit={limit}`
- `GET /api/v1/search/semantic?q={query}&limit={limit}`

**OCR**:
- `POST /api/v1/ocr/process/pending`
- `POST /api/v1/ocr/process/:documentId`
- `POST /api/v1/ocr/reprocess/:documentId`
- `GET /api/v1/ocr/status/:documentId`
- `GET /api/v1/ocr/queue/stats`
- `GET /api/v1/ocr/queue/jobs`
- `GET /api/v1/ocr/queue/job/:jobId`
- `GET /api/v1/ocr/documents/stats`

**Sync**:
- `POST /api/v1/sync/appeal/:appealId`

**Cases/Dashboard**:
- `GET /api/v1/cases/stats`
- `GET /api/v1/cases`
- `GET /api/v1/cases/:id`
- `GET /api/v1/cases/number/:caseNumber`
- `GET /api/v1/cases/recent`

### Build Steps

```bash
# 1. Install dependencies
npm install

# 2. Update API URL in Config.js
# Edit src/utils/Config.js

# 3. Build production bundle
npm run build

# 4. Deploy dist/ directory
```

### Deployment Targets

**Static Hosting** (Recommended):
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy --prod`
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket
- **GitHub Pages**: Configure workflow for `dist/` deployment

**Server Deployment**:
- **Nginx**: Serve `dist/` directory
- **Apache**: Configure `.htaccess` for SPA routing
- **Docker**: Create Dockerfile with nginx base image

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional)
    location /api/ {
        proxy_pass http://backend-server:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment-Specific Configuration

**Development**:
```javascript
// .env.development
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

**Production**:
```javascript
// .env.production
VITE_API_BASE_URL=https://api.your-domain.com/api/v1
```

**Usage**:
```javascript
// src/utils/Config.js
export const Config = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
}
```

---

## Additional Notes

### Authentication Flow
Currently implemented with localStorage:
1. User logs in via `/login`
2. Tokens stored: `access_token`, `refresh_token`
3. Permissions stored: `permissions` (comma-separated)
4. Menu filtered based on permissions
5. Idle timeout triggers logout

**Recommended Enhancement**:
- Implement route guards
- Add token refresh logic
- Secure token storage (httpOnly cookies)

### Permission System
**Mapping** (AppMenu.vue:6-14):
```javascript
'Manage Bill' → ['Bill']
'Manage Settings' → ['Common Setup', 'Judge', 'Parties', 'Fees', 'User Management']
'Manage Payment' → ['Payment']
'Manage Notice' → ['Notices']
'Manage Statement' → ['Statements']
'Manage Application' → ['Applications']
'Report Manager' → ['Appeal Reports', 'Payment Reports']
```

**Storage Format**:
```
localStorage.permissions = "Manage Bill,Manage Settings,Report Manager"
```

### Mock Data
Services include comprehensive mock data fallbacks:
- **DashboardService**: Full dataset with 7 chairpersons, 1247 cases
- Ensures UI functionality without backend
- Useful for development and testing

### Accessibility
Current implementation lacks:
- ARIA labels
- Keyboard navigation enhancements
- Screen reader support

**Recommendation**:
- Add `aria-label` to buttons and links
- Implement keyboard shortcuts
- Test with screen readers

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features required
- No IE11 support (Vite limitation)

---

## Future Enhancements

### Recommended Features
1. **Advanced Filters**: Date range, case type, outcome filters
2. **Export Functionality**: PDF, Excel export for reports
3. **Case Timeline**: Visual representation of case progression
4. **Document Viewer**: Inline PDF viewer with OCR text overlay
5. **Real-time Notifications**: WebSocket for queue updates
6. **Audit Logs**: Track user actions and changes
7. **Bulk Operations**: Batch OCR processing, bulk case updates
8. **Advanced Analytics**: Predictive analytics, trend forecasting
9. **Mobile App**: React Native or Progressive Web App
10. **Multi-language Support**: i18n for English, Swahili

### Technical Debt
- Implement proper state management (Pinia/Vuex)
- Add comprehensive unit tests (Vitest)
- Implement E2E tests (Playwright/Cypress)
- Type safety with TypeScript
- API response type definitions
- Error boundary components
- Performance monitoring (Sentry)

---

## Contact & Support

### Development Team
- **Project**: TRAB Case Repository Frontend
- **Framework**: Vue 3 + Vite
- **Last Updated**: January 2026

### Documentation Maintenance
This documentation should be updated whenever:
- New features are added
- API endpoints change
- Configuration is modified
- Dependencies are upgraded

---

## License
[Specify your license here]

---

## Changelog

### Version 1.0.0 (January 2026)
- Initial release
- Case search (hybrid, full-text, semantic)
- OCR management dashboard
- TRAIS synchronization
- Analytics dashboard with real-time charts
- User and role management
- Permission-based menu system
- Government enterprise theming
