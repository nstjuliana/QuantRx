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
- `AUTH0_BASE_URL` - Application base URL
- `AUTH0_ISSUER_BASE_URL` - Auth0 issuer URL
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
```

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

This is Phase 0 (Setup) of the QuantRx project. The application infrastructure is complete with:

- ✅ Authentication (Auth0)
- ✅ Database (Supabase with RLS)
- ✅ UI Framework (Material-UI theme)
- ✅ Error handling and loading states

Phase 1 will implement the core calculation features and API integrations.