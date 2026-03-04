import { useState } from "react";
import { useFields } from "@/hooks/use-fields";
import { AddFieldDialog } from "@/components/add-field-dialog";
import { MapView } from "@/components/map-view";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map as MapIcon, Loader2, Wheat, TreeDeciduous, Sprout } from "lucide-react";
import { format } from "date-fns";

export default function FieldsPage() {
  const { data: fields, isLoading } = useFields();
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

  const getCropIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'wheat': return <Wheat className="w-5 h-5" />;
      case 'maize': return <TreeDeciduous className="w-5 h-5" />;
      case 'tomatoes': return <Sprout className="w-5 h-5 text-red-500" />;
      default: return <Sprout className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-background">
      
      {/* Left Sidebar List */}
      <div className="w-full md:w-[400px] h-1/2 md:h-full border-r border-b md:border-b-0 border-border/50 flex flex-col bg-card/30">
        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-card">
          <div>
            <h2 className="text-2xl font-display font-bold">Fields</h2>
            <p className="text-sm text-muted-foreground">{fields?.length || 0} active plots</p>
          </div>
          <AddFieldDialog />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : fields?.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
              <MapIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No fields mapped yet.</p>
            </div>
          ) : (
            fields?.map(field => (
              <Card 
                key={field.id}
                className={`
                  cursor-pointer transition-all duration-200 border-2 rounded-2xl
                  ${selectedFieldId === field.id 
                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                    : 'border-border/50 hover:border-primary/30 hover:shadow-lg'
                  }
                `}
                onClick={() => setSelectedFieldId(field.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${selectedFieldId === field.id ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {getCropIcon(field.cropType)}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-base">{field.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          {field.cropType} <span className="w-1 h-1 rounded-full bg-border" /> {Number(field.area).toFixed(1)} ha
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Added {field.createdAt ? format(new Date(field.createdAt), "MMM d, yyyy") : 'Unknown'}</span>
                    <Badge variant="secondary" className="font-semibold shadow-none rounded-lg bg-secondary text-secondary-foreground">
                      Monitored
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Right Map Area */}
      <div className="flex-1 h-1/2 md:h-full relative bg-muted/20">
        {!isLoading && fields && (
          <MapView 
            fields={fields} 
            selectedFieldId={selectedFieldId} 
            onFieldClick={setSelectedFieldId}
            height="100%"
          />
        )}
        
        {/* Decorative Overlay for Map Empty State */}
        {!isLoading && fields?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
            <div className="bg-card p-8 rounded-3xl shadow-2xl text-center max-w-sm border border-border">
              <MapIcon className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold mb-2">Map Viewer</h3>
              <p className="text-muted-foreground mb-6">Draw your first field to see it rendered on the satellite base map.</p>
              <AddFieldDialog />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
