const DATA_PATHS = {
  grid: "./data/processed/grid_soc_tn_cn_0p5deg.csv",
  world: "./data/processed/world_countries_110m.geojson",
  combo: "./data/processed/group_summary_climate_landcover.csv",
  hierarchy: "./data/processed/hierarchy_climate_landcover_coupling.json",
};

const LABELS = {
  high_soc_high_tn: "High SOC / High TN",
  high_soc_low_tn: "High SOC / Low TN",
  low_soc_high_tn: "Low SOC / High TN",
  low_soc_low_tn: "Low SOC / Low TN",
  medium_or_mixed: "Intermediate or Mixed",
};

const MEDIUM_OR_MIXED_NOTE =
  "Intermediate or Mixed = grid cells not belonging to the four extreme coupling classes. This category includes intermediate SOC or TN levels and other non-corner combinations.";

const ORDERS = {
  climate_zone: ["Tropical", "Arid", "Temperate", "Cold", "Polar", "Unclassified"],
  landcover_major: [
    "Forest",
    "Shrubland",
    "Savanna",
    "Grassland",
    "Wetland",
    "Cropland",
    "Urban",
    "Snow/Ice",
    "Barren",
    "Water",
    "Other",
  ],
  coupling_class: [
    "high_soc_high_tn",
    "high_soc_low_tn",
    "low_soc_high_tn",
    "low_soc_low_tn",
    "medium_or_mixed",
  ],
};

const PALETTES = {
  climate_zone: new Map([
    ["Tropical", "#1b9e77"],
    ["Arid", "#d8902e"],
    ["Temperate", "#4e79a7"],
    ["Cold", "#8e63b8"],
    ["Polar", "#77b7c5"],
    ["Unclassified", "#8e9692"],
  ]),
  landcover_major: new Map([
    ["Forest", "#2f7d32"],
    ["Shrubland", "#8f7f3d"],
    ["Savanna", "#c89b32"],
    ["Grassland", "#70ad47"],
    ["Wetland", "#2b8cbe"],
    ["Cropland", "#d6b656"],
    ["Urban", "#7b6d8d"],
    ["Snow/Ice", "#b9dce7"],
    ["Barren", "#c77743"],
    ["Water", "#4a90c2"],
    ["Other", "#9da39f"],
  ]),
  coupling_class: new Map([
    ["high_soc_high_tn", "#2166ac"],
    ["high_soc_low_tn", "#b2182b"],
    ["low_soc_high_tn", "#ef8a62"],
    ["low_soc_low_tn", "#67a9cf"],
    ["medium_or_mixed", "#7f7f7f"],
  ]),
};

const METRICS = {
  soc_gkg: { label: "SOC", mean: "weighted_mean_soc_gkg", median: "median_soc_gkg", unit: "g/kg" },
  tn_gkg: { label: "TN", mean: "weighted_mean_tn_gkg", median: "median_tn_gkg", unit: "g/kg" },
  cn_ratio: { label: "C:N", mean: "weighted_mean_cn_ratio", median: "median_cn_ratio", unit: "" },
};

const CONTINUOUS_PALETTES = {
  soc_gkg: d3.interpolateYlGnBu,
  tn_gkg: d3.interpolatePuBuGn,
  cn_ratio: d3.interpolateMagma,
  weighted_mean_cn_ratio: d3.interpolateYlOrRd,
  high_soc_low_tn_prop: d3.interpolatePuBuGn,
};

const dom = {
  categorySelect: document.querySelector("#categorySelect"),
  climateFilter: document.querySelector("#climateFilter"),
  landcoverFilter: document.querySelector("#landcoverFilter"),
  couplingFilter: document.querySelector("#couplingFilter"),
  validOnly: document.querySelector("#validOnly"),
  resetFilters: document.querySelector("#resetFilters"),
  lonMin: document.querySelector("#lonMin"),
  lonMax: document.querySelector("#lonMax"),
  latMin: document.querySelector("#latMin"),
  latMax: document.querySelector("#latMax"),
  applyRegion: document.querySelector("#applyRegion"),
  clearRegion: document.querySelector("#clearRegion"),
  regionStatus: document.querySelector("#regionStatus"),
  mapRegionStatus: document.querySelector("#mapRegionStatus"),
  regionError: document.querySelector("#regionError"),
  mapMetric: document.querySelector("#mapMetric"),
  scatterMode: document.querySelector("#scatterMode"),
  scatterColor: document.querySelector("#scatterColor"),
  boxMetric: document.querySelector("#boxMetric"),
  boxGroup: document.querySelector("#boxGroup"),
  showErrorRange: document.querySelector("#showErrorRange"),
  heatMetric: document.querySelector("#heatMetric"),
  axisRange: document.querySelector("#axisRange"),
  viewKicker: document.querySelector("#viewKicker"),
  viewTitle: document.querySelector("#viewTitle"),
  viewSubtitle: document.querySelector("#viewSubtitle"),
  summaryPanel: document.querySelector("#summaryPanel"),
  detailPanel: document.querySelector("#detailPanel"),
  tooltip: document.querySelector("#tooltip"),
  mapStage: document.querySelector(".map-stage"),
  mapCanvas: document.querySelector("#mapCanvas"),
  mapSvg: d3.select("#mapSvg"),
  countryLayer: d3.select("#countryLayer"),
  bboxLayer: d3.select("#bboxLayer"),
  mapLoading: document.querySelector("#mapLoading"),
  mapLegend: document.querySelector("#mapLegend"),
  zoomIn: document.querySelector("#zoomIn"),
  zoomOut: document.querySelector("#zoomOut"),
  zoomToRegion: document.querySelector("#zoomToRegion"),
  resetZoom: document.querySelector("#resetZoom"),
  scatterChart: document.querySelector("#scatterChart"),
  scatterLegend: document.querySelector("#scatterLegend"),
  boxplotChart: document.querySelector("#boxplotChart"),
  boxplotLegend: document.querySelector("#boxplotLegend"),
  heatmapChart: document.querySelector("#heatmapChart"),
  heatmapLegend: document.querySelector("#heatmapLegend"),
  hierarchyChart: document.querySelector("#hierarchyChart"),
  hierarchyLegend: document.querySelector("#hierarchyLegend"),
};

const panels = {
  spatial: document.querySelector("#spatialPanel"),
  scatter: document.querySelector("#scatterPanel"),
  boxplot: document.querySelector("#boxplotPanel"),
  heatmap: document.querySelector("#heatmapPanel"),
  hierarchy: document.querySelector("#hierarchyPanel"),
};

const state = {
  grid: [],
  world: null,
  combo: [],
  hierarchy: null,
  filtered: [],
  selectedCell: null,
  mapPointTree: null,
  width: 0,
  height: 0,
  projection: d3.geoNaturalEarth1(),
  mapTransform: d3.zoomIdentity,
  region: null,
};

const mapCtx = dom.mapCanvas.getContext("2d");
const zoomBehavior = d3
  .zoom()
  .scaleExtent([1, 8])
  .on("zoom", (event) => {
    state.mapTransform = event.transform;
    if (dom.categorySelect.value === "spatial") renderMap();
  });

initCollapsibleSections();
initEvents();
loadData();

