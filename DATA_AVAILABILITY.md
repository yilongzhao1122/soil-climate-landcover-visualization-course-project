# Data Availability

## Summary

The repository includes processed dashboard-ready data so that the static visualization can be viewed after cloning. It does not include the original raw raster or shapefile source datasets.

## Included In This Repository

| File | Type | Included | Notes |
|---|---:|---:|---|
| `data/processed/grid_soc_tn_cn_0p5deg.csv` | processed grid CSV | yes | 0.5 degree dashboard grid with SOC, TN, C:N, climate, land cover, and coupling fields. |
| `data/processed/group_summary_climate.csv` | aggregate CSV | yes | Area-weighted climate-zone summaries. |
| `data/processed/group_summary_landcover.csv` | aggregate CSV | yes | Area-weighted land-cover summaries. |
| `data/processed/group_summary_climate_landcover.csv` | aggregate CSV | yes | Area-weighted climate by land-cover summaries. |
| `data/processed/hierarchy_climate_landcover_coupling.json` | processed JSON | yes | Hierarchy data for the D3 icicle view. |
| `data/processed/world_countries_110m.geojson` | vector boundary | yes | Dashboard world boundary layer. |
| `data/processed/world_countries_110m.topojson` | vector boundary | yes | Retained processed TopoJSON boundary file. |

## Not Included

Raw source data are not included because they are large, externally maintained, and governed by their own licenses:

- SoilGrids SOC and nitrogen rasters.
- WorldClim bioclimatic raster files.
- Koppen-Geiger present-day climate classification raster.
- MODIS MCD12C1 2021 IGBP land-cover raster.
- Natural Earth source shapefiles.

## Source Dataset Overview

The preprocessing notes identify these source datasets:

- SoilGrids SOC and nitrogen mean predictions for 0-5, 5-15, and 15-30 cm layers.
- SoilGrids SOC quantile files where available; uncertainty data were incomplete in the local processing record.
- WorldClim v2.1 BIO1, BIO4, BIO12, and BIO15 variables.
- Koppen-Geiger present-day climate classes.
- MODIS MCD12C1 2021 IGBP land cover.
- Natural Earth 110m admin 0 country boundaries.

## Rebuild Guidance

To rebuild the dashboard data:

1. Download the raw datasets from their official providers.
2. Place them in a local `raw_data/` directory using the paths documented in `docs/preprocessing_methods.md`.
3. Reproduce the 0.5 degree grid matching, resampling, unit conversion, area weighting, classification, and aggregation described in `docs/preprocessing_methods.md`.
4. Write outputs to `data/processed/` using the filenames expected by `src/integrated_dashboard.js`.

The original preprocessing script is not present in this release, so the method documentation should be treated as the reproducibility record unless the script is later restored.
