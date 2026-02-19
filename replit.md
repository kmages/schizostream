# SchizoStream - Crisis Navigation Platform

## Overview

SchizoStream is a mental health crisis navigation platform designed to support families dealing with serious mental illness, particularly schizophrenia and schizoaffective disorder. The application provides tools for document management, care coordination, medication tracking, symptom logging, and AI-powered crisis support chat.

Key features include:
- **The Vault**: Secure document storage for medical records and emergency packets
- **Navigator**: Evidence-based guides on treatment options (especially Clozapine), legal resources, and insurance advocacy
- **Care Team**: Task management and family communication chat
- **Data Logger**: Medication compliance tracking and symptom monitoring with visualizations
- **AI Crisis Chat**: OpenAI-powered support assistant providing hope-focused guidance

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration (teal/slate color palette)
- **Charts**: Recharts for symptom/medication visualizations
- **File Uploads**: Uppy with AWS S3 presigned URL flow
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints defined in shared/routes.ts with Zod validation
- **Authentication**: Replit Auth (OpenID Connect) with Passport.js
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **AI Integration**: OpenAI GPT-4o for crisis support chat responses

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Schema Location**: shared/schema.ts (tables: documents, timelineEvents, tasks, medications, medicationLogs, symptomLogs, chatMessages, users, sessions)

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components including shadcn/ui
    pages/        # Route pages (Dashboard, Vault, Navigator, CareTeam, DataLogger)
    hooks/        # Custom hooks (use-auth, use-resources, use-upload)
    lib/          # Utilities (queryClient, utils)
server/           # Express backend
  replit_integrations/
    auth/         # Replit Auth integration
    object_storage/  # Google Cloud Storage integration
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema
  routes.ts       # API contract definitions
  models/         # Auth models
```

### Build Process
- Development: `tsx server/index.ts` with Vite middleware for HMR
- Production: Custom build script bundles server with esbuild, client with Vite
- Output: `dist/` directory with `index.cjs` (server) and `public/` (client assets)

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via DATABASE_URL environment variable
- **Drizzle ORM**: Schema management and query builder

### Authentication
- **Replit Auth**: OpenID Connect provider (ISSUER_URL, SESSION_SECRET required)
- **Passport.js**: Authentication middleware

### AI Services
- **OpenAI API**: GPT-4o model for crisis support chat (OPENAI_API_KEY required)

### File Storage
- **Google Cloud Storage**: Object storage for document uploads via Replit's sidecar service
- **Uppy**: Client-side file upload handling with presigned URLs

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `OPENAI_API_KEY`: OpenAI API access
- `REPL_ID`: Replit environment identifier (auto-set)
- `ISSUER_URL`: OpenID Connect issuer (defaults to Replit)