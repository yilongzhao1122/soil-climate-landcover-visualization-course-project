# Open Source Audit

Audit date: 2026-06-09

## Scope

The starting directory contained 19 project files: one static D3 dashboard, processed CSV/JSON/GeoJSON/TopoJSON data, quality-control summaries, method notes, and one PDF report. No Git repository was present at the start of the audit.

## File Decisions

| Original path | Type | Size class | Core | Risk notes | Open-source decision |
|---|---|---:|---:|---|---|
| `index.html` | HTML | small | yes | CDN dependency on D3 | kept at root as main entry |
| `integrated_dashboard.html` | HTML | small | no | duplicate/older entry | moved to `archive/` |
| `integrated_dashboard.js` | JavaScript | small | yes | no sensitive matches | moved to `src/`; paths updated |
| `integrated_dashboard.css` | CSS | small | yes | no sensitive matches | moved to `src/` |
| `grid_soc_tn_cn_0p5deg.csv` | processed CSV | 9.3 MB | yes | third-party derived data | moved to `data/processed/`; license caveat added |
| `group_summary_climate.csv` | aggregate CSV | small | yes | third-party derived data | moved to `data/processed/` |
| `group_summary_landcover.csv` | aggregate CSV | small | yes | third-party derived data | moved to `data/processed/` |
| `group_summary_climate_landcover.csv` | aggregate CSV | small | yes | third-party derived data | moved to `data/processed/` |
| `hierarchy_climate_landcover_coupling.json` | processed JSON | small | yes | third-party derived data | moved to `data/processed/` |
| `world_countries_110m.geojson` | vector data | <1 MB | yes | Natural Earth derived boundary | moved to `data/processed/` |
| `world_countries_110m.topojson` | vector data | <1 MB | no | retained processed boundary | moved to `data/processed/` |
| `README_visualization.md` | documentation | small | yes | older file references | moved to `docs/` |
| `data_dictionary.md` | documentation | small | yes | no sensitive matches | moved to `docs/` |
| `preprocessing_methods.md` | documentation | small | yes | raw-data relative paths only | moved to `docs/` |
| `preprocessing_log.txt` | log | small | yes | no personal absolute paths | moved to `docs/` |
| `d3_usage_guide.md` | documentation | small | yes | no sensitive matches | moved to `docs/` |
| `qc_summary.md` | QC documentation | small | yes | no sensitive matches | moved to `docs/` |
| `qc_group_counts.tsv` | QC TSV | small | yes | no sensitive matches | moved to `docs/` |
| `qc_missing_values.tsv` | QC TSV | small | yes | no sensitive matches | moved to `docs/` |
| `qc_variable_ranges.tsv` | QC TSV | small | yes | no sensitive matches | moved to `docs/` |
| `数据说明.pdf` | PDF report | <1 MB | yes | course report content should be manually reviewed | moved to `reports/` |

## Sensitive Information Scan

Searched for common sensitive patterns:

- API key
- token
- password / passwd
- secret
- cookie
- credential
- private key
- local absolute Windows paths
- project email

No credential-like content was found in the initial text scan. The PDF was not text-extracted during this audit and should receive a manual privacy review before broad publication.

## Large Or Duplicate Files

- Largest file: `data/processed/grid_soc_tn_cn_0p5deg.csv`, approximately 9.3 MB. This is acceptable for a normal GitHub repository.
- No file requires Git LFS based on current sizes.
- `integrated_dashboard.html` was treated as a duplicate/older entry and archived instead of deleted.

## Remaining Manual Checks

- Confirm third-party data redistribution terms for the included processed dataset.
- Confirm the PDF does not contain private course information or unpublished grading details.
- Confirm author contribution details if needed.
