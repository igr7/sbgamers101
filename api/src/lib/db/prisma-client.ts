import { PrismaClient } from '@prisma/client'
import { log } from '../utils/logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let _prisma: PrismaClient | undefined = undefined

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [{ emit: 'event', level: 'query' }, { emit: 'stdout', level: 'error' }]
        : [{ emit: 'stdout', level: 'error' }],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!_prisma) {
      _prisma = globalForPrisma.prisma || createPrismaClient()
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = _prisma
      }
      
      interface QueryEvent {
        query: string
        duration: number
      }
      _prisma.$on('query' as never, (e: QueryEvent): void => {
        log.debug('Prisma Query', { query: e.query, duration: `${e.duration}ms` })
      })
    }
    return (Reflect.get(_prisma as unknown as Record<string, unknown>, prop))
  },
}) as PrismaClient

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