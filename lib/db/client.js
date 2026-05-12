import { PrismaClient } from '@prisma/client'

// Singleton pattern required for Next.js: hot reloads in dev create new module
// instances on every file change, spawning multiple PrismaClient connections.
// Neon's free tier caps concurrent connections — exceeding it causes request
// failures. Storing the client on globalThis survives hot reloads.
const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
