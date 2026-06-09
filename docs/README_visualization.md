# D3 Global SOC-TN V2 Dashboard

Final entry point: `index.html`

This folder contains a static D3 v7 dashboard for global topsoil SOC, TN, C:N ratio, SOC-TN coupling classes, climate zones, and land-cover groups.

## How To Run

Start a local static server in this directory:

```bash
python -m http.server 8765
```

Then open:

```text
http://127.0.0.1:8765/index.html
```

Opening the page directly through `file://` can block CSV, GeoJSON, and JSON loading in the browser.

## Implemented Views

- Global map for SOC, TN, C:N, climate zone, and SOC-TN coupling class.
- SOC-TN scatter plot.
- BIO1 x BIO12 climate-space scatter plot.
- Grouped interval plot by climate zone or land-cover group.
- Climate zone x land-cover heatmap.
- Hierarchy icicle view from `hierarchy_climate_landcover_coupling.json`.

## Data And Method Notes

- Land cover uses MODIS MCD12C1 2021 IGBP grouped land-cover classes.
- BIO1 and BIO12 are WorldClim bioclimatic variables representing 1970-2000 long-term climate normals.
- SOC and TN values are based on SoilGrids mean predictions. They are model-based soil property predictions for 0-30 cm topsoil, not annual observations.
- SOC/TN are 0-30 cm thickness-weighted topsoil values.
- C:N = SOC / TN.
- Climate zone is grouped from Koppen-Geiger classes.
- Land cover is grouped from MODIS IGBP classes.
- High / medium / low SOC and TN are relative tercile classes from the project dataset.
- Continuous map colors use the global 2nd-98th percentile domain to reduce the influence of extreme values and preserve cross-filter comparability.
- Scatter axes default to the filtered 1st-99th percentile robust range. A full filtered range option is available.
- SOC, TN, C:N, and BIO12 axes are constrained to non-negative lower bounds where applicable. BIO1 is allowed to be negative.
- Heatmap `weighted_mean_cn_ratio` is recalculated from the currently filtered grid cells and responds to climate, land-cover, coupling-class, and valid-only filters.
- Heatmap `high_soc_low_tn_prop` is area-weighted within each climate x land-cover group and is not conditioned on the coupling-class filter, because conditioning on `high_soc_low_tn` would make the proportion degenerate.
- In grouped interval plots, q25-q75 represents the interquartile range (IQR), i.e. the middle 50% of values in a group.
- All grouped interval plot summary statistics are area-weighted: mean, median, q25, and q75 all use `area_weight`.
- Intermediate or Mixed = grid cells not belonging to the four extreme coupling classes. This category includes intermediate SOC or TN levels and other non-corner combinations.
- Uncertainty fields are retained in the dataset but are not used in the main visualizations because SOC/TN uncertainty layers are incomplete or unavailable.
- SoilGrids Q0.05-Q0.95 is interpreted as a 90% prediction interval. Current processed dashboard data do not include complete cell-level Q0.05-Q0.95 prediction interval fields, so prediction intervals are not displayed as numeric intervals in the main dashboard.
- Reset filters restores climate, land-cover, and coupling filters to `All`, re-checks valid-only filtering, resets scatter axes to robust 1%-99%, and restores the heatmap metric to weighted mean C:N.
- Region comparison is planned but not implemented in this version.
- Export filtered CSV is planned but not implemented in this version.

## Related Files

- `index.html`: final V2 dashboard entry point.
- `integrated_dashboard.js`: main D3 dashboard logic.
- `integrated_dashboard.css`: main dashboard styling.
- `app.js` and `styles.css`: older map-only implementation retained for provenance, not loaded by `index.html`.
- `soc_tn_scatter.html`, `soc_tn_scatter.js`, and `soc_tn_scatter.css`: older standalone scatter view retained for provenance, not loaded by `index.html`.