function initCollapsibleSections() {
  document.querySelectorAll(".sidebar .control-section").forEach((section, index) => {
    const heading = [...section.children].find((child) => child.tagName === "H2");
    if (!heading) return;

    const title = heading.textContent.trim() || `Section ${index + 1}`;
    const body = document.createElement("div");
    body.className = "control-section-body";
    body.id = `control-section-body-${index + 1}`;

    while (heading.nextSibling) body.appendChild(heading.nextSibling);

    const header = document.createElement("div");
    header.className = "control-section-header";

    const toggle = document.createElement("button");
    toggle.className = "control-section-toggle";
    toggle.type = "button";
    toggle.title = `Collapse ${title}`;
    toggle.setAttribute("aria-controls", body.id);
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", `Collapse ${title}`);

    header.append(heading, toggle);
    section.append(header, body);
    section.classList.add("is-collapsible");

    toggle.addEventListener("click", () => {
      const collapsed = !section.classList.contains("is-collapsed");
      const action = collapsed ? "Expand" : "Collapse";
      section.classList.toggle("is-collapsed", collapsed);
      body.hidden = collapsed;
      toggle.title = `${action} ${title}`;
      toggle.setAttribute("aria-expanded", String(!collapsed));
      toggle.setAttribute("aria-label", `${action} ${title}`);
    });
  });
}

async function loadData() {
  try {
    const [grid, world, combo, hierarchy] = await Promise.all([
      d3.csv(DATA_PATHS.grid, d3.autoType),
      d3.json(DATA_PATHS.world),
      d3.csv(DATA_PATHS.combo, d3.autoType),
      d3.json(DATA_PATHS.hierarchy),
    ]);
    state.grid = grid.map(normalizeGridRow).filter((row) => Number.isFinite(row.soc_gkg) && Number.isFinite(row.tn_gkg));
    state.world = world;
    state.combo = combo.map(normalizeComboRow);
    state.hierarchy = hierarchy;
    populateFilters();
    dom.mapLoading.classList.add("is-hidden");
    resizeMap();
    render();
  } catch (error) {
    dom.viewSubtitle.textContent = `Data loading failed: ${error.message}`;
    dom.summaryPanel.textContent = "Unable to load source data.";
    console.error(error);
  }
}

function initEvents() {
  [
    dom.categorySelect,
    dom.climateFilter,
    dom.landcoverFilter,
    dom.couplingFilter,
    dom.validOnly,
    dom.mapMetric,
    dom.scatterMode,
    dom.scatterColor,
    dom.boxMetric,
    dom.boxGroup,
    dom.showErrorRange,
    dom.heatMetric,
    dom.axisRange,
  ].forEach((control) => control.addEventListener("change", render));

  dom.mapStage.addEventListener("pointermove", handleMapPointerMove);
  dom.mapStage.addEventListener("pointerleave", hideTooltip);
  dom.mapStage.addEventListener("click", pinMapCell);
  dom.resetFilters.addEventListener("click", resetFilters);
  dom.applyRegion.addEventListener("click", applyRegion);
  dom.clearRegion.addEventListener("click", clearRegion);
  dom.zoomIn.addEventListener("click", () => d3.select(dom.mapStage).transition().duration(160).call(zoomBehavior.scaleBy, 1.35));
  dom.zoomOut.addEventListener("click", () => d3.select(dom.mapStage).transition().duration(160).call(zoomBehavior.scaleBy, 0.75));
  dom.zoomToRegion.addEventListener("click", zoomToRegion);
  dom.resetZoom.addEventListener("click", resetMapZoom);
  [dom.zoomIn, dom.zoomOut, dom.zoomToRegion, dom.resetZoom].forEach((button) => {
    button.addEventListener("pointerdown", (event) => event.stopPropagation());
    button.addEventListener("click", (event) => event.stopPropagation());
  });
  d3.select(dom.mapStage).call(zoomBehavior);

  new ResizeObserver(() => {
    resizeMap();
    renderCurrentPanel();
  }).observe(dom.mapStage);
  window.addEventListener("resize", debounce(renderCurrentPanel, 140));
}

function normalizeGridRow(row) {
  return {
    ...row,
    climate_zone: normalizeCategory(row.climate_zone),
    landcover_major: normalizeCategory(row.landcover_major),
    coupling_class: row.coupling_class || "medium_or_mixed",
    valid_flag: Number(row.valid_flag || 0),
    possible_outlier: Number(row.possible_outlier || 0),
  };
}

function normalizeComboRow(row) {
  return {
    ...row,
    climate_zone: normalizeCategory(row.climate_zone),
    landcover_major: normalizeCategory(row.landcover_major),
    dominant_coupling_class: row.dominant_coupling_class || "medium_or_mixed",
  };
}

function normalizeCategory(value) {
  return value == null || value === "" ? "Unclassified" : String(value);
}

function populateFilters() {
  populateSelect(dom.climateFilter, uniqueOrdered(state.grid.map((row) => row.climate_zone), ORDERS.climate_zone), "All climate zones");
  populateSelect(dom.landcoverFilter, uniqueOrdered(state.grid.map((row) => row.landcover_major), ORDERS.landcover_major), "All land cover classes");
  populateSelect(
    dom.couplingFilter,
    uniqueOrdered(state.grid.map((row) => row.coupling_class), ORDERS.coupling_class),
    "All coupling classes",
    labelCategory,
  );
}

function populateSelect(select, values, allLabel, labeler = (value) => value) {
  select.innerHTML = "";
  select.append(new Option(allLabel, "all"));
  for (const value of values) select.append(new Option(labeler(value), value));
}

function uniqueOrdered(values, order = []) {
  const set = new Set(values.filter((value) => value !== ""));
  return [...order.filter((value) => set.has(value)), ...[...set].filter((value) => !order.includes(value)).sort(d3.ascending)];
}

function render() {
  if (!state.grid.length) return;
  const category = dom.categorySelect.value;
  for (const [key, panel] of Object.entries(panels)) panel.hidden = key !== category;
  document.querySelectorAll(".panel-controls").forEach((section) => {
    section.hidden = section.dataset.controls !== category;
  });
  state.filtered = getFilteredRows();
  renderRegionStatus();
  renderSummary();
  renderDetailPanel();
  renderHeader(category);
  renderCurrentPanel();
}

function resetFilters() {
  dom.climateFilter.value = "all";
  dom.landcoverFilter.value = "all";
  dom.couplingFilter.value = "all";
  dom.validOnly.checked = true;
  if (dom.axisRange) dom.axisRange.value = "robust";
  if (dom.heatMetric) dom.heatMetric.value = "weighted_mean_cn_ratio";
  clearRegionInputs();
  state.selectedCell = null;
  render();
}

function renderCurrentPanel() {
  if (!state.grid.length) return;
  const category = dom.categorySelect.value;
  if (category === "spatial") renderMap();
  if (category === "scatter") renderScatter();
  if (category === "boxplot") renderBoxplot();
  if (category === "heatmap") renderHeatmap();
  if (category === "hierarchy") renderHierarchy();
}

function getFilteredRows() {
  return state.grid.filter((row) => {
    if (dom.validOnly.checked && row.valid_flag !== 1) return false;
    if (dom.climateFilter.value !== "all" && row.climate_zone !== dom.climateFilter.value) return false;
    if (dom.landcoverFilter.value !== "all" && row.landcover_major !== dom.landcoverFilter.value) return false;
    if (dom.couplingFilter.value !== "all" && row.coupling_class !== dom.couplingFilter.value) return false;
    if (state.region && !rowInRegion(row, state.region)) return false;
    return true;
  });
}

