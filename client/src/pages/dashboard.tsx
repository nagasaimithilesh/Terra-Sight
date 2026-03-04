import { useState } from "react";
import { useFields } from "@/hooks/use-fields";
import { useHealthMetrics } from "@/hooks/use-health";
import { useIrrigationPlans } from "@/hooks/use-irrigation";
import { MapView } from "@/components/map-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Droplets, Maximize, Calendar, Activity, AlertTriangle, Loader2 } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from "recharts";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: fields, isLoading: fieldsLoading } = useFields();
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

  // Auto-select first field if none selected
  const activeFieldId = selectedFieldId || (fields?.[0]?.id ?? null);
  const activeField = fields?.find(f => f.id === activeFieldId);

  const { data: healthMetrics, isLoading: healthLoading } = useHealthMetrics(activeFieldId);
  const { data: irrigationPlans, isLoading: irrigationLoading } = useIrrigationPlans(activeFieldId);

  if (fieldsLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Activity className="w-12 h-12 text-primary" />
          <p className="text-muted-foreground font-medium text-lg">Acquiring satellite imagery...</p>
        </div>
      </div>
    );
  }

  if (!fields || fields.length === 0) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto mt-20 text-center space-y-6">
          <div className="bg-primary/10 w-24 h-24 mx-auto rounded-full flex items-center justify-center">
            <Leaf className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-bold">Welcome to TerraSight AI</h2>
          <p className="text-muted-foreground text-lg">
            You don't have any fields mapped yet. Head over to the Fields tab to draw your first plot and begin satellite monitoring.
          </p>
        </div>
      </div>
    );
  }

  // Format data for charts
  const chartData = healthMetrics?.map(m => ({
    date: format(new Date(m.date), "MMM dd"),
    ndvi: Number(m.ndviScore),
    moisture: Number(m.soilMoisture),
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  const latestHealth = healthMetrics?.[0];
  const nextIrrigation = irrigationPlans?.filter(p => p.status === 'planned')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">Agronomy Dashboard</h1>
            <p className="text-muted-foreground mt-1">Satellite-driven insights & precision irrigation.</p>
          </div>
          <div className="w-full md:w-64">
            <Select 
              value={activeFieldId?.toString()} 
              onValueChange={(val) => setSelectedFieldId(Number(val))}
            >
              <SelectTrigger className="rounded-xl border-border bg-card shadow-sm h-12">
                <SelectValue placeholder="Select a field" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {fields.map(f => (
                  <SelectItem key={f.id} value={f.id.toString()}>
                    {f.name} ({f.cropType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl border-none shadow-lg shadow-primary/5 bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="bg-primary/15 p-4 rounded-2xl text-primary">
                <Leaf className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current NDVI</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-display font-bold mt-1">
                    {latestHealth ? Number(latestHealth.ndviScore).toFixed(2) : "—"}
                  </h3>
                  <span className="text-sm text-green-600 font-medium">Excellent</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-lg shadow-blue-500/5 bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="bg-blue-500/15 p-4 rounded-2xl text-blue-600">
                <Droplets className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Soil Moisture</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-display font-bold mt-1">
                    {latestHealth ? Number(latestHealth.soilMoisture).toFixed(1) : "—"}%
                  </h3>
                  <span className="text-sm text-amber-500 font-medium">-2%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-lg shadow-amber-500/5 bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="bg-amber-500/15 p-4 rounded-2xl text-amber-600">
                <Maximize className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Area</p>
                <h3 className="text-4xl font-display font-bold mt-1 text-foreground">
                  {activeField ? Number(activeField.area).toFixed(1) : "—"}
                  <span className="text-xl text-muted-foreground ml-1">ha</span>
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map & Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 rounded-2xl shadow-lg border-border/40 overflow-hidden flex flex-col">
            <CardHeader className="bg-card border-b border-border/40 pb-4">
              <CardTitle className="font-display">Field Sector Map</CardTitle>
              <CardDescription>Satellite view with multi-spectral overlay</CardDescription>
            </CardHeader>
            <div className="flex-1 p-0 relative">
              <MapView 
                fields={fields} 
                selectedFieldId={activeFieldId} 
                onFieldClick={setSelectedFieldId}
                height="400px"
              />
            </div>
          </Card>

          <Card className="rounded-2xl shadow-lg border-border/40 bg-card flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display">Irrigation Plan</CardTitle>
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-2 py-1 rounded-full font-bold">
                  Next 7 Days
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto">
              {irrigationLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : irrigationPlans?.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground">No plans scheduled.</div>
              ) : (
                irrigationPlans?.slice(0, 5).map(plan => {
                  const litersPerMm = Number(activeField.area) * 10000;
                  const waterLiters = Number(plan.waterAmountMm) * litersPerMm;
                  
                  return (
                    <div key={plan.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted/80 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${plan.status === 'applied' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          <Droplets className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{format(new Date(plan.date), "EEE, MMM d")}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className={plan.status === 'applied' ? 'text-green-600' : 'text-amber-500'}>
                              • {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-lg text-blue-600">
                          {waterLiters >= 1000 ? `${(waterLiters / 1000).toFixed(1)}k` : Math.round(waterLiters)}
                        </p>
                        <p className="text-xs text-muted-foreground font-semibold">Liters</p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-lg border-border/40">
            <CardHeader>
              <CardTitle className="font-display">NDVI Health Index</CardTitle>
              <CardDescription>Vegetation vigor over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {healthLoading ? (
                 <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 1]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="ndvi" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorNdvi)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-border/40">
            <CardHeader>
              <CardTitle className="font-display">Soil Moisture Tracking</CardTitle>
              <CardDescription>Volumetric water content percentage</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {healthLoading ? (
                 <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Line type="monotone" dataKey="moisture" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
