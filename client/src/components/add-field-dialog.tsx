import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFieldSchema, type InsertField } from "@shared/schema";
import { useCreateField } from "@/hooks/use-fields";
import { MapContainer, TileLayer, Polygon, useMapEvents, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Plus, Loader2, Trash2, MousePointer2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  cropType: z.string().min(2, "Select a crop type."),
  area: z.coerce.number().positive("Area must be positive."),
});

type FormValues = z.infer<typeof formSchema>;

function DrawingMap({ onPointsChange }: { onPointsChange: (points: [number, number][]) => void }) {
  const [points, setPoints] = useState<[number, number][]>([]);

  useMapEvents({
    click(e) {
      const newPoints: [number, number][] = [...points, [e.latlng.lat, e.latlng.lng]];
      setPoints(newPoints);
      onPointsChange(newPoints);
    },
  });

  return (
    <>
      <TileLayer
        attribution='&copy; Google Maps'
        url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
      />
      {points.length > 0 && points.length < 3 && points.map((p, i) => (
        <Marker key={i} position={p} />
      ))}
      {points.length >= 3 && (
        <Polygon 
          positions={points} 
          pathOptions={{ color: 'hsl(var(--primary))', fillColor: 'hsl(var(--primary))', fillOpacity: 0.4 }} 
        />
      )}
    </>
  );
}

export function AddFieldDialog() {
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState<[number, number][]>([]);
  const createField = useCreateField();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cropType: "",
      area: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    if (points.length < 3) {
      return;
    }

    const fieldData: InsertField = {
      name: values.name,
      cropType: values.cropType,
      area: values.area.toString(),
      coordinates: points,
    };
    
    createField.mutate(fieldData, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        setPoints([]);
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
      <DialogContent className="sm:max-w-[800px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="bg-gradient-mesh p-6 text-white shrink-0">
          <DialogTitle className="text-2xl font-display text-white">Map New Field</DialogTitle>
          <DialogDescription className="text-white/80 mt-1">
            Click on the map to mark the boundary points of your field. Minimum 3 points required.
          </DialogDescription>
        </div>
        
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 h-[300px] md:h-auto relative bg-muted/20 border-r border-border/50">
            <MapContainer 
              center={[20.5937, 78.9629]} 
              zoom={5} 
              style={{ height: "100%", width: "100%" }}
              className="z-0"
            >
              <DrawingMap onPointsChange={setPoints} />
            </MapContainer>
            
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <Button 
                size="sm" 
                variant="destructive" 
                className="rounded-lg shadow-lg"
                onClick={() => setPoints([])}
                disabled={points.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Points
              </Button>
              <div className="bg-background/90 backdrop-blur-sm p-3 rounded-xl border border-border shadow-lg text-xs font-semibold flex items-center gap-2">
                <MousePointer2 className="w-4 h-4 text-primary" />
                <span>{points.length} points marked</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-[320px] p-6 overflow-y-auto bg-card">
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
                          <SelectItem value="Rice">Rice</SelectItem>
                          <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                          <SelectItem value="Tomatoes">Tomatoes</SelectItem>
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

                {points.length < 3 && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Please mark at least 3 points on the map.</span>
                  </div>
                )}

                <div className="pt-4 flex flex-col gap-2">
                  <Button 
                    type="submit" 
                    className="rounded-xl w-full"
                    disabled={createField.isPending || points.length < 3}
                  >
                    {createField.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing
                      </>
                    ) : "Initialize Monitoring"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setOpen(false)}
                    className="rounded-xl w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