function renderHeader(category) {
  const headers = {
    spatial: ["Spatial Distribution", "Spatial Distribution Maps", "Map-based SOC, TN, C:N, climate zone, and coupling patterns."],
    scatter: ["Scatter Plots", "SOC-TN and Climate Space Scatter Plots", "Explore SOC-TN relationships and BIO1 x BIO12 climate-space modulation."],
    boxplot: ["Grouped Interval Plot", "Grouped SOC, TN, and C:N Interval Plot", "Circle = area-weighted mean; diamond = median; line = q25-q75."],
    heatmap: ["Heatmaps", "Climate Zone x Land Cover Heatmap", "Compare C:N or high-SOC-low-TN proportions across climate and landcover combinations."],
    hierarchy: ["Hierarchy", "Climate, Land Cover, and Coupling Icicle", "Area-weighted hierarchy from climate zone to land cover to SOC-TN coupling class."],
  };
  const [kicker, title, subtitle] = headers[category];
  dom.viewKicker.textContent = kicker;
  dom.viewTitle.textContent = title;
  dom.viewSubtitle.textContent = subtitle;
}

function renderSummary() {
  const rows = getSummaryRows();
  const isSpatial = dom.categorySelect.value === "spatial";
  const totalFiltered = state.filtered.length;
  if (!rows.length) {
    dom.summaryPanel.innerHTML = `
      <div class="summary-stat"><span>Grid cells</span><strong>0</strong></div>
      <div class="summary-note">${summaryEmptyMessage(totalFiltered)}</div>
      ${state.region && !state.filtered.length ? `<div class="summary-note">No grid cells fall within the selected region.</div>` : ""}
    `;
    return;
  }
  const baseSummary = `
    <div class="summary-stat"><span>Grid cells</span><strong>${formatCount(rows.length)}</strong></div>
    <div class="summary-stat"><span>Mean SOC</span><strong>${formatNumber(d3.mean(rows, (row) => row.soc_gkg))} g/kg</strong></div>
    <div class="summary-stat"><span>Mean TN</span><strong>${formatNumber(d3.mean(rows, (row) => row.tn_gkg))} g/kg</strong></div>
    <div class="summary-stat"><span>Mean C:N</span><strong>${formatNumber(d3.mean(rows, (row) => row.cn_ratio))}</strong></div>
    <div class="summary-note">${summaryScopeNote(isSpatial, rows.length, totalFiltered)}</div>
  `;
  dom.summaryPanel.innerHTML = state.region ? `${baseSummary}${regionComparisonHtml(state.filtered)}` : baseSummary;
}

function getSummaryRows() {
  if (dom.categorySelect.value !== "spatial") return state.filtered;
  return getVisibleMapRows(state.filtered);
}

function getVisibleMapRows(rows) {
  if (!state.width || !state.height) return rows;
  const margin = 2;
  return rows.filter((row) => {
    if (!Number.isFinite(row.px) || !Number.isFinite(row.py)) return false;
    const x = state.mapTransform.applyX(row.px);
    const y = state.mapTransform.applyY(row.py);
    return x >= -margin && x <= state.width + margin && y >= -margin && y <= state.height + margin;
  });
}

function renderDetailPanel() {
  if (!dom.detailPanel) return;
  if (!state.selectedCell) {
    dom.detailPanel.innerHTML = `<div class="summary-note">Hover for tooltips or click a map/scatter point to pin grid-cell details.</div>`;
    return;
  }
  dom.detailPanel.innerHTML = `<div class="detail-grid">${cellDetailHtml(state.selectedCell)}</div>`;
}

function resizeMap() {
  const rect = dom.mapStage.getBoundingClientRect();
  if (!rect.width || !rect.height || !state.world) return;
  state.width = rect.width;
  state.height = rect.height;
  dom.mapSvg.attr("viewBox", `0 0 ${state.width} ${state.height}`);
  const dpr = window.devicePixelRatio || 1;
  dom.mapCanvas.width = Math.round(state.width * dpr);
  dom.mapCanvas.height = Math.round(state.height * dpr);
  state.projection = d3.geoNaturalEarth1().fitExtent(
    [
      [18, 18],
      [state.width - 18, state.height - 18],
    ],
    state.world,
  );
  const path = d3.geoPath(state.projection);
  dom.countryLayer.selectAll("path").data(state.world.features).join("path").attr("d", path);
  drawBbox();
  for (const row of state.grid) {
    const point = state.projection([row.lon, row.lat]);
    row.px = point ? point[0] : NaN;
    row.py = point ? point[1] : NaN;
  }
}

function renderMap() {
  const rows = state.filtered;
  const metric = dom.mapMetric.value;
  const dpr = window.devicePixelRatio || 1;
  mapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  mapCtx.clearRect(0, 0, state.width, state.height);
  dom.countryLayer.attr("transform", state.mapTransform.toString());
  dom.bboxLayer.attr("transform", state.mapTransform.toString());
  if (!rows.length) {
    state.mapPointTree = null;
    dom.mapLoading.textContent = emptyMessage();
    dom.mapLoading.classList.remove("is-hidden");
    dom.mapLegend.innerHTML = "";
    drawBbox();
    return;
  }
  dom.mapLoading.classList.add("is-hidden");
  const color = makeMapColor(metric, rows);
  mapCtx.save();
  mapCtx.translate(state.mapTransform.x, state.mapTransform.y);
  mapCtx.scale(state.mapTransform.k, state.mapTransform.k);
  for (const row of rows) {
    if (!Number.isFinite(row.px) || !Number.isFinite(row.py)) continue;
    mapCtx.fillStyle = color(row);
    mapCtx.globalAlpha = metric === "coupling_class" || metric === "climate_zone" ? 0.72 : 0.86;
    mapCtx.fillRect(row.px - 1.3, row.py - 1.3, 2.6, 2.6);
  }
  mapCtx.restore();
  mapCtx.globalAlpha = 1;
  state.mapPointTree = d3
    .quadtree()
    .x((row) => state.mapTransform.applyX(row.px))
    .y((row) => state.mapTransform.applyY(row.py))
    .addAll(rows.filter((row) => Number.isFinite(row.px) && Number.isFinite(row.py)));
  renderMapLegend(metric, rows, color);
  drawBbox();
  renderSummary();
}

function makeMapColor(metric, rows) {
  if (metric === "coupling_class" || metric === "climate_zone") {
    const palette = PALETTES[metric];
    return (row) => palette.get(row[metric]) || "#9da39f";
  }
  const values = state.grid.map((row) => row[metric]).filter(Number.isFinite).sort(d3.ascending);
  const domain = [d3.quantile(values, 0.02) || 0, d3.quantile(values, 0.98) || 1];
  const interpolator = CONTINUOUS_PALETTES[metric] || d3.interpolateViridis;
  const scale = d3.scaleSequential(interpolator).domain(domain).clamp(true);
  return (row) => scale(row[metric]);
}

function renderMapLegend(metric, rows, color) {
  if (metric === "coupling_class" || metric === "climate_zone") {
    renderCategoryLegend(dom.mapLegend, rows, metric, color);
    return;
  }
  const values = rows.map((row) => row[metric]).filter(Number.isFinite).sort(d3.ascending);
  const globalValues = state.grid.map((row) => row[metric]).filter(Number.isFinite).sort(d3.ascending);
  const min = d3.quantile(globalValues, 0.02) || 0;
  const max = d3.quantile(globalValues, 0.98) || 1;
  renderRampLegend(
    dom.mapLegend,
    `${METRICS[metric].label} ${METRICS[metric].unit}`.trim(),
    CONTINUOUS_PALETTES[metric],
    min,
    max,
    formatNumber,
    "Continuous map colors use the global 2nd-98th percentile range to reduce the influence of extreme values. Legend ranges are computed globally for cross-filter comparability.",
  );
}

