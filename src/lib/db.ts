import { PrismaClient } from '../generated/prisma';
import { PrismaD1 } from '@prisma/adapter-d1';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (typeof globalThis !== 'undefined' && globalThis.DB) {
  // Cloudflare Workers environment
  const adapter = new PrismaD1(globalThis.DB);
  prisma = new PrismaClient({ adapter });
} else if (process.env.NODE_ENV === 'production') {
  // Production environment without Cloudflare
  prisma = new PrismaClient();
} else {
  // Development environment - 使用本地 SQLite 文件
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

export { prisma };
export * from '../generated/prisma';