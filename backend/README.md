# TechAssassin Backend

A serverless Next.js 14 backend application for the TechAssassin hackathon community platform.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Email**: Resend API
- **Testing**: Vitest + fast-check (property-based testing)
- **Deployment**: Vercel

## Project Structure

```
backend/
├── app/
│   ├── api/          # API routes
│   └── ...           # Next.js app files
├── lib/              # Business logic and utilities
├── types/            # TypeScript type definitions
├── .env.local        # Environment variables (not committed)
└── .env.example      # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Resend account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual credentials:
- Supabase URL and keys from your Supabase project settings
- Resend API key from your Resend dashboard

### Development

Run the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

### Testing

Run tests:
```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

### Building

Build for production:
```bash
npm run build
```

## Environment Variables

See `.env.example` for required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-side only)
- `RESEND_API_KEY`: Your Resend API key for sending emails

## API Documentation

API routes are located in `app/api/` and follow RESTful conventions.

## License

MIT