function handleMapPointerMove(event) {
  if (dom.categorySelect.value !== "spatial" || !state.mapPointTree) return;
  const [x, y] = d3.pointer(event, dom.mapStage);
  const row = state.mapPointTree.find(x, y, 14);
  if (!row) {
    hideTooltip();
    return;
  }
  showMapTooltip(event, row);
}

function showMapTooltip(event, row) {
  showTooltip(event, cellTooltipHtml(row));
}

function pinMapCell(event) {
  if (dom.categorySelect.value !== "spatial" || !state.mapPointTree) return;
  const [x, y] = d3.pointer(event, dom.mapStage);
  const row = state.mapPointTree.find(x, y, 14);
  if (!row) return;
  state.selectedCell = row;
  renderDetailPanel();
}

function resetMapZoom() {
  d3.select(dom.mapStage).transition().duration(180).call(zoomBehavior.transform, d3.zoomIdentity);
}

function zoomToRegion() {
  if (!state.region || !state.projection || !state.width || !state.height) return;
  const points = bboxCoordinates(state.region)
    .map((coord) => state.projection(coord))
    .filter((point) => point && Number.isFinite(point[0]) && Number.isFinite(point[1]));
  if (!points.length) return;
  const xExtent = d3.extent(points, (point) => point[0]);
  const yExtent = d3.extent(points, (point) => point[1]);
  const dx = Math.max(1, xExtent[1] - xExtent[0]);
  const dy = Math.max(1, yExtent[1] - yExtent[0]);
  const padding = 48;
  const scale = Math.max(1, Math.min(8, 0.92 * Math.min((state.width - padding * 2) / dx, (state.height - padding * 2) / dy)));
  const cx = (xExtent[0] + xExtent[1]) / 2;
  const cy = (yExtent[0] + yExtent[1]) / 2;
  const transform = d3.zoomIdentity.translate(state.width / 2 - scale * cx, state.height / 2 - scale * cy).scale(scale);
  d3.select(dom.mapStage).transition().duration(260).call(zoomBehavior.transform, transform);
}

function applyRegion() {
  const parsed = parseRegionInputs();
  if (!parsed.ok) {
    showRegionError(parsed.message);
    return;
  }
  state.region = parsed.region;
  hideRegionError();
  state.selectedCell = null;
  render();
}

function clearRegion() {
  clearRegionInputs();
  state.selectedCell = null;
  render();
}

function clearRegionInputs() {
  state.region = null;
  [dom.lonMin, dom.lonMax, dom.latMin, dom.latMax].forEach((input) => {
    input.value = "";
  });
  hideRegionError();
}

function parseRegionInputs() {
  const raw = {
    lonMin: dom.lonMin.value.trim(),
    lonMax: dom.lonMax.value.trim(),
    latMin: dom.latMin.value.trim(),
    latMax: dom.latMax.value.trim(),
  };
  if (Object.values(raw).some((value) => value === "")) {
    return { ok: false, message: "Please enter lon min, lon max, lat min, and lat max." };
  }
  const region = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Number(value)]));
  if (Object.values(region).some((value) => !Number.isFinite(value))) {
    return { ok: false, message: "Region bounds must be numeric." };
  }
  if (region.lonMin < -180 || region.lonMax > 180) return { ok: false, message: "Longitude bounds must be between -180 and 180." };
  if (region.latMin < -90 || region.latMax > 90) return { ok: false, message: "Latitude bounds must be between -90 and 90." };
  if (region.lonMin > region.lonMax) return { ok: false, message: "Lon min must be less than or equal to lon max." };
  if (region.latMin > region.latMax) return { ok: false, message: "Lat min must be less than or equal to lat max." };
  return { ok: true, region };
}

function rowInRegion(row, region) {
  return row.lon >= region.lonMin && row.lon <= region.lonMax && row.lat >= region.latMin && row.lat <= region.latMax;
}

function renderRegionStatus() {
  const hasRegion = Boolean(state.region);
  dom.zoomToRegion.disabled = !hasRegion;
  if (!state.region) {
    dom.regionStatus.textContent = "Region: Global";
    dom.mapRegionStatus.textContent = "Region: Global";
    return;
  }
  const status = `Selected region: Lon [${formatNumber(state.region.lonMin)}, ${formatNumber(state.region.lonMax)}], Lat [${formatNumber(state.region.latMin)}, ${formatNumber(state.region.latMax)}]`;
  dom.regionStatus.textContent = status;
  dom.mapRegionStatus.textContent = status;
}

function showRegionError(message) {
  dom.regionError.textContent = message;
  dom.regionError.hidden = false;
}

function hideRegionError() {
  dom.regionError.textContent = "";
  dom.regionError.hidden = true;
}

function drawBbox() {
  if (!state.region || !state.projection) {
    dom.bboxLayer.selectAll("path").remove();
    return;
  }
  const bboxGeo = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: bboxCoordinates(state.region),
    },
  };
  const path = d3.geoPath(state.projection);
  dom.bboxLayer.selectAll("path").data([bboxGeo]).join("path").attr("class", "bbox-region").attr("d", path);
}

function bboxCoordinates(region) {
  const { lonMin, lonMax, latMin, latMax } = region;
  const step = Math.max(0.5, Math.min(2, Math.min(Math.abs(lonMax - lonMin), Math.abs(latMax - latMin)) / 8 || 1));
  const coords = [];
  for (let lon = lonMin; lon <= lonMax; lon += step) coords.push([Math.min(lon, lonMax), latMin]);
  for (let lat = latMin + step; lat <= latMax; lat += step) coords.push([lonMax, Math.min(lat, latMax)]);
  for (let lon = lonMax - step; lon >= lonMin; lon -= step) coords.push([Math.max(lon, lonMin), latMax]);
  for (let lat = latMax - step; lat >= latMin; lat -= step) coords.push([lonMin, Math.max(lat, latMin)]);
  coords.push([lonMin, latMin]);
  return coords;
}

function regionComparisonHtml(regionRows) {
  const globalRows = state.grid.filter((row) => row.valid_flag === 1);
  const regionStats = weightedStats(regionRows);
  const globalStats = weightedStats(globalRows);
  return `
    <div class="region-comparison">
      <div class="summary-note">${dom.regionStatus.textContent} Global baseline uses all valid global grid cells and is not affected by climate, land-cover, coupling, or region filters.</div>
      ${comparisonTable(regionStats, globalStats)}
      <div class="comparison-grid">
        ${categoryBlock("Selected region dominant classes", regionStats)}
        ${categoryBlock("Global baseline dominant classes", globalStats)}
      </div>
    </div>
  `;
}

function categoryBlock(title, stats) {
  return `
    <div class="comparison-card">
      <strong>${title}</strong>
      <span>Climate: ${labelCategory(stats.climate)}</span>
      <span>Land cover: ${labelCategory(stats.landcover)}</span>
      <span>Coupling: ${labelCategory(stats.coupling)}</span>
    </div>
  `;
}

function comparisonTable(regionStats, globalStats) {
  return `
    <table class="comparison-table">
      <thead>
        <tr><th>Metric</th><th>Selected region</th><th>Global baseline</th><th>Difference</th></tr>
      </thead>
      <tbody>
        ${comparisonRow("Grid cells", regionStats.n, globalStats.n, "", true)}
        ${comparisonRow("Mean SOC", regionStats.soc, globalStats.soc, "g/kg")}
        ${comparisonRow("Mean TN", regionStats.tn, globalStats.tn, "g/kg")}
        ${comparisonRow("Mean C:N", regionStats.cn, globalStats.cn, "")}
      </tbody>
    </table>
  `;
}

