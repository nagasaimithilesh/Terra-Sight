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

export function useIrrigationPlans(fieldId: number | null) {
  return useQuery({
    queryKey: [api.irrigationPlans.listByField.path, fieldId],
    queryFn: async () => {
      if (!fieldId) return [];
      const url = buildUrl(api.irrigationPlans.listByField.path, { fieldId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch irrigation plans");
      const data = await res.json();
      return parseWithLogging(api.irrigationPlans.listByField.responses[200], data, "irrigation.list");
    },
    enabled: !!fieldId,
  });
}
