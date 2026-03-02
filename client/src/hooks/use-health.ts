import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useHealthMetrics(fieldId: number | null) {
  return useQuery({
    queryKey: [api.healthMetrics.listByField.path, fieldId],
    queryFn: async () => {
      if (!fieldId) return [];
      const url = buildUrl(api.healthMetrics.listByField.path, { fieldId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch health metrics");
      const data = await res.json();
      
      // We must handle z.coerce.date() in our schemas if they are dates, 
      // but if the manifest schema handles strings or coercion we're good.
      // Assuming the schema correctly maps the timestamps.
      return parseWithLogging(api.healthMetrics.listByField.responses[200], data, "health.list");
    },
    enabled: !!fieldId,
  });
}
