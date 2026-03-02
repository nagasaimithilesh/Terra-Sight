import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFieldSchema, type InsertField } from "@shared/schema";
import { useCreateField } from "@/hooks/use-fields";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Plus, Loader2 } from "lucide-react";

// Extend schema for the form to handle raw text input for coordinates
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  cropType: z.string().min(2, "Select a crop type."),
  area: z.coerce.number().positive("Area must be positive."),
  coordinatesRaw: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) && parsed.length >= 3;
    } catch {
      return false;
    }
  }, "Must be valid JSON array of [lat, lng] points (minimum 3 for a polygon)."),
});

type FormValues = z.infer<typeof formSchema>;

export function AddFieldDialog() {
  const [open, setOpen] = useState(false);
  const createField = useCreateField();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cropType: "",
      area: 0,
      coordinatesRaw: "[\n  [36.7783, -119.4179],\n  [36.7783, -119.4000],\n  [36.7600, -119.4000],\n  [36.7600, -119.4179]\n]",
    },
  });

  const onSubmit = (values: FormValues) => {
    const fieldData: InsertField = {
      name: values.name,
      cropType: values.cropType,
      area: values.area.toString(), // DB expects string/numeric
      coordinates: JSON.parse(values.coordinatesRaw),
    };
    
    createField.mutate(fieldData, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Map New Field
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        <div className="bg-gradient-mesh p-6 text-white">
          <DialogTitle className="text-2xl font-display text-white">Map New Field</DialogTitle>
          <DialogDescription className="text-white/80 mt-1">
            Enter field parameters and boundary coordinates to begin satellite monitoring.
          </DialogDescription>
        </div>
        
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. North Valley Sector A" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cropType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select crop" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Maize">Maize</SelectItem>
                          <SelectItem value="Wheat">Wheat</SelectItem>
                          <SelectItem value="Tomatoes">Tomatoes</SelectItem>
                          <SelectItem value="Soybeans">Soybeans</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area (Hectares)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="coordinatesRaw"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Boundary Coordinates (JSON)
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        className="font-mono text-xs rounded-xl h-32 bg-muted/50 border-border/50" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a valid JSON array of [latitude, longitude] pairs.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="rounded-xl"
                  disabled={createField.isPending}
                >
                  {createField.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing
                    </>
                  ) : "Initialize Monitoring"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