function comparisonRow(label, selected, baseline, unit, count = false) {
  const diff = selected - baseline;
  const pct = Number.isFinite(baseline) && baseline !== 0 ? diff / baseline : NaN;
  const valueFormat = count ? formatCount : formatNumber;
  const diffValue = count ? d3.format("+,")(diff || 0) : formatSigned(diff);
  return `
    <tr>
      <td>${label}</td>
      <td>${valueFormat(selected)}${unit ? ` ${unit}` : ""}</td>
      <td>${valueFormat(baseline)}${unit ? ` ${unit}` : ""}</td>
      <td>${diffValue}${unit ? ` ${unit}` : ""} (${formatSignedPercent(pct)})</td>
    </tr>
  `;
}

function weightedStats(rows) {
  return {
    n: rows.length,
    soc: weightedMean(rows, "soc_gkg"),
    tn: weightedMean(rows, "tn_gkg"),
    cn: weightedMean(rows, "cn_ratio"),
    climate: dominantValue(rows, "climate_zone"),
    landcover: dominantValue(rows, "landcover_major"),
    coupling: dominantValue(rows, "coupling_class"),
  };
}

function renderScatter() {
  const mode = dom.scatterMode.value;
  const colorField = dom.scatterColor.value;
  const rows = state.filtered.filter((row) => {
    if (mode === "soc_tn") return Number.isFinite(row.soc_gkg) && Number.isFinite(row.tn_gkg);
    return Number.isFinite(row.bio1) && Number.isFinite(row.bio12);
  });
  const xField = mode === "soc_tn" ? "soc_gkg" : "bio1";
  const yField = mode === "soc_tn" ? "tn_gkg" : "bio12";
  const xLabel = mode === "soc_tn" ? "SOC, Soil Organic Carbon (g/kg)" : "BIO1 Annual Mean Temperature (°C)";
  const yLabel = mode === "soc_tn" ? "TN, Total Nitrogen (g/kg)" : "BIO12 Annual Precipitation (mm)";
  if (!rows.length) {
    renderEmptyChart(dom.scatterChart);
    dom.scatterLegend.innerHTML = "";
    return;
  }
  const color = colorForScatter(colorField, rows);
  drawScatter(dom.scatterChart, rows, xField, yField, xLabel, yLabel, color, colorField);
  if (colorField === "cn_ratio") {
    const values = rows.map((row) => row.cn_ratio).filter(Number.isFinite).sort(d3.ascending);
    renderRampLegend(
      dom.scatterLegend,
      "C:N ratio",
      CONTINUOUS_PALETTES.cn_ratio,
      d3.quantile(values, 0.02) || 0,
      d3.quantile(values, 0.98) || 1,
    );
  } else {
    renderCategoryLegend(dom.scatterLegend, rows, colorField, color);
  }
}

function colorForScatter(field, rows) {
  if (field === "cn_ratio") {
    const values = rows.map((row) => row.cn_ratio).filter(Number.isFinite).sort(d3.ascending);
    const scale = d3.scaleSequential(d3.interpolateMagma).domain([d3.quantile(values, 0.02) || 0, d3.quantile(values, 0.98) || 1]).clamp(true);
    return (row) => scale(row.cn_ratio);
  }
  const palette = PALETTES[field];
  return (row) => palette.get(row[field]) || "#9da39f";
}

function drawScatter(container, rows, xField, yField, xLabel, yLabel, color, colorField) {
  const { width, height, svg } = resetSvg(container);
  const margin = { top: 22, right: 28, bottom: 54, left: 66 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const xDomain = paddedDomain(rows.map((row) => row[xField]), { mode: dom.axisRange.value, clampZero: shouldClampZero(xField) });
  const yDomain = paddedDomain(rows.map((row) => row[yField]), { mode: dom.axisRange.value, clampZero: shouldClampZero(yField) });
  const x = d3.scaleLinear().domain(xDomain).range([margin.left, margin.left + plotWidth]);
  const y = d3.scaleLinear().domain(yDomain).range([margin.top + plotHeight, margin.top]);
  const clippedCount = rows.filter((row) => row[xField] < xDomain[0] || row[xField] > xDomain[1] || row[yField] < yDomain[0] || row[yField] > yDomain[1]).length;
  const canvas = document.createElement("canvas");
  container.prepend(canvas);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.globalAlpha = rows.length > 25000 ? 0.42 : 0.62;
  for (const row of rows) {
    const cx = x(row[xField]);
    const cy = y(row[yField]);
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) continue;
    ctx.fillStyle = color(row);
    ctx.beginPath();
    if (dom.scatterMode.value === "bio_space") drawShape(ctx, cx, cy, row.climate_zone);
    else ctx.arc(cx, cy, rows.length > 30000 ? 1.5 : 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  drawAxes(svg, x, y, width, height, margin, xLabel, yLabel);
  svg
    .append("text")
    .attr("class", "chart-note")
    .attr("x", margin.left)
    .attr("y", 16)
    .text(scatterAxisNote(clippedCount));
  attachPointTooltip(container, rows, x, y, xField, yField, colorField);
}

function drawShape(ctx, x, y, climate) {
  const r = 2.2;
  if (climate === "Arid") ctx.rect(x - r, y - r, r * 2, r * 2);
  else if (climate === "Cold") {
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y + r);
    ctx.lineTo(x - r, y + r);
    ctx.closePath();
  } else ctx.arc(x, y, r, 0, Math.PI * 2);
}

function renderBoxplot() {
  const metric = dom.boxMetric.value;
  const groupField = dom.boxGroup.value;
  const groups = buildGroupedStats(state.filtered, groupField, metric);
  if (!groups.length) {
    renderEmptyChart(dom.boxplotChart);
    dom.boxplotLegend.innerHTML = "";
    return;
  }
  const { width, height, svg } = resetSvg(dom.boxplotChart);
  const margin = { top: 20, right: 42, bottom: 52, left: 150 };
  const y = d3.scaleBand().domain(groups.map((group) => group.name)).range([margin.top, height - margin.bottom]).padding(0.28);
  const maxValue = d3.max(groups, (group) => Math.max(group.q75, group.mean, group.median)) || 1;
  const x = d3.scaleLinear().domain([0, maxValue * 1.12]).nice().range([margin.left, width - margin.right]);
  drawAxes(svg, x, y, width, height, margin, axisMetricLabel(metric), groupField === "climate_zone" ? "Climate Zone" : "Land Cover");
  const colorByClimate = (group) => PALETTES.climate_zone.get(group.climate_zone) || "#8e9692";
  const rows = svg.append("g").selectAll("g").data(groups).join("g").attr("transform", (group) => `translate(0,${y(group.name) + y.bandwidth() / 2})`);
  const intervals = rows.append("g").attr("display", dom.showErrorRange.checked ? null : "none");
  intervals
    .append("line")
    .attr("x1", (group) => x(group.q25))
    .attr("x2", (group) => x(group.q75))
    .attr("stroke", (group) => colorByClimate(group))
    .attr("stroke-width", 3)
    .attr("stroke-linecap", "round");
  intervals
    .append("line")
    .attr("x1", (group) => x(group.q25))
    .attr("x2", (group) => x(group.q25))
    .attr("y1", -6)
    .attr("y2", 6)
    .attr("stroke", (group) => colorByClimate(group))
    .attr("stroke-width", 2);
  intervals
    .append("line")
    .attr("x1", (group) => x(group.q75))
    .attr("x2", (group) => x(group.q75))
    .attr("y1", -6)
    .attr("y2", 6)
    .attr("stroke", (group) => colorByClimate(group))
    .attr("stroke-width", 2);
  rows.append("circle").attr("cx", (group) => x(group.mean)).attr("r", 5).attr("fill", (group) => colorByClimate(group));
  rows.append("path").attr("d", (group) => d3.symbol().type(d3.symbolDiamond).size(70)()).attr("transform", (group) => `translate(${x(group.median)},0)`).attr("fill", "#18211f");
  rows
    .append("rect")
    .attr("x", margin.left)
    .attr("y", -y.bandwidth() / 2)
    .attr("width", width - margin.left - margin.right)
    .attr("height", y.bandwidth())
    .attr("fill", "transparent")
    .on("mousemove", (event, group) => showGroupTooltip(event, group, metric))
    .on("mouseleave", hideTooltip);
  renderBoxplotLegend(groups);
}

function buildGroupedStats(rows, groupField, metric) {
  const groups = d3.groups(rows, (row) => row[groupField]).map(([name, items]) => {
    const mean = weightedMean(items, metric);
    const q25 = weightedQuantile(items, metric, 0.25);
    const median = weightedQuantile(items, metric, 0.5);
    const q75 = weightedQuantile(items, metric, 0.75);
    const coupling = dominantValue(items, "coupling_class");
    return {
      name,
      climate_zone: groupField === "climate_zone" ? name : dominantValue(items, "climate_zone"),
      mean,
      median,
      q25,
      q75,
      n_cells: items.length,
      dominant_coupling_class: coupling,
    };
  });
  return uniqueOrdered(groups.map((group) => group.name), ORDERS[groupField]).map((name) => groups.find((group) => group.name === name)).filter(Boolean);
}

function renderHeatmap() {
  const metric = dom.heatMetric.value;
  const rows = buildHeatmapRows(metric);
  if (!rows.length) {
    renderEmptyChart(dom.heatmapChart);
    dom.heatmapLegend.innerHTML = "";
    return;
  }
  const climates = uniqueOrdered(rows.map((row) => row.climate_zone), ORDERS.climate_zone);
  const landcovers = uniqueOrdered(rows.map((row) => row.landcover_major), ORDERS.landcover_major);
  const { width, height, svg } = resetSvg(dom.heatmapChart);
  const margin = { top: 24, right: 38, bottom: 118, left: 112 };
  const x = d3.scaleBand().domain(landcovers).range([margin.left, width - margin.right]).padding(0.04);
  const y = d3.scaleBand().domain(climates).range([margin.top, height - margin.bottom]).padding(0.04);
  const values = rows.map((row) => row[metric]).filter(Number.isFinite);
  const min = d3.min(values) || 0;
  const max = d3.max(values) || 1;
  const color = d3.scaleSequential(CONTINUOUS_PALETTES[metric]).domain([min, max]);
  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x)).selectAll("text").attr("transform", "rotate(-45)").attr("text-anchor", "end");
  svg.append("g").attr("class", "axis").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));
  svg
    .append("g")
    .selectAll("rect")
    .data(rows)
    .join("rect")
    .attr("x", (row) => x(row.landcover_major))
    .attr("y", (row) => y(row.climate_zone))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", (row) => color(row[metric]))
    .attr("fill-opacity", (row) => (row.n_cells < 30 ? 0.45 : 0.92))
    .attr("stroke", "rgba(255,255,255,0.55)")
    .on("mousemove", (event, row) => showHeatTooltip(event, row, metric))
    .on("mouseleave", hideTooltip)
    .on("click", (event, row) => applyHeatmapFilter(row));
  renderRampLegend(
    dom.heatmapLegend,
    metric === "weighted_mean_cn_ratio" ? "Weighted mean C:N ratio" : "High SOC / Low TN proportion",
    CONTINUOUS_PALETTES[metric],
    min,
    max,
    metric === "high_soc_low_tn_prop" ? formatPercent : formatNumber,
    heatmapMetricNote(metric),
  );
}

