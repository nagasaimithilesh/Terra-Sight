# TerraSight AI: Satellite-Driven Virtual Agronomist & Precision Irrigation Engine

## Abstract
TerraSight AI is a sophisticated cloud-based "Digital Twin" platform designed to revolutionize modern agriculture. By fusing high-resolution multispectral satellite imagery (Sentinel-2) with hyper-local weather data, the system provides farmers with real-time visibility into soil moisture levels and crop health (NDVI). The core of the platform is a precision irrigation engine that translates complex environmental data into actionable "Watering Prescriptions" in liters, helping reduce water waste by up to 50% while maximizing crop yields through data-driven growth models.

## Project Modules

### 1. Data Schema & Persistence (`shared/schema.ts`)
This module defines the structural "DNA" of the project using a PostgreSQL database.
- **Fields Table:** Stores the physical boundaries, crop types (Maize, Wheat, etc.), and total area of each plot.
- **Health Metrics Table:** Records a time-series of satellite-derived indices (NDVI) and soil moisture percentages.
- **Irrigation Plans Table:** Stores the future watering schedule, calculated in both depth (mm) and volume (Liters).

### 2. The Agronomy API (`server/routes.ts`)
The central nervous system of the project that handles data processing and simulation.
- **Field Management:** Functions to create and retrieve field data.
- **Data Simulation Engine (`simulateDataGeneration`):** A sophisticated function that mimics satellite behavior. It generates 7 days of historical health data and 7 days of future irrigation requirements whenever a new field is added.
- **Precision Logic:** Uses crop-specific coefficients and area-based calculations to determine exactly how many liters of water are required to reach optimal soil saturation.

### 3. Satellite Health Engine (Visualized in `Dashboard`)
This module processes "virtual" multispectral bands to monitor the field.
- **NDVI Monitoring:** Tracks the Normalized Difference Vegetation Index to detect plant stress before it's visible to the human eye.
- **Soil Moisture Analysis:** Estimating volumetric water content to prevent both drought stress and over-watering.

### 4. Interactive Field Mapping (`client/src/components/map-view.tsx`)
A geospatial module that provides a "Top-Down" view of the farm.
- **Polygon Rendering:** Draws the exact boundaries of your fields onto a global map.
- **Auto-Navigation:** Automatically "flies" the camera to the selected field for a detailed inspection.

### 5. Analytics Dashboard (`client/src/pages/dashboard.tsx`)
The user interface that translates "Big Data" into simple decisions.
- **KPI Cards:** Instant readouts of current Health and Moisture.
- **Trend Charts:** Visualizes how your crops are progressing over time using Recharts.
- **Irrigation Scheduler:** A clear list of upcoming water requirements, now displayed in **Liters** for practical application.

## Key Functions Explained

### `simulateDataGeneration(fieldId)`
- **What it does:** Acts as the "Virtual Satellite."
- **How it works:** It calculates the field's area and generates realistic, randomized but scientifically-bounded data for NDVI (0.6 to 0.9) and Soil Moisture (30% to 70%). It then schedules 7 days of irrigation tasks.

### `calculateLiters(waterAmountMm, areaHa)`
- **What it does:** Converts "Rain depth" into "Bucket volume."
- **The Math:** `Liters = Depth(mm) * Area(Hectares) * 10,000`. This ensures that a farmer knows exactly how much water to turn on for their specific field size.

### `MapView.useEffect()`
- **What it does:** Synchronizes the map with user selection.
- **How it works:** Whenever a user selects a field in the dashboard, this function finds the coordinates, calculates the center point, and triggers a smooth "FlyTo" animation to focus the map on that field.

### `useHealthMetrics / useIrrigationPlans`
- **What they do:** Real-time data synchronization.
- **How it works:** These are React Hooks that stay connected to the database. If the satellite data updates on the server, the dashboard automatically refreshes the charts without the user needing to reload the page.
