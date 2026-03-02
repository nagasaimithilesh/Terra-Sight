import { pgTable, text, serial, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fields = pgTable("fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cropType: text("crop_type").notNull(),
  coordinates: jsonb("coordinates").notNull(), // array of [lat, lng] or similar structure
  area: numeric("area").notNull(), // in hectares
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  fieldId: serial("field_id").references(() => fields.id),
  date: timestamp("date").notNull(),
  ndviScore: numeric("ndvi_score").notNull(), // 0.0 to 1.0
  soilMoisture: numeric("soil_moisture").notNull(), // percentage
  createdAt: timestamp("created_at").defaultNow(),
});

export const irrigationPlans = pgTable("irrigation_plans", {
  id: serial("id").primaryKey(),
  fieldId: serial("field_id").references(() => fields.id),
  date: timestamp("date").notNull(),
  waterAmountMm: numeric("water_amount_mm").notNull(),
  status: text("status").notNull().default("planned"), // planned, applied
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFieldSchema = createInsertSchema(fields).omit({ id: true, createdAt: true });
export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({ id: true, createdAt: true });
export const insertIrrigationPlanSchema = createInsertSchema(irrigationPlans).omit({ id: true, createdAt: true });

export type Field = typeof fields.$inferSelect;
export type InsertField = z.infer<typeof insertFieldSchema>;
export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;
export type IrrigationPlan = typeof irrigationPlans.$inferSelect;
export type InsertIrrigationPlan = z.infer<typeof insertIrrigationPlanSchema>;

export type CreateFieldRequest = InsertField;
export type UpdateFieldRequest = Partial<InsertField>;