function renderHierarchy() {
  const hierarchyData = buildFilteredHierarchy();
  if (!hierarchyData) {
    renderEmptyChart(dom.hierarchyChart, "Hierarchy data are not available.");
    dom.hierarchyLegend.innerHTML = "";
    return;
  }
  const { width, height, svg } = resetSvg(dom.hierarchyChart);
  const root = d3
    .hierarchy(hierarchyData)
    .sum((node) => Number(node.value) || 0)
    .sort((a, b) => d3.descending(a.value, b.value));
  d3.partition().size([width, height])(root);
  const maxDepth = d3.max(root.descendants(), (node) => node.depth) || 1;
  const depthHeight = height / (maxDepth + 1);

  svg
    .append("g")
    .selectAll("rect")
    .data(root.descendants())
    .join("rect")
    .attr("x", (node) => node.x0)
    .attr("y", (node) => node.depth * depthHeight)
    .attr("width", (node) => Math.max(0, node.x1 - node.x0))
    .attr("height", Math.max(18, depthHeight - 2))
    .attr("fill", hierarchyColor)
    .attr("stroke", "rgba(255,255,255,0.72)")
    .attr("cursor", "pointer")
    .on("mousemove", showHierarchyTooltip)
    .on("mouseleave", hideTooltip)
    .on("click", (event, node) => applyHierarchyFilter(node));

  svg
    .append("g")
    .selectAll("text")
    .data(root.descendants().filter((node) => node.x1 - node.x0 > 52))
    .join("text")
    .attr("x", (node) => node.x0 + 6)
    .attr("y", (node) => node.depth * depthHeight + 18)
    .attr("fill", "#17211f")
    .attr("font-size", 11)
    .attr("pointer-events", "none")
    .text((node) => labelCategory(node.data.name || "Unclassified"));

  dom.hierarchyLegend.innerHTML = `
    <div class="summary-stat"><span>Interaction</span><strong>Click a node to filter linked views; click Global to reset.</strong></div>
  `;
}

function buildHeatmapRows(metric) {
  const baseRows = metric === "weighted_mean_cn_ratio" ? state.filtered : getRowsForHeatmapProportion();
  const byPair = d3.rollup(
    baseRows,
    (items) => {
      const totalWeight = d3.sum(items, rowWeight);
      const highSocLowTnWeight = d3.sum(items.filter((row) => row.coupling_class === "high_soc_low_tn"), rowWeight);
      return {
        weighted_mean_cn_ratio: weightedMean(items, "cn_ratio"),
        high_soc_low_tn_prop: totalWeight ? highSocLowTnWeight / totalWeight : NaN,
        n_cells: items.length,
        area_weight_sum: totalWeight,
        dominant_coupling_class: dominantValue(items, "coupling_class"),
      };
    },
    (row) => row.climate_zone,
    (row) => row.landcover_major,
  );
  const rows = [];
  byPair.forEach((landcoverMap, climateZone) => {
    landcoverMap.forEach((stats, landcoverMajor) => {
      rows.push({
        climate_zone: climateZone,
        landcover_major: landcoverMajor,
        ...stats,
      });
    });
  });
  return rows;
}

function getRowsForHeatmapProportion() {
  return state.grid.filter((row) => {
    if (dom.validOnly.checked && row.valid_flag !== 1) return false;
    if (dom.climateFilter.value !== "all" && row.climate_zone !== dom.climateFilter.value) return false;
    if (dom.landcoverFilter.value !== "all" && row.landcover_major !== dom.landcoverFilter.value) return false;
    if (state.region && !rowInRegion(row, state.region)) return false;
    return true;
  });
}

