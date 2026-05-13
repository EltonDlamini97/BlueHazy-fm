import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const presentersTable = pgTable("presenters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio").notNull(),
  imageUrl: text("image_url"),
  socialInstagram: text("social_instagram"),
  socialTwitter: text("social_twitter"),
  socialFacebook: text("social_facebook"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPresenterSchema = createInsertSchema(presentersTable).omit({ id: true, createdAt: true });
export type InsertPresenter = z.infer<typeof insertPresenterSchema>;
export type Presenter = typeof presentersTable.$inferSelect;
