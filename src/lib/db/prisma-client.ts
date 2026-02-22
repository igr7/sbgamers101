import { PrismaClient } from '@prisma/client'
import { log } from '../utils/logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [{ emit: 'event', level: 'query' }, { emit: 'stdout', level: 'error' }]
        : [{ emit: 'stdout', level: 'error' }],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

interface QueryEvent {
  query: string
  duration: number
}

prisma.$on('query' as never, (e: QueryEvent): void => {
  log.debug('Prisma Query', { query: e.query, duration: `${e.duration}ms` })
})

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}