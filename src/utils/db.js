// Connexion Prisma et gestion de la base de données

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.LOG_LEVEL === 'debug' ? ['query', 'error', 'warn'] : ['error']
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Event handlers pour logs
prisma.$on('query', (e) => {
  if (process.env.LOG_LEVEL === 'debug') {
    console.log('Query: ' + e.query);
    console.log('Duration: ' + e.duration + 'ms');
  }
});

export default prisma;
