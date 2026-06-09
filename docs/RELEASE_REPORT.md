# Release Report

Report date: 2026-06-09

## A. Project Audit Summary

- Total tracked files after organization: 30.
- Total repository working-tree file size before `.git` internals: approximately 10.7 MB.
- Core files: `index.html`, `src/integrated_dashboard.js`, `src/integrated_dashboard.css`, `data/processed/grid_soc_tn_cn_0p5deg.csv`, grouped summary CSVs, hierarchy JSON, and world boundary GeoJSON.
- Excluded by `.gitignore`: raw raster data, downloaded archives, local caches, Python/R/Node dependency folders, OS files, editor folders, logs, temporary files, and likely secret/config files.
- Archived: previous duplicate dashboard entry `archive/integrated_dashboard.html`.
- Added open-source files: `README.md`, `LICENSE`, `AUTHORS.md`, `CITATION.cff`, `DATA_AVAILABILITY.md`, `DATA_LICENSE.md`, `.gitignore`, `package.json`, `docs/OPEN_SOURCE_AUDIT.md`, and this release report.

## B. Data And License Judgment

Included data:

- Processed dashboard grid data and grouped summaries in `data/processed/`.
- Processed world boundary GeoJSON/TopoJSON in `data/processed/`.
- Documentation and QC summaries in `docs/`.

Not included:

- Raw SoilGrids, WorldClim, Koppen-Geiger, MODIS, and Natural Earth source downloads.
- Raster files, shapefile source bundles, archives, local downloads, and caches.

License risk:

- Code is MIT licensed.
- Original project documentation and visual materials are marked CC BY 4.0.
- Third-party source data and derivatives remain subject to source-provider licenses. This is documented in `DATA_LICENSE.md`; provider terms should be manually confirmed before broad redistribution.

## C. Reproducibility

- Main entry file: `index.html`.
- Local run command: `python -m http.server 8765`, then open `http://127.0.0.1:8765/index.html`.
- Dependencies: no local JavaScript build step; D3 v7 is loaded from jsDelivr.
- Data processing method: documented in `docs/preprocessing_methods.md`; the original preprocessing script is not present in this release.
- Path checks: dashboard paths were updated to `src/` and `data/processed/`.
- JS syntax check: `node --check src/integrated_dashboard.js` passed.

## D. GitHub Publication Status

- Recommended repository name: `soil-climate-landcover-visualization`.
- Local branch: `main`.
- Latest local commit: `c9543b4`.
- Push status: not pushed.
- Blocker: GitHub CLI command `gh` is not installed or not available in PATH in the current environment.
- Recommended GitHub Pages setting after push: deploy from the repository root on the `main` branch.

## E. Manual Confirmation Needed

- Install and authenticate GitHub CLI, then create and push the public repository.
- Confirm processed data redistribution terms for all third-party source datasets.
- Manually review `reports/数据说明.pdf` for course-private content before public release.
- Confirm whether author contribution roles should be added.
- Add a dashboard screenshot or demo GIF if desired for the GitHub README.
