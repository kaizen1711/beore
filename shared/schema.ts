import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  publicUrl: text("public_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertUploadSchema = createInsertSchema(uploads).omit({
  id: true,
  uploadedAt: true,
});

export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type Upload = typeof uploads.$inferSelect;

// File upload request schema
export const fileUploadSchema = z.object({
  files: z.array(z.any()).max(3, "Maksimal 3 file"),
  urls: z.array(z.string().url()).optional(),
});

export type FileUploadRequest = z.infer<typeof fileUploadSchema>;
