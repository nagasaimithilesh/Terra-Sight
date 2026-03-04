import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertFieldSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await seedDatabase();

  app.get(api.fields.list.path, async (req, res) => {
    const fields = await storage.getFields();
    res.json(fields);
  });

  app.get(api.fields.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const field = await storage.getField(id);
    if (!field) {
      return res.status(404).json({ message: "Field not found" });
    }
    res.json(field);
  });

  app.post(api.fields.create.path, async (req, res) => {
    try {
      const input = insertFieldSchema.parse(req.body);
      const field = await storage.createField(input);
      await simulateDataGeneration(field.id);
      res.status(201).json(field);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.healthMetrics.listByField.path, async (req, res) => {
    const fieldId = Number(req.params.fieldId);
    const metrics = await storage.getHealthMetricsByField(fieldId);
    res.json(metrics);
  });

  app.get(api.irrigationPlans.listByField.path, async (req, res) => {
    const fieldId = Number(req.params.fieldId);
    const plans = await storage.getIrrigationPlansByField(fieldId);
    res.json(plans);
  });

  return httpServer;
}

async function simulateDataGeneration(fieldId: number) {
  const now = new Date();
  const field = await storage.getField(fieldId);
  if (!field) return;

  const areaHa = Number(field.area);
  // Liters per 1mm per 1 hectare = 10,000L
  const litersPerMm = areaHa * 10000;

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    await storage.createHealthMetric({
      fieldId,
      date,
      ndviScore: String((0.6 + Math.random() * 0.3).toFixed(2)),
      soilMoisture: String((30 + Math.random() * 40).toFixed(1)),
    });
  }

  for (let i = 1; i <= 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    // Calculate water needed in mm (ETc = Kc * ET0)
    // Simplified: Base 5mm + random weather variation
    const waterNeededMm = 5 + (Math.random() * 10);
    
    await storage.createIrrigationPlan({
      fieldId,
      date,
      waterAmountMm: String(waterNeededMm.toFixed(1)),
      status: "planned",
    });
  }
}

async function seedDatabase() {
  try {
    const existingFields = await storage.getFields();
    if (existingFields.length === 0) {
      const field1 = await storage.createField({
        name: "Punjab Wheat Belt",
        cropType: "Wheat",
        area: "15.0",
        coordinates: [[30.7333, 76.7794], [30.7343, 76.7794], [30.7343, 76.7804], [30.7333, 76.7804]]
      });
      await simulateDataGeneration(field1.id);

      const field2 = await storage.createField({
        name: "Maharashtra Sugarcane",
        cropType: "Sugarcane",
        area: "10.5",
        coordinates: [[18.5204, 73.8567], [18.5214, 73.8567], [18.5214, 73.8577], [18.5204, 73.8577]]
      });
      await simulateDataGeneration(field2.id);

      const field3 = await storage.createField({
        name: "Andhra Paddy Field",
        cropType: "Rice",
        area: "12.2",
        coordinates: [[16.5062, 80.6480], [16.5072, 80.6480], [16.5072, 80.6490], [16.5062, 80.6490]]
      });
      await simulateDataGeneration(field3.id);
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