function buildFilteredHierarchy() {
  const rows = state.filtered;
  if (!rows.length) return null;
  const climateChildren = d3.groups(rows, (row) => row.climate_zone).map(([climate, climateRows]) => ({
    name: climate,
    children: d3.groups(climateRows, (row) => row.landcover_major).map(([landcover, landRows]) => ({
      name: landcover,
      children: d3.groups(landRows, (row) => row.coupling_class).map(([coupling, couplingRows]) => ({
        name: coupling,
        value: d3.sum(couplingRows, rowWeight),
      })),
    })),
  }));
  return { name: "Global", children: climateChildren };
}

function applyHeatmapFilter(row) {
  dom.climateFilter.value = row.climate_zone;
  dom.landcoverFilter.value = row.landcover_major;
  render();
}

function showHierarchyTooltip(event, node) {
  const path = node.ancestors().reverse().map((item) => labelCategory(item.data.name || "Unclassified")).join(" > ");
  const share = node.root.value ? node.value / node.root.value : NaN;
  showTooltip(event, `<strong>${path}</strong>Value: ${formatNumber(node.value)}<br>Share of global: ${formatPercent(share)}`);
}

function hierarchyColor(node) {
  if (node.depth === 0) return "#d9dfdc";
  if (node.depth === 1) return PALETTES.climate_zone.get(normalizeCategory(node.data.name)) || "#9da39f";
  if (node.depth === 3) return PALETTES.coupling_class.get(node.data.name) || "#8e9692";
  return d3.color(hierarchyColor(node.parent)).brighter(0.8).formatHex();
}

function applyHierarchyFilter(node) {
  const path = node.ancestors().reverse().map((item) => normalizeCategory(item.data.name));
  dom.climateFilter.value = "all";
  dom.landcoverFilter.value = "all";
  dom.couplingFilter.value = "all";
  if (node.depth >= 1 && path[1] && optionExists(dom.climateFilter, path[1])) dom.climateFilter.value = path[1];
  if (node.depth >= 2 && path[2] && optionExists(dom.landcoverFilter, path[2])) dom.landcoverFilter.value = path[2];
  if (node.depth >= 3 && path[3] && optionExists(dom.couplingFilter, path[3])) dom.couplingFilter.value = path[3];
  render();
}

function optionExists(select, value) {
  return [...select.options].some((option) => option.value === value);
}

