import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { type Field } from "@shared/schema";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet icons in standard bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  fields: Field[];
  selectedFieldId?: number | null;
  onFieldClick?: (id: number) => void;
  height?: string;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export function MapView({ fields, selectedFieldId, onFieldClick, height = "400px" }: MapViewProps) {
  // Default to somewhere agricultural (e.g., Central Valley CA)
  const defaultCenter: [number, number] = [36.7783, -119.4179];
  const [center, setCenter] = useState<[number, number]>(defaultCenter);
  const [zoom, setZoom] = useState(6);

  useEffect(() => {
    if (selectedFieldId && fields.length > 0) {
      const selected = fields.find(f => f.id === selectedFieldId);
      if (selected && selected.coordinates && Array.isArray(selected.coordinates) && selected.coordinates.length > 0) {
        // Simple center calculation: take the first coordinate
        const firstCoord = selected.coordinates[0] as [number, number];
        if (Array.isArray(firstCoord) && firstCoord.length === 2) {
          setCenter(firstCoord);
          setZoom(14);
        }
      }
    } else if (fields.length > 0) {
      const firstCoord = fields[0].coordinates[0] as [number, number];
      if (Array.isArray(firstCoord) && firstCoord.length === 2) {
        setCenter(firstCoord);
        setZoom(10);
      }
    }
  }, [selectedFieldId, fields]);

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden shadow-inner border border-border/50 bg-muted/20">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-light"
        />
        <MapController center={center} zoom={zoom} />
        
        {fields.map((field) => {
          const isSelected = field.id === selectedFieldId;
          const coords = field.coordinates as [number, number][];
          
          if (!coords || !Array.isArray(coords) || coords.length === 0) return null;

          return (
            <Polygon
              key={field.id}
              positions={coords}
              pathOptions={{
                color: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.5)',
                fillColor: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.2)',
                fillOpacity: isSelected ? 0.4 : 0.2,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onFieldClick?.(field.id)
              }}
            >
              <Popup className="rounded-xl">
                <div className="p-1">
                  <h4 className="font-display font-bold text-sm">{field.name}</h4>
                  <p className="text-xs text-muted-foreground">{field.cropType} • {Number(field.area).toFixed(1)} ha</p>
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
}
