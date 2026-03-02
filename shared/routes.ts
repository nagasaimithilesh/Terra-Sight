import { z } from 'zod';
import { insertFieldSchema, insertHealthMetricSchema, insertIrrigationPlanSchema, fields, healthMetrics, irrigationPlans } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  fields: {
    list: {
      method: 'GET' as const,
      path: '/api/fields' as const,
      responses: {
        200: z.array(z.custom<typeof fields.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/fields/:id' as const,
      responses: {
        200: z.custom<typeof fields.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/fields' as const,
      input: insertFieldSchema,
      responses: {
        201: z.custom<typeof fields.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  healthMetrics: {
    listByField: {
      method: 'GET' as const,
      path: '/api/fields/:fieldId/health' as const,
      responses: {
        200: z.array(z.custom<typeof healthMetrics.$inferSelect>()),
      },
    },
  },
  irrigationPlans: {
    listByField: {
      method: 'GET' as const,
      path: '/api/fields/:fieldId/irrigation' as const,
      responses: {
        200: z.array(z.custom<typeof irrigationPlans.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type FieldResponse = z.infer<typeof api.fields.create.responses[201]>;
export type FieldsListResponse = z.infer<typeof api.fields.list.responses[200]>;
export type HealthMetricsListResponse = z.infer<typeof api.healthMetrics.listByField.responses[200]>;
export type IrrigationPlansListResponse = z.infer<typeof api.irrigationPlans.listByField.responses[200]>;
