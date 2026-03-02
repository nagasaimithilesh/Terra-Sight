## Packages
react-leaflet | Map visualization for fields
leaflet | Underlying mapping library
@types/leaflet | TypeScript definitions for Leaflet
date-fns | Date formatting for analytics and schedules
recharts | Data visualization for NDVI and Moisture

## Notes
- Leaflet CSS will be imported in index.css
- Map icons require a workaround for Vite/Webpack which is handled in the map component
- Zod schemas and `api` object are imported from `@shared/routes`
- `buildUrl` is used for dynamic endpoint generation
