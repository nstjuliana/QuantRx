# QuantRx - NDC Packaging & Quantity Calculator

NDC Packaging & Quantity Calculator - AI-accelerated tool for matching prescriptions with valid NDCs and calculating correct dispense quantities.

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Auth0 account with application configured
- Supabase project created with database schema

### Local Development

1. **Clone and navigate to the project:**
   ```bash
   cd quantrx
   ```

2. **Install dependencies:**
   ```bash
   npm install
   npm install --save-dev node-fetch  # For integration tests
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your Auth0 and Supabase credentials

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

### Database Setup

Execute the SQL commands in `lib/database-schema.sql` in your Supabase SQL Editor to create the required tables and RLS policies.

### Environment Variables

Required environment variables (see `.env.example`):

- `AUTH0_SECRET` - Auth0 session encryption secret
- `AUTH0_BASE_URL` - Application base URL (e.g., `http://localhost:3000`)
- `AUTH0_ISSUER_BASE_URL` - Auth0 issuer URL (e.g., `https://your-tenant.auth0.com`)
- `AUTH0_CLIENT_ID` - Auth0 application client ID
- `AUTH0_CLIENT_SECRET` - Auth0 application client secret
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Vercel Deployment

1. **Connect Git repository to Vercel**
2. **Configure environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **UI Library:** Material-UI (MUI)
- **Forms:** React Hook Form + Zod validation
- **Authentication:** Auth0
- **Database:** Supabase (PostgreSQL)
- **State Management:** TanStack Query + Context API
- **Deployment:** Vercel

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Format code with Prettier
npm run format

# Test foundation features
npm run test:foundation

# Test deployed app (requires npm run dev to be running)
npm run test:integration
```

## Testing

### Foundation Tests

The `test-core.js` script tests all core calculation logic in isolation:

- ✅ **Schema Validation** - Zod schemas for form validation
- ✅ **SIG Parsing** - Prescription directions parsing
- ✅ **Quantity Calculation** - Dose × frequency × days supply
- ✅ **NDC Matching Algorithm** - Optimal package selection
- ✅ **End-to-End Workflow** - Complete calculation pipeline

**Run the tests:**
```bash
npm run test:foundation
```

Expected output: 5/5 tests passed ✅

### Integration Tests

The `test-integration.js` script tests the deployed application on `localhost:3000`:

- ✅ **Server Health Check** - Verifies dev server is running
- ✅ **RxNorm API** - Tests drug search and normalization endpoints
- ✅ **FDA API** - Tests NDC lookup and validation endpoints
- ✅ **Error Handling** - Tests invalid inputs and error responses
- ✅ **Response Format** - Validates API response structure

**Prerequisites:**
1. Start the dev server: `npm run dev`
2. Run integration tests in another terminal: `npm run test:integration`

**Expected output:** 10/10 tests passed ✅ (when server is running)

**Note:** Integration tests require the application to be running and will fail if the server isn't available.

## Project Structure

```
quantrx/
├── app/                    # Next.js App Router
│   ├── layout.jsx         # Root layout with providers
│   ├── page.jsx           # Home page
│   ├── loading.jsx        # Global loading state
│   ├── error.jsx          # Global error boundary
│   ├── not-found.jsx      # 404 page
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities and business logic
├── contexts/              # React contexts
├── schemas/               # Zod validation schemas
├── theme/                 # Material-UI theme
└── hooks/                 # Custom React hooks
```

## Current Status

**Phase 1 MVP Foundation Complete! 🎉**

The foundation infrastructure is fully implemented and tested:

### ✅ **Foundation & Infrastructure**
- ✅ Type definitions and validation schemas (JSDoc + Zod)
- ✅ Observability & logging infrastructure
- ✅ Database schema with audit logging and RLS policies

### ✅ **API Integrations**
- ✅ RxNorm API integration with mock mode support
- ✅ FDA NDC Directory API integration with mock mode support
- ✅ TanStack Query hooks and caching strategies

### ✅ **Calculation Engine**
- ✅ SIG parsing with regex patterns (extensible for Phase 2 AI)
- ✅ Quantity calculation (dose × frequency × days supply)
- ✅ NDC matching algorithm with tolerance logic
- ✅ Calculation service orchestration layer
- ✅ Comprehensive unit tests and integration tests

### 🚀 **Ready for UI Integration**
Phase 1 continues with UI components (Features 2-17):
- Calculation input forms
- Results display components
- Export functionality
- Role-based access control
- Error handling flows

**Test the foundation:** `npm run test:foundation`

Expected output: 5/5 tests passed ✅