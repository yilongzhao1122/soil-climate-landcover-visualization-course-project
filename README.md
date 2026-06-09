# Global Soil Carbon, Nitrogen and Climate-Land Cover Visualization

## 全球土壤碳氮与气候-土地覆盖可视化项目

This repository contains a static D3 dashboard for a data visualization course project. It explores global topsoil soil organic carbon (SOC), total nitrogen (TN), C:N ratio, climate zones, land-cover groups, and SOC-TN coupling classes.

The main dashboard is available from `index.html` and is designed to work as a GitHub Pages static site.

## Research And Visualization Questions

- How are topsoil SOC, TN, and C:N ratio distributed globally?
- How do SOC-TN coupling classes vary across climate zones and land-cover groups?
- Which climate-land-cover combinations show high SOC / low TN or other contrasting coupling patterns?
- How can spatial maps, scatter plots, interval plots, heatmaps, and hierarchy views support comparative interpretation?

## Data Sources

The processed dashboard data are derived from third-party geospatial datasets documented in `docs/preprocessing_methods.md`:

- SoilGrids SOC and nitrogen mean predictions for 0-30 cm topsoil.
- WorldClim v2.1 bioclimatic variables, including BIO1 and BIO12 climate normals for 1970-2000.
- Koppen-Geiger present-day climate classes.
- MODIS MCD12C1 2021 IGBP land cover.
- Natural Earth 110m country boundaries.

See `DATA_AVAILABILITY.md` and `DATA_LICENSE.md` before redistributing or reusing the processed data.

## Processing Overview

The available project documentation records the following workflow:

- Convert SoilGrids SOC and TN units to g/kg.
- Compute 0-30 cm thickness-weighted topsoil values from 0-5, 5-15, and 15-30 cm layers.
- Compute C:N as `soc_gkg / tn_gkg`.
- Align datasets to a 0.5 degree EPSG:4326 global grid.
- Resample continuous climate variables by averaging and categorical climate / land-cover layers by majority or mode.
- Group Koppen-Geiger classes into major climate zones.
- Group MODIS IGBP classes into dashboard-friendly land-cover categories.
- Compute area-weighted grouped summaries using `cos(latitude)` as an approximate area weight.
- Classify SOC and TN into relative low / medium / high levels and derive SOC-TN coupling classes.

Uncertainty fields are retained where available, but the dashboard documentation notes incomplete SOC/TN quantile layers, so uncertainty intervals are not visualized as complete cell-level prediction intervals.

## Project Structure

```text
.
├── index.html
├── src/
│   ├── integrated_dashboard.css
│   └── integrated_dashboard.js
├── data/
│   └── processed/
├── docs/
├── reports/
├── archive/
├── AUTHORS.md
├── CITATION.cff
├── DATA_AVAILABILITY.md
├── DATA_LICENSE.md
├── LICENSE
└── README.md
```

## Run The Dashboard

Because the dashboard loads CSV, GeoJSON, and JSON files, use a local static server instead of opening the HTML file through `file://`.

```bash
python -m http.server 8765
```

Then open:

```text
http://127.0.0.1:8765/index.html
```

The page imports D3 v7 from jsDelivr, so an internet connection is needed unless the D3 library is vendored locally.

## Main Files

- `index.html`: GitHub Pages-compatible dashboard entry point.
- `src/integrated_dashboard.js`: D3 data loading, filtering, map, scatter, interval, heatmap, and hierarchy logic.
- `src/integrated_dashboard.css`: dashboard layout and styling.
- `data/processed/grid_soc_tn_cn_0p5deg.csv`: processed 0.5 degree grid data used by the dashboard.
- `data/processed/group_summary_*.csv`: area-weighted grouped summaries.
- `data/processed/hierarchy_climate_landcover_coupling.json`: hierarchy data for the icicle view.
- `data/processed/world_countries_110m.geojson`: world map base layer used by the dashboard.
- `docs/`: data dictionary, preprocessing notes, quality-control summaries, and D3 usage notes.
- `reports/数据说明.pdf`: original course/report data description.
- `archive/integrated_dashboard.html`: previous duplicate dashboard entry retained for provenance.

## Reproducibility

The repository includes processed dashboard data and documentation for the preprocessing workflow. It does not include the original raw raster datasets. To rebuild the processed data from scratch, obtain the raw datasets listed in `DATA_AVAILABILITY.md`, then follow the documented preprocessing steps in `docs/preprocessing_methods.md`.

No package installation is required to view the static dashboard beyond a local static server and browser. Python is only used in the example above to serve files locally.

## Authors

- 赵艺隆 / Yilong Zhao
- 程楷倢 / Kaijie Cheng
- 韦彦浩 / Yanhao Wei

## License And Citation

Code in this repository is released under the MIT License. Original documentation and project-created visual materials are released under CC BY 4.0. Third-party source data remain governed by their original licenses and terms. See `LICENSE`, `DATA_LICENSE.md`, and `CITATION.cff`.

## Acknowledgements

This project uses public global environmental datasets from SoilGrids, WorldClim, Koppen-Geiger climate classification resources, MODIS land-cover products, and Natural Earth boundaries. It was prepared as a data visualization course group project.

