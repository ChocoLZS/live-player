import { PrismaClient } from '../generated/prisma';
import { PrismaD1 } from '@prisma/adapter-d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cache } from "react";

const getDb = cache(() => {
   const { env } = getCloudflareContext();
   // @ts-ignore
    const adapter = new PrismaD1(env.DB);
    return new PrismaClient({ adapter });
});
 
// If you need access to `getCloudflareContext` in a static route (i.e. ISR/SSG), you should use the async version of `getCloudflareContext` to get the context.
const getDbAsync = async () => {
  const { env } = await getCloudflareContext({async: true});
  // @ts-ignore
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
};

export { getDb, getDbAsync };
export * from '../generated/prisma';