# AGENTS.md - Collageboard Development Guide

<!-- BEGIN:nextjs-agent-rules -->
This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Build / Lint / Test Commands

```bash
# Development
npm run dev              # Start Next.js dev server

# Production
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint on entire codebase

# Database
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma migrate dev  # Run migrations
```

## Tech Stack

- **Framework:** Next.js 16.2.2 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL with Prisma 7.6
- **Auth:** better-auth
- **Styling:** Tailwind CSS v4

## Code Style Guidelines

### Imports

```typescript
// Absolute imports using @ alias (mapped to root)
import { SomeModule } from "@/components/SomeModule";
import { AnotherModule } from "@/lib/another";

// Type imports first, then implementations
import type { User, Post } from "@/types";
import { formatUser, createPost } from "@/lib/utils";

// Group imports: external, then internal, then relative
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import "./styles.css";
```

### Formatting

- Use Prettier for code formatting (integrated via ESLint)
- 2 spaces for indentation
- Single quotes for strings (unless containing single quotes)
- Trailing commas on multiline objects/arrays
- No semicolons at end of statements

### Types

- Always use explicit return types for functions:
  ```typescript
  function getUser(id: string): Promise<User | null> { ... }
  ```
- Use `interface` for object shapes, `type` for unions/primitives
- Avoid `any` - use `unknown` when type is truly unknown
- Use `null` rather than `undefined` for optional values

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `UserData` |
| Files (components) | PascalCase | `Button.tsx` |
| Files (utilities) | camelCase | `utils.ts` |

### Error Handling

- Use custom error classes for domain errors:
  ```typescript
  class AuthError extends Error {
    constructor(message: string, public code: string) {
      super(message);
      this.name = "AuthError";
    }
  }
  ```
- Always log errors in production with appropriate context
- Return user-friendly error messages in API routes
- Use try/catch with async/await, avoid empty catch blocks

### Component Patterns

- Use function components with explicit prop types:
  ```typescript
  interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  }

  export function Button({ label, onClick, variant = "primary" }: ButtonProps) {
    return <button onClick={onClick}>{label}</button>;
  }
  ```
- Server components by default (no "use client" unless needed)
- Extract client logic into separate hooks/components

### Next.js 16 Specific

- Use the App Router (`app/` directory)
- Route handlers in `app/api/*/route.ts`
- Server actions in `app/actions/*`
- Server components render by default
- Use `use client` directive only when needing hooks/event handlers

### Database / Prisma

- Generated client is in `app/generated/prisma/`
- Schema in `prisma/schema.prisma`
- Run `npx prisma generate` after schema changes
- Use transactions for multi-step operations

### ESLint Configuration

The project uses `eslint-config-next/core-web-vitals` + TypeScript rules.
Key rules enforced:
- No unused variables
- Strict TypeScript checking
- React hooks exhaustive deps
- Prefer const over let

Run `npm run lint` before committing.

### File Organization

```
app/                    # Next.js App Router
├── page.tsx           # Route: /
├── layout.tsx         # Root layout
├── globals.css        # Global styles
├── api/              # API routes
│   └── [resource]/
│       └── route.ts
└── actions/          # Server actions

prisma/
├── schema.prisma     # Database schema
└── migrations/       # SQL migrations

app/generated/        # Generated code (do not edit)
└── prisma/          # Prisma client

lib/                  # Utilities and helpers
components/           # React components
types/               # TypeScript types
```

### Environment Variables

- Required: `DATABASE_URL` (PostgreSQL connection string)
- Use `.env` file for local development (already in .gitignore)
- Never commit secrets to repository

### Pre-commit Checklist

Before committing:
1. Run `npm run lint` - fix any errors
2. Run `npm run build` - ensure build succeeds
3. Verify no console.log statements in production code
4. Check all new dependencies are necessary
