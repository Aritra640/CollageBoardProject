# Collageboard

A Next.js 16 application with PostgreSQL, Prisma, and better-auth.

## Tech Stack

- **Framework:** Next.js 16.2.2 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL with Prisma 7.6
- **Auth:** better-auth
- **Styling:** Tailwind CSS v4
- **Package Manager:** Bun

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

2. Configure environment variables:
   
   Create a `.env` file with your database connection string:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/collageboard
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Database

Manage the database with Prisma CLI:
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema to database
- `npx prisma migrate dev` - Run migrations
- `npx prisma studio` - Open Prisma Studio

## Project Structure

```
app/                    # Next.js App Router
├── page.tsx           # Route: /
├── layout.tsx         # Root layout
├── globals.css        # Global styles
└── generated/         # Generated Prisma client

prisma/
├── schema.prisma     # Database schema
└── migrations/       # SQL migrations

lib/
├── auth.ts           # Auth configuration
└── prisma.ts        # Prisma client

components/           # React components
types/               # TypeScript types
```