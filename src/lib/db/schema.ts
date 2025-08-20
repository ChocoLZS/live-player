import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const players = sqliteTable('players', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  pId: text('p_id').notNull().unique(),
  description: text('description'),
  url: text('url').notNull(),
  coverUrl: text('cover_url'),
  coverImageR2Key: text('cover_image_r2_key'), // R2 storage key
  announcement: text('announcement'),
  isLive: integer('is_live', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
