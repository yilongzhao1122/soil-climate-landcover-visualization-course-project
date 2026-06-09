# 数据预处理方法

## 1. 原始数据来源
读取目录 `raw_data` 中的 SoilGrids、WorldClim v2.1 bioclim、Köppen-Geiger present-day、MODIS MCD12C1 2021 IGBP landcover 和 Natural Earth 110m admin_0 countries。

主要识别到的数据源：
{
  "SOC_0-5cm": "raw_data\\soilgrids_aggregated_5000m\\soc\\soc_0-5cm_mean_5000.tif",
  "SOC_5-15cm": "raw_data\\soilgrids_aggregated_5000m\\soc\\soc_5-15cm_mean_5000.tif",
  "SOC_15-30cm": "raw_data\\soilgrids_aggregated_5000m\\soc\\soc_15-30cm_mean_5000.tif",
  "TN_0-5cm": "raw_data\\soilgrids_aggregated_5000m\\nitrogen\\nitrogen_0-5cm_mean_5000.tif",
  "TN_5-15cm": "raw_data\\soilgrids_aggregated_5000m\\nitrogen\\nitrogen_5-15cm_mean_5000.tif",
  "TN_15-30cm": "raw_data\\soilgrids_aggregated_5000m\\nitrogen\\nitrogen_15-30cm_mean_5000.tif",
  "SOC_Q0.05_0-5cm": "raw_data\\soilgrids\\soc\\soc_0-5cm_Q0.05.vrt",
  "SOC_Q0.05_5-15cm": "raw_data\\soilgrids\\soc\\soc_5-15cm_Q0.05.vrt",
  "SOC_Q0.05_15-30cm": "raw_data\\soilgrids\\soc\\soc_15-30cm_Q0.05.vrt",
  "SOC_Q0.95_0-5cm": "raw_data\\soilgrids\\soc\\soc_0-5cm_Q0.95.vrt",
  "SOC_Q0.95_5-15cm": "raw_data\\soilgrids\\soc\\soc_5-15cm_Q0.95.vrt",
  "SOC_Q0.95_15-30cm": "raw_data\\soilgrids\\soc\\soc_15-30cm_Q0.95.vrt",
  "bio1": "raw_data\\worldclim\\wc2.1_5m_bio\\wc2.1_5m_bio_1.tif",
  "bio12": "raw_data\\worldclim\\wc2.1_5m_bio\\wc2.1_5m_bio_12.tif",
  "bio4": "raw_data\\worldclim\\wc2.1_5m_bio\\wc2.1_5m_bio_4.tif",
  "bio15": "raw_data\\worldclim\\wc2.1_5m_bio\\wc2.1_5m_bio_15.tif",
  "koppen_geiger_present": "raw_data\\koppen_geiger\\Beck_KG_V1_present_0p5.tif",
  "landcover_modis": "raw_data\\landcover_modis\\MCD12C1_2021_IGBP_0p05deg_global.tif",
  "naturalearth_admin0": "raw_data\\naturalearth\\ne_110m_admin_0_countries\\ne_110m_admin_0_countries.shp"
}

## 2. 目标网格
统一输出为 EPSG:4326、0.5 degree 全球规则网格，中心点经纬度作为 D3 点/格网地图输入。陆地格网由 SoilGrids 有效值和土地覆盖非水体共同约束。

## 3. 单位转换
SoilGrids SOC 常见原始单位为 dg/kg，本流程使用 `SOC_gkg = SOC_raw / 10`。SoilGrids nitrogen 常见原始单位为 cg/kg，本流程使用 `TN_gkg = nitrogen_raw / 100`。

## 4. 0-30 cm 厚度加权
SOC 和 TN 均按 `0-5 cm * 5 + 5-15 cm * 10 + 15-30 cm * 15` 后除以 30 计算 0-30 cm 表层均值。

## 5. C:N 计算
`cn_ratio = soc_gkg / tn_gkg`。当 `tn_gkg <= 0` 时设为 NA。

## 6. 不确定性计算
若 Q0.05/Q0.95 文件可读，先做 0-30 cm 厚度加权，再计算 `(Q0.95 - Q0.05) / Q0.50`。缺少 TN 分位数文件时 `tn_uncert` 和依赖它的 `joint_uncert` 为 NA。

## 7. WorldClim 聚合方法
BIO1、BIO12、BIO4、BIO15 使用 rasterio 重投影到 0.5 degree，连续变量采用 average resampling。

## 8. Köppen-Geiger majority 方法
优先使用 present-day raster，分类变量采用 mode resampling。类别编码按 `legend.txt` 解析，一级气候带按 A/B/C/D/E 映射到 Tropical/Arid/Temperate/Cold/Polar。

## 9. MODIS landcover majority 方法
MODIS MCD12C1 2021 IGBP 分类重采样到 0.5 degree，分类变量采用 mode resampling，并归并为前端友好的土地覆盖大类。

## 10. SOC-TN coupling classification
有效格网阈值：SOC 33%=16.2, SOC 66%=48.05, TN 33%=1.423, TN 66%=3.482。按 low/medium/high 组合生成耦合类别。

## 11. 缺失值和异常值处理
原始 nodata 转为 NA。`valid_flag=0` 表示 SOC <= 0 或 TN <= 0。`cn_ratio > 100` 不删除，但 `possible_outlier=1`。

## 12. 数据局限性
面积权重使用 `cos(latitude)` 近似，不是严格椭球面积。SoilGrids 主值优先使用本地 5000m 聚合 TIFF 以控制处理量。若某些不确定性分位数文件缺失或不可读，对应字段保留 NA。
