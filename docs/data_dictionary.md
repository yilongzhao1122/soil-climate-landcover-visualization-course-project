# 数据字典

| 字段 | 含义 |
|---|---|
| cell_id | 0.5 degree 网格唯一编号，格式为 `r{row}_c{col}`。 |
| lon | 网格中心点经度，EPSG:4326，单位 degree。 |
| lat | 网格中心点纬度，EPSG:4326，单位 degree。 |
| area_weight | 面积权重近似值，使用 `cos(latitude)`，用于纬向面积差异校正。 |
| soc_gkg | SoilGrids 0-30 cm 厚度加权土壤有机碳，单位 g/kg；SOC 原始 dg/kg 按 `SOC_raw / 10` 转换。 |
| tn_gkg | SoilGrids 0-30 cm 厚度加权总氮，单位 g/kg；nitrogen 原始 cg/kg 按 `TN_raw / 100` 转换。 |
| cn_ratio | C:N 比，`soc_gkg / tn_gkg`；`tn_gkg <= 0` 时为 NA。 |
| soc_uncert | SOC 相对不确定性，`(Q0.95 - Q0.05) / Q0.50`；文件缺失时为 NA。 |
| tn_uncert | TN 相对不确定性，`(Q0.95 - Q0.05) / Q0.50`；文件缺失时为 NA。 |
| joint_uncert | SOC 与 TN 不确定性均值。 |
| bio1 | WorldClim BIO1 annual mean temperature，重采样到 0.5 degree。 |
| bio12 | WorldClim BIO12 annual precipitation，重采样到 0.5 degree。 |
| bio4 | WorldClim BIO4 temperature seasonality，缺失时为 NA。 |
| bio15 | WorldClim BIO15 precipitation seasonality，缺失时为 NA。 |
| kg_class | Köppen-Geiger 细分类，例如 Af、BWh、Cfa。 |
| kg_major | Köppen-Geiger 一级字母：A/B/C/D/E。 |
| climate_zone | 气候带：Tropical、Arid、Temperate、Cold、Polar。 |
| landcover_source | 土地覆盖数据源，本轮为 MODIS MCD12C1 2021 IGBP。 |
| landcover_code | MODIS IGBP 分类编码。 |
| landcover_label | MODIS IGBP 原始类别名称。 |
| landcover_major | 可视化归并类别：Forest、Shrubland、Savanna、Grassland、Wetland、Cropland、Urban、Snow/Ice、Barren、Water、Other。 |
| soc_level | 基于有效格网 SOC 33%/66% 分位数的 low/medium/high。 |
| tn_level | 基于有效格网 TN 33%/66% 分位数的 low/medium/high。 |
| coupling_class | SOC-TN 耦合类别：high_soc_high_tn、high_soc_low_tn、low_soc_high_tn、low_soc_low_tn、medium_or_mixed。 |
| valid_flag | 1 表示 SOC > 0 且 TN > 0；SOC <= 0 或 TN <= 0 标记为 0。 |
| possible_outlier | 1 表示 `cn_ratio > 100`，不直接删除。 |

MODIS IGBP 编码：0/17 Water；1-5 Forest；6-7 Shrubland；8-9 Savanna；10 Grassland；11 Wetland；12/14 Cropland；13 Urban；15 Snow/Ice；16 Barren；其他为 Other。
