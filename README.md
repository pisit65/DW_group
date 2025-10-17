[https://drive.google.com/file/d/1DMzjWxEcFpAEYBVtL9SUU5Y-cg8JSazJ/view?usp=sharing]
# 1. ชื่อโครงการ (Project Title)

**ภาษาไทย:** ระบบวิเคราะห์แนวโน้มร้านค้าออนไลน์และสร้างสรุปรายงานอัตโนมัติ
**English:** E-commerce Sales Trend Analytics and Automated Report

**ชุดข้อมูล (Dataset):** [https://github.com/luminati-io/eCommerce-dataset-samples](https://github.com/luminati-io/eCommerce-dataset-samples)

***

# 2. สมาชิกกลุ่ม (Group Members)

| ชื่อ - นามสกุล | รหัสนักศึกษา | หน้าที่ในกลุ่ม |
| :--- | :--- | :--- |
| พิสิษฐ์ พวงธาตุ | 65114540420 | **ETL** (Extract, Transform, Load) และ **DW Schema** (Data Warehouse Schema) |
| พศวีร์ มันตะ | 65114540383 | **AI Prompt Engineering** และ **Summary Report Generation** |
| วัฒนกิจ เปล่งศรี | 65114540574 | **Dashboard Development** และ **Visualization** |

***

# 3. วัตถุประสงค์ของโครงการ (Project Objectives)

## วัตถุประสงค์หลัก (Main Objective)
* พัฒนาระบบคลังข้อมูลเพื่อวิเคราะห์แนวโน้มยอดขายและสร้างรายงานอัตโนมัติจากข้อมูลร้านค้าออนไลน์

## วัตถุประสงค์รอง (Sub-Objectives)
1.  ออกแบบ **Star Schema** สำหรับ Data Warehouse เพื่อรองรับการวิเคราะห์ข้อมูลการขาย
2.  ดำเนินการ **ETL** ข้อมูลจากไฟล์ CSV ต้นฉบับเข้าสู่ Data Warehouse
3.  สร้าง **Dashboard** เพื่อแสดงผลการวิเคราะห์ และพัฒนา **AI Prompt** เพื่อใช้ในการสรุปแนวโน้มและรายงาน

***

# 5. ขอบเขตของโครงการ (Project Scope)

## สิ่งที่จะทำในโครงการ (Inclusions)
* **พัฒนา Dashboard:** สร้าง Dashboard บน **Web Application (React + Express)** สำหรับแสดงผลการวิเคราะห์ที่สำคัญ เช่น:
    * แนวโน้มยอดขายตามช่วงเวลาต่าง ๆ
    * อันดับสินค้าขายดี (Top-Selling Products)
    * แหล่งที่มาของยอดขาย (Sales Channel Analysis)
* **ประยุกต์ใช้ Generative AI:** ใช้ **OpenAI API (ChatGPT)** เพื่อสรุปรายงานยอดขายในรูปแบบข้อความอัตโนมัติ เช่น:
    * สรุปยอดขายและผลการดำเนินงานในสัปดาห์/เดือนที่ผ่านมา
    * สร้างคำแนะนำทางธุรกิจจากแนวโน้มข้อมูลที่ค้นพบ

## สิ่งที่จะไม่ทำในโครงการ (Exclusions)
* **ข้อมูล:** ไม่ใช้ข้อมูลจริงจากร้านค้า (ใช้เฉพาะข้อมูลตัวอย่าง (sample) ที่เผยแพร่จาก GitHub ตามที่ระบุไว้)
* **การพัฒนา AI:** ไม่สร้างหรือเทรนโมเดล AI เอง (ใช้เฉพาะ API สำเร็จรูปจาก OpenAI)
* **คุณสมบัติเสริม:** ไม่ออกแบบระบบแจ้งเตือน (Notification System) หรือระบบแนะนำสินค้า (Deep Recommendation System) แบบเชิงลึก

***

# 6. เครื่องมือและเทคโนโลยีที่ใช้ (Tools and Technologies)

| ประเภท | เครื่องมือ/เทคโนโลยี | รายละเอียดการใช้งาน |
| :--- | :--- | :--- |
| **ฐานข้อมูล** (Database) | **ClickHouse** | ใช้เป็น Data Warehouse (DW) สำหรับจัดเก็บข้อมูลที่ผ่านการ Transform แล้ว |
| **ETL Tools** | **Python (pandas)**, **dbt (data build tool)** | ใช้ Python/Pandas ในการ Clean/Transform ข้อมูล และใช้ dbt ในการจัดระเบียบ Transformation Logic และสร้าง DW Schema |
| **BI Tools / Web App** | **React**, **Express.js**, **Child Process (Python)** | **React** สำหรับ Front-end (Dashboard), **Express.js** สำหรับ Back-end API และใช้ **Child Process** ในการรันสคริปต์ Python เพื่อดึงข้อมูลจาก DW และส่งต่อให้ AI |
| **AI** | **OpenAI API (ChatGPT)** | ใช้สำหรับสร้างสรุปรายงาน (Summary Report) และคำแนะนำทางธุรกิจแบบอัตโนมัติ |

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

# ไปที่ .env
backend -> .env

- get from 
```
https://ai.google.dev/

go to dashboard

```
```
GOOGLE_API_KEY=your_api
PORT=3001

```

```
docker-compose up --build -d
```
---

## 🐘 PostgreSQL Setup
```
docker exec -it postgres psql -U dicek -d mydb
```
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
-- Main Table
```
docker exec -it clickhouse_db clickhouse-client -u default --password 2546
```
```
CREATE TABLE sales_data
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
)
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

CREATE TABLE sales_data_ch
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
ENGINE = MergeTree()
ORDER BY id;

INSERT INTO sales_data_ch
SELECT * FROM sales_data_pg;
```
---

✅ This structure allows **efficient querying and analytics** across both PostgreSQL and ClickHouse.
It’s ideal for e-commerce **reporting, dashboarding, and analytics pipelines**.

---
---
## Generate Data

use this path to generate data
```
http://localhost:3000/genta
```
---

---

```
CREATE TABLE sales_summary_daily (
    date          date PRIMARY KEY,
    total_qty     integer,
    total_sales   numeric(12,2),
    total_profit  numeric(12,2),
    avg_discount  numeric(5,2)
);

INSERT INTO sales_summary_daily (date, total_qty, total_sales, total_profit, avg_discount)
SELECT
    date,
    SUM(quantity) AS total_qty,
    SUM(sales_amount) AS total_sales,
    SUM(profit) AS total_profit,
    AVG(discount) AS avg_discount
FROM sales_data_pg
GROUP BY date;
```
---

```
CREATE TABLE sales_summary_product (
    product_id    varchar(20),
    product_name  varchar(100),
    total_qty     integer,
    total_sales   numeric(12,2),
    total_profit  numeric(12,2),
    PRIMARY KEY (product_id)
);

INSERT INTO sales_summary_product (product_id, product_name, total_qty, total_sales, total_profit)
SELECT
    product_id,
    MAX(product_name) AS product_name,
    SUM(quantity) AS total_qty,
    SUM(sales_amount) AS total_sales,
    SUM(profit) AS total_profit
FROM sales_data_pg
GROUP BY product_id;
```

---

```
CREATE TABLE sales_summary_category (
    category      varchar(50) PRIMARY KEY,
    total_sales   numeric(12,2),
    total_profit  numeric(12,2)
);

INSERT INTO sales_summary_category (category, total_sales, total_profit)
SELECT
    category,
    SUM(sales_amount),
    SUM(profit)
FROM sales_data_pg
GROUP BY category;
```


---

```
CREATE TABLE sales_summary_region (
    region        varchar(50),
    store_city    varchar(50),
    total_sales   numeric(12,2),
    customers     integer,
    PRIMARY KEY (region, store_city)
);

INSERT INTO sales_summary_region (region, store_city, total_sales, customers)
SELECT
    region,
    store_city,
    SUM(sales_amount),
    COUNT(DISTINCT customer_id) AS customers
FROM sales_data_pg
GROUP BY region, store_city;
```


---

```
CREATE TABLE sales_summary_customer (
    gender        varchar(10) PRIMARY KEY,
    customers     integer,
    total_sales   numeric(12,2),
    avg_order     numeric(12,2)
);

INSERT INTO sales_summary_customer (gender, customers, total_sales, avg_order)
SELECT
    gender,
    COUNT(DISTINCT customer_id) AS customers,
    SUM(sales_amount) AS total_sales,
    SUM(sales_amount)::numeric / NULLIF(COUNT(DISTINCT customer_id),0) AS avg_order
FROM sales_data_pg
GROUP BY gender;
```