function resetSvg(container) {
  container.innerHTML = "";
  const rect = container.getBoundingClientRect();
  const width = Math.max(360, rect.width || 800);
  const height = Math.max(360, rect.height || 600);
  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${width} ${height}`);
  return { width, height, svg };
}

function renderEmptyChart(container, message = emptyMessage()) {
  container.innerHTML = `<div class="empty-state">${message}</div>`;
}

function drawAxes(svg, x, y, width, height, margin, xLabel, yLabel) {
  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).ticks(Math.min(8, Math.floor(width / 100))));
  svg.append("g").attr("class", "axis").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));
  svg.append("text").attr("class", "axis-label").attr("x", margin.left + (width - margin.left - margin.right) / 2).attr("y", height - 12).attr("text-anchor", "middle").text(xLabel);
  svg.append("text").attr("class", "axis-label").attr("transform", "rotate(-90)").attr("x", -(margin.top + (height - margin.top - margin.bottom) / 2)).attr("y", 18).attr("text-anchor", "middle").text(yLabel);
}

function renderCategoryLegend(container, rows, field, color) {
  const counts = d3.rollup(rows, (items) => items.length, (row) => row[field]);
  const values = uniqueOrdered([...counts.keys()], ORDERS[field]);
  container.innerHTML = "";
  for (const value of values) {
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `<span class="legend-swatch" style="background:${color({ [field]: value })}"></span><span class="legend-label">${labelCategory(value)}</span><span class="legend-count">${formatCount(counts.get(value) || 0)}</span>`;
    container.appendChild(item);
  }
}

function renderRampLegend(container, title, interpolator, min, max, formatter = formatNumber, note = "") {
  const stops = d3.range(0, 1.01, 0.1)
    .map((step) => `${interpolator(step)} ${step * 100}%`)
    .join(", ");
  container.innerHTML = `
    <div class="legend-ramp-card">
      <div class="legend-ramp-title">${title}</div>
      <div class="legend-ramp" style="background: linear-gradient(90deg, ${stops})"></div>
      <div class="legend-scale">
        <span>${formatter(min)}</span>
        <span>${formatter(max)}</span>
      </div>
      ${note ? `<div class="legend-note">${note}</div>` : ""}
    </div>
  `;
}

function renderBoxplotLegend(groups) {
  dom.boxplotLegend.innerHTML = `
    <div class="grouped-legend">
      <div class="marks-caption">Circle = mean; diamond = median; line = q25-q75.</div>
      <div class="summary-note">All summary statistics in this panel are area-weighted. q25-q75 denotes the interquartile range (IQR), i.e. the middle 50% of values in each group.</div>
      <div class="color-legend" id="groupedColorLegend"></div>
    </div>
  `;
  const colorLegend = dom.boxplotLegend.querySelector("#groupedColorLegend");
  const climates = uniqueOrdered(groups.map((group) => group.climate_zone), ORDERS.climate_zone);
  for (const climate of climates) {
    const item = document.createElement("div");
    item.className = "color-legend-item";
    item.innerHTML = `
      <span class="legend-swatch" style="background:${PALETTES.climate_zone.get(climate) || "#8e9692"}"></span>
      <span class="legend-label">${labelCategory(climate)}</span>
    `;
    colorLegend.appendChild(item);
  }
}

function attachPointTooltip(container, rows, x, y, xField, yField, colorField) {
  const points = rows.map((row) => ({ row, x: x(row[xField]), y: y(row[yField]) })).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  const tree = d3.quadtree(points, (point) => point.x, (point) => point.y);
  let hovered = null;
  container.onpointermove = (event) => {
    const rect = container.getBoundingClientRect();
    const found = tree.find(event.clientX - rect.left, event.clientY - rect.top, 12);
    if (!found) return hideTooltip();
    const row = found.row;
    hovered = row;
    showTooltip(event, `${cellTooltipHtml(row)}<br>${labelField(colorField)}: ${formatFieldValue(row[colorField], colorField)}`);
  };
  container.onclick = () => {
    if (!hovered) return;
    state.selectedCell = hovered;
    renderDetailPanel();
  };
  container.onpointerleave = hideTooltip;
}

function showGroupTooltip(event, group, metric) {
  showTooltip(
    event,
    `<strong>${group.name}</strong>Weighted mean: ${formatNumber(group.mean)} ${METRICS[metric].unit}<br>Weighted median: ${formatNumber(group.median)}<br>Weighted q25: ${formatNumber(group.q25)}<br>Weighted q75: ${formatNumber(group.q75)}<br>n_cells: ${formatCount(group.n_cells)}<br>Dominant coupling: ${labelCategory(group.dominant_coupling_class)}${group.n_cells < 30 ? "<br>Small sample size; interpret cautiously." : ""}${group.dominant_coupling_class === "medium_or_mixed" ? `<br>${MEDIUM_OR_MIXED_NOTE}` : ""}`,
  );
}

function showHeatTooltip(event, row, metric) {
  const metricLine =
    metric === "weighted_mean_cn_ratio"
      ? `Weighted mean C:N: ${formatNumber(row.weighted_mean_cn_ratio)}`
      : `High SOC / Low TN proportion: ${formatPercent(row.high_soc_low_tn_prop)}`;
  showTooltip(event, `<strong>${row.climate_zone} / ${row.landcover_major}</strong>${metricLine}<br>n_cells: ${formatCount(row.n_cells)}<br>Dominant coupling: ${labelCategory(row.dominant_coupling_class)}${row.n_cells < 30 ? "<br>Small sample size; interpret cautiously." : ""}${row.dominant_coupling_class === "medium_or_mixed" ? `<br>${MEDIUM_OR_MIXED_NOTE}` : ""}`);
}

function showTooltip(event, html) {
  dom.tooltip.innerHTML = html;
  dom.tooltip.style.left = `${event.clientX + 14}px`;
  dom.tooltip.style.top = `${event.clientY + 14}px`;
  dom.tooltip.hidden = false;
}

function hideTooltip() {
  dom.tooltip.hidden = true;
}

function paddedDomain(values, options = {}) {
  const mode = options.mode || "robust";
  const sorted = values.filter(Number.isFinite).sort(d3.ascending);
  if (!sorted.length) return [0, 1];
  const min = mode === "full" ? sorted[0] : d3.quantile(sorted, 0.01);
  const max = mode === "full" ? sorted[sorted.length - 1] : d3.quantile(sorted, 0.99);
  const pad = Math.max((max - min) * 0.06, 0.1);
  return [options.clampZero ? Math.max(0, min - pad) : min - pad, max + pad];
}

function shouldClampZero(field) {
  return ["soc_gkg", "tn_gkg", "cn_ratio", "bio12"].includes(field);
}

function scatterAxisNote(clippedCount) {
  if (dom.axisRange.value === "full") return "Axis range: full filtered min-max with padding.";
  return `Scatter axes use the 1st-99th percentile range by default to reduce the influence of extreme values. Robust range may hide extreme 1% points; clipped/out-of-range cells: ${formatCount(clippedCount)}.`;
}

function weightedMean(rows, field) {
  const totalWeight = d3.sum(rows, (row) => Number(row.area_weight) || 1);
  return d3.sum(rows, (row) => row[field] * ((Number(row.area_weight) || 1) / totalWeight));
}

function weightedQuantile(rows, field, q) {
  const pairs = rows
    .map((row) => ({ value: row[field], weight: rowWeight(row) }))
    .filter((item) => Number.isFinite(item.value) && Number.isFinite(item.weight) && item.weight > 0)
    .sort((a, b) => d3.ascending(a.value, b.value));
  if (!pairs.length) return NaN;
  const totalWeight = d3.sum(pairs, (item) => item.weight);
  const threshold = totalWeight * q;
  let cumulative = 0;
  for (const item of pairs) {
    cumulative += item.weight;
    if (cumulative >= threshold) return item.value;
  }
  return pairs[pairs.length - 1].value;
}

function rowWeight(row) {
  const weight = Number(row.area_weight);
  return Number.isFinite(weight) && weight > 0 ? weight : 1;
}

function dominantValue(rows, field) {
  const counts = d3.rollups(rows, (items) => items.length, (row) => row[field]).sort((a, b) => d3.descending(a[1], b[1]));
  return counts[0]?.[0] || "Unclassified";
}

function labelField(field) {
  if (field === "cn_ratio") return "C:N";
  if (field === "coupling_class") return "Coupling";
  if (field === "climate_zone") return "Climate";
  if (field === "landcover_major") return "Land cover";
  return field;
}

function axisMetricLabel(metric) {
  if (metric === "soc_gkg") return "SOC (g/kg)";
  if (metric === "tn_gkg") return "TN (g/kg)";
  if (metric === "cn_ratio") return "C:N ratio";
  return labelField(metric);
}

function labelCategory(value) {
  return LABELS[value] || value;
}

function heatmapMetricNote(metric) {
  if (metric === "weighted_mean_cn_ratio") {
    return "Heatmap values are recalculated from the currently filtered grid cells.";
  }
  return "High SOC / Low TN proportion is area-weighted within each climate x land-cover group and is not conditioned on the coupling-class filter.";
}

function formatFieldValue(value, field) {
  if (field === "cn_ratio") return formatNumber(value);
  if (field === "coupling_class") return labelCategory(value);
  return value == null || value === "" ? "NA" : labelCategory(value);
}

function cellTooltipHtml(row) {
  return `<strong>${safeValue(row.cell_id)}</strong>${cellDetailHtml(row)}`;
}

function cellDetailHtml(row) {
  return `
    <div> SOC: ${formatNumber(row.soc_gkg)} g/kg</div>
    <div> TN: ${formatNumber(row.tn_gkg)} g/kg</div>
    <div> C:N: ${formatNumber(row.cn_ratio)}</div>
    ${predictionIntervalHtml(row)}
    <div> Köppen class: ${safeValue(row.kg_class)}</div>
    <div> Climate zone: ${safeValue(row.climate_zone)}</div>
    <div> BIO1: ${formatNumber(row.bio1)} °C</div>
    <div> BIO12: ${formatNumber(row.bio12)} mm</div>
    <div> Land cover: ${safeValue(row.landcover_label)}</div>
    <div> Land cover group: ${safeValue(row.landcover_major)}</div>
    <div> SOC level: ${safeValue(row.soc_level)}</div>
    <div> TN level: ${safeValue(row.tn_level)}</div>
    <div> Coupling class: ${labelCategory(row.coupling_class)}</div>
    ${row.coupling_class === "medium_or_mixed" ? `<div>${MEDIUM_OR_MIXED_NOTE}</div>` : ""}
    <div> ${row.possible_outlier === 1 ? "C:N outlier flagged" : "C:N outlier: no"}</div>
  `;
}

function predictionIntervalHtml(row) {
  const hasSoc = Number.isFinite(row.soc_q05_gkg) && Number.isFinite(row.soc_q95_gkg);
  const hasTn = Number.isFinite(row.tn_q05_gkg) && Number.isFinite(row.tn_q95_gkg);
  if (!hasSoc && !hasTn) return "<div>Prediction interval: not available</div>";
  return `
    <div>SOC prediction interval: Q0.05-Q0.95 = ${hasSoc ? `${formatNumber(row.soc_q05_gkg)}-${formatNumber(row.soc_q95_gkg)} g/kg` : "not available"}</div>
    <div>TN prediction interval: Q0.05-Q0.95 = ${hasTn ? `${formatNumber(row.tn_q05_gkg)}-${formatNumber(row.tn_q95_gkg)} g/kg` : "not available"}</div>
    <div>Relative uncertainty: SOC = ${formatNumber(row.soc_relative_uncert)}, TN = ${formatNumber(row.tn_relative_uncert)}</div>
  `;
}

function safeValue(value) {
  return value == null || value === "" ? "NA" : value;
}

function emptyMessage() {
  return "No grid cells match the current filters. Please relax climate, land-cover, or coupling-class filters.";
}

function summaryEmptyMessage(totalFiltered) {
  if (dom.categorySelect.value === "spatial" && totalFiltered > 0) {
    return "No filtered grid cells are visible in the current map view. Pan or zoom out to bring cells back into view.";
  }
  return emptyMessage();
}

function summaryScopeNote(isSpatial, visibleCount, totalFiltered) {
  if (isSpatial) {
    return `Map scope: visible map view (${formatCount(visibleCount)} of ${formatCount(totalFiltered)} filtered cells).`;
  }
  return "Scope: current filters.";
}

function formatNumber(value) {
  return Number.isFinite(value) ? d3.format(".3~f")(value) : "NA";
}

function formatCount(value) {
  return d3.format(",")(value || 0);
}

function formatPercent(value) {
  return Number.isFinite(value) ? d3.format(".1%")(value) : "NA";
}

function formatSigned(value) {
  return Number.isFinite(value) ? d3.format("+.3~f")(value) : "NA";
}

function formatSignedPercent(value) {
  return Number.isFinite(value) ? d3.format("+.1%")(value) : "NA";
}

function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
