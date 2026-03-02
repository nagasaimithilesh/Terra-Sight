import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertField, type Field } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useFields() {
  return useQuery({
    queryKey: [api.fields.list.path],
    queryFn: async () => {
      const res = await fetch(api.fields.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch fields");
      const data = await res.json();
      return parseWithLogging(api.fields.list.responses[200], data, "fields.list");
    },
  });
}

export function useField(id: number | null) {
  return useQuery({
    queryKey: [api.fields.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.fields.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch field");
      const data = await res.json();
      return parseWithLogging(api.fields.get.responses[200], data, "fields.get");
    },
    enabled: !!id,
  });
}

export function useCreateField() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertField) => {
      const res = await fetch(api.fields.create.path, {
        method: api.fields.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Validation failed");
        }
        throw new Error("Failed to create field");
      }
      return parseWithLogging(api.fields.create.responses[201], await res.json(), "fields.create");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.fields.list.path] });
      toast({
        title: "Field Added",
        description: "New field has been successfully mapped.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
