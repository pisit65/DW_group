CREATE DATABASE IF NOT EXISTS dw;

CREATE TABLE IF NOT EXISTS dw.dim_platform(
  platform_key UInt32,
  platform_name LowCardinality(String)
) ENGINE=ReplacingMergeTree() ORDER BY platform_name;

CREATE TABLE IF NOT EXISTS dw.dim_product(
  product_key UInt32,
  product_id_src String,
  title String,
  brand String,
  categories Array(String),
  url String,
  image_url String,
  features String,
  valid_from DateTime,
  valid_to   DateTime,
  is_current UInt8
) ENGINE=ReplacingMergeTree(valid_to)
ORDER BY (product_id_src, valid_from);

CREATE TABLE IF NOT EXISTS dw.dim_seller(
  seller_key UInt32,
  seller_name String
) ENGINE=ReplacingMergeTree() ORDER BY seller_name;

CREATE TABLE IF NOT EXISTS dw.dim_date(
  date_key UInt32,
  date Date
) ENGINE=MergeTree ORDER BY date;

CREATE TABLE IF NOT EXISTS dw.fact_product_snapshot(
  date_key UInt32,
  snapshot_ts DateTime,
  platform_key UInt32,
  product_key UInt32,
  seller_key UInt32,
  currency FixedString(3),
  initial_price Float64,
  final_price Float64,
  discount_amount Float64,
  discount_rate Float64,
  availability_flag UInt8,
  rating Float32,
  reviews_count UInt32,
  images_count UInt16,
  delivery String
) ENGINE=MergeTree
PARTITION BY toYYYYMM(toDate(snapshot_ts))
ORDER BY (date_key, platform_key, product_key);
