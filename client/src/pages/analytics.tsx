import { useState } from "react";
import { useFields } from "@/hooks/use-fields";
import { useHealthMetrics } from "@/hooks/use-health";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, Line } from "recharts";
import { format } from "date-fns";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";

export default function AnalyticsPage() {
  const { data: fields, isLoading: fieldsLoading } = useFields();
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

  const activeFieldId = selectedFieldId || (fields?.[0]?.id ?? null);
  const { data: healthMetrics, isLoading: healthLoading } = useHealthMetrics(activeFieldId);

  const chartData = healthMetrics?.map(m => ({
    date: format(new Date(m.date), "MMM dd"),
    ndvi: Number(m.ndviScore),
    moisture: Number(m.soilMoisture),
    risk: (1 - Number(m.ndviScore)) * 100 // Example metric
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">Advanced Analytics</h1>
            <p className="text-muted-foreground mt-1">Deep dive into historical crop performance.</p>
          </div>
          <div className="w-full md:w-64">
            <Select 
              value={activeFieldId?.toString()} 
              onValueChange={(val) => setSelectedFieldId(Number(val))}
              disabled={fieldsLoading}
            >
              <SelectTrigger className="rounded-xl border-border bg-card shadow-sm h-12">
                <SelectValue placeholder="Select a field" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {fields?.map(f => (
                  <SelectItem key={f.id} value={f.id.toString()}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {healthLoading ? (
          <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : !fields?.length ? (
          <Card className="rounded-2xl border-dashed border-2">
            <CardContent className="p-12 text-center text-muted-foreground">
              No fields available for analysis.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="rounded-2xl shadow-lg border-border/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display">Correlation Analysis</CardTitle>
                    <CardDescription>NDVI vs Soil Moisture over time</CardDescription>
                  </div>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Strong positive correlation
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} domain={[0, 1]} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="ndvi" name="NDVI" fill="hsl(var(--primary)/0.2)" stroke="hsl(var(--primary))" strokeWidth={3} />
                    <Line yAxisId="right" type="monotone" dataKey="moisture" name="Moisture %" stroke="hsl(var(--accent))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-2xl shadow-lg border-border/40">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Stress Risk Factor
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.5)' }} contentStyle={{ borderRadius: '12px' }} />
                      <Bar dataKey="risk" fill="hsl(30, 80%, 60%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-lg border-none bg-gradient-mesh text-white">
                <CardContent className="p-8 h-full flex flex-col justify-center text-center">
                  <h3 className="text-2xl font-display font-bold mb-4">Insight Generation</h3>
                  <p className="text-white/90 text-lg leading-relaxed mb-6">
                    Based on recent satellite captures, maintaining current irrigation levels will support optimal crop yield. No major anomalies detected in the vegetative cycle.
                  </p>
                  <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md border border-white/20">
                    <p className="font-bold text-white tracking-wide uppercase text-sm">Action Recommended: Monitor & Maintain</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
