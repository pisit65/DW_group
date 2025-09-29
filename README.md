# 📦 E-commerce Dataset Samples

This repository contains **sample datasets** from e-commerce transactions, featuring thousands of records in total. All datasets were extracted using the **Bright Data API**.

---

## 🗂 Data Points

| #  | Name           | Type            | Description                         |
|----|----------------|----------------|-------------------------------------|
| 1  | `id`           | UInt64          | Unique record identifier             |
| 2  | `date`         | Date            | Transaction date                     |
| 3  | `product_id`   | String          | Unique product identifier            |
| 4  | `product_name` | String          | Name of the product                  |
| 5  | `category`     | String          | Product category                     |
| 6  | `brand`        | String          | Product brand                        |
| 7  | `customer_id`  | String          | Unique customer identifier           |
| 8  | `customer_name`| String          | Customer name                        |
| 9  | `gender`       | String          | Customer gender                       |
| 10 | `region`       | String          | Customer region                       |
| 11 | `store_id`     | String          | Store identifier                      |
| 12 | `store_name`   | String          | Store name                            |
| 13 | `store_city`   | String          | City of the store                     |
| 14 | `quantity`     | Int32           | Quantity sold                         |
| 15 | `unit_price`   | Decimal(12,2)   | Price per unit                        |
| 16 | `discount`     | Decimal(5,2)    | Discount applied                       |
| 17 | `sales_amount` | Decimal(12,2)   | Total sales amount                    |
| 18 | `profit`       | Decimal(12,2)   | Profit from the transaction           |

---

## 🐘 PostgreSQL Setup

docker exec -it postgres psql -U dicek -d mydb
```
CREATE TABLE sales_data (
    id SERIAL PRIMARY KEY,
    date DATE,
    product_id VARCHAR(20),
    product_name VARCHAR(100),
    category VARCHAR(50),
    brand VARCHAR(50),
    customer_id VARCHAR(20),
    customer_name VARCHAR(100),
    gender VARCHAR(10),
    region VARCHAR(50),
    store_id VARCHAR(20),
    store_name VARCHAR(100),
    store_city VARCHAR(50),
    quantity INT,
    unit_price NUMERIC(12,2),
    discount NUMERIC(5,2),
    sales_amount NUMERIC(12,2),
    profit NUMERIC(12,2)
);
```
---

## ⚡ ClickHouse Setup

docker exec -it clickhouse_db clickhouse-client -u default --password 2546

-- Main Table
```
CREATE TABLE IF NOT EXISTS sales_data (
    date Date,
    product_id String,
    product_name String,
    category String,
    brand String,
    customer_id String,
    customer_name String,
    gender String,
    region String,
    store_id String,
    store_name String,
    store_city String,
    quantity Int32,
    unit_price Decimal(12,2),
    discount Decimal(5,2),
    sales_amount Decimal(12,2),
    profit Decimal(12,2)
)
ENGINE = MergeTree()
ORDER BY date;
```

-- Foreign Table (Proxy to PostgreSQL)
```
CREATE TABLE sales_data_pg
(
    id UInt64,
    date Date,
    product_id String,
    product_name String,
    category String,
    brand String,
    customer_id String,
    customer_name String,
    gender String,
    region String,
    store_id String,
    store_name String,
    store_city String,
    quantity Int32,
    unit_price Decimal(12,2),
    discount Decimal(5,2),
    sales_amount Decimal(12,2),
    profit Decimal(12,2)
)
ENGINE = PostgreSQL(
    'postgres',
    'mydb',
    'sales_data',
    'dicek',
    '2546'
);
```
---

✅ This structure allows **efficient querying and analytics** across both PostgreSQL and ClickHouse.
It’s ideal for e-commerce **reporting, dashboarding, and analytics pipelines**.
