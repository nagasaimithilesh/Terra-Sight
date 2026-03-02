import { db } from "./db";
import {
  fields,
  healthMetrics,
  irrigationPlans,
  type InsertField,
  type Field,
  type HealthMetric,
  type IrrigationPlan,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Fields
  getFields(): Promise<Field[]>;
  getField(id: number): Promise<Field | undefined>;
  createField(field: InsertField): Promise<Field>;
  
  // Health Metrics
  getHealthMetricsByField(fieldId: number): Promise<HealthMetric[]>;
  createHealthMetric(metric: Omit<HealthMetric, "id" | "createdAt">): Promise<HealthMetric>;
  
  // Irrigation Plans
  getIrrigationPlansByField(fieldId: number): Promise<IrrigationPlan[]>;
  createIrrigationPlan(plan: Omit<IrrigationPlan, "id" | "createdAt">): Promise<IrrigationPlan>;
}

export class DatabaseStorage implements IStorage {
  async getFields(): Promise<Field[]> {
    return await db.select().from(fields);
  }

  async getField(id: number): Promise<Field | undefined> {
    const [field] = await db.select().from(fields).where(eq(fields.id, id));
    return field;
  }

  async createField(field: InsertField): Promise<Field> {
    const [newField] = await db.insert(fields).values(field).returning();
    return newField;
  }

  async getHealthMetricsByField(fieldId: number): Promise<HealthMetric[]> {
    return await db.select().from(healthMetrics).where(eq(healthMetrics.fieldId, fieldId));
  }

  async createHealthMetric(metric: Omit<HealthMetric, "id" | "createdAt">): Promise<HealthMetric> {
    const [newMetric] = await db.insert(healthMetrics).values(metric as any).returning();
    return newMetric;
  }

  async getIrrigationPlansByField(fieldId: number): Promise<IrrigationPlan[]> {
    return await db.select().from(irrigationPlans).where(eq(irrigationPlans.fieldId, fieldId));
  }

  async createIrrigationPlan(plan: Omit<IrrigationPlan, "id" | "createdAt">): Promise<IrrigationPlan> {
    const [newPlan] = await db.insert(irrigationPlans).values(plan as any).returning();
    return newPlan;
  }
}

export const storage = new DatabaseStorage();
