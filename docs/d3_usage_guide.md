# D3.js 使用说明

## 1. 文件清单
- `grid_soc_tn_cn_0p5deg.csv`：主网格数据。
- `group_summary_climate.csv`：气候带分组统计。
- `group_summary_landcover.csv`：土地覆盖分组统计。
- `group_summary_climate_landcover.csv`：气候带 × 土地覆盖交叉统计。
- `hierarchy_climate_landcover_coupling.json`：适合 `d3.hierarchy()` 的层次数据。
- `world_countries_110m.geojson` / `world_countries_110m.topojson`：世界底图。

## 2. 全球地图
使用 `world_countries_110m.topojson` 或 `world_countries_110m.geojson` 叠加 `grid_soc_tn_cn_0p5deg.csv`。关键字段：`lon`, `lat`, `soc_gkg`, `tn_gkg`, `cn_ratio`, `climate_zone`, `landcover_major`, `coupling_class`。推荐 D3：`d3.csv()`, `d3.json()`, `d3.geoNaturalEarth1()`, `d3.geoPath()`, `d3.scaleSequential()`, mouseover tooltip。

## 3. SOC-TN 散点图
使用 `grid_soc_tn_cn_0p5deg.csv`；如果前端加载压力大，使用 `grid_soc_tn_cn_0p5deg_sample.csv`。关键字段：`soc_gkg`, `tn_gkg`, `climate_zone`, `landcover_major`, `coupling_class`, `joint_uncert`。推荐 D3：`d3.scaleLinear()`, `d3.scaleOrdinal()`, `d3.axisBottom()`, `d3.axisLeft()`, `d3.brush()`, tooltip。

## 4. 气候带比较图
使用 `group_summary_climate.csv`。关键字段：`group_name`, `weighted_mean_soc_gkg`, `weighted_mean_tn_gkg`, `weighted_mean_cn_ratio`, `q25_cn_ratio`, `q75_cn_ratio`。推荐图表：bar chart、box-like interval chart、small multiples。

## 5. 土地覆盖比较图
使用 `group_summary_landcover.csv`。关键字段：`group_name`, `weighted_mean_soc_gkg`, `weighted_mean_tn_gkg`, `weighted_mean_cn_ratio`, `dominant_coupling_class`。推荐图表：horizontal bar chart、grouped bar chart、dot plot。

## 6. 层次结构图
使用 `hierarchy_climate_landcover_coupling.json`。推荐 D3：`d3.hierarchy()`, `d3.partition()`, sunburst, icicle plot。

## 7. 不确定性图
使用 `grid_soc_tn_cn_0p5deg.csv`。关键字段：`soc_uncert`, `tn_uncert`, `joint_uncert`。推荐表现：map layer、scatter point opacity、uncertainty legend。

## 8. 示例读取方式
```js
const grid = await d3.csv("data/processed/grid_soc_tn_cn_0p5deg.csv", d3.autoType);
const world = await d3.json("data/processed/world_countries_110m.geojson");
const hierarchy = await d3.json("data/processed/hierarchy_climate_landcover_coupling.json");
```
