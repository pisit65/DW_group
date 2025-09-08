import pandas as pd
import requests
import io

# ==========================
# 1. เตรียมข้อมูลตัวอย่าง
# ==========================
df = pd.DataFrame({
    "Date": ["2025-09-02"],
    "ProductID": ["P001"],
    "ProductName": ["Example Product"],
    "Category": ["CategoryA"],
    "Brand": ["BrandX"],
    "CustomerID": ["C001"],
    "CustomerName": ["John Doe"],
    "Gender": ["M"],
    "Region": ["North"],
    "StoreID": ["S001"],
    "StoreName": ["StoreA"],
    "StoreCity": ["CityX"],
    "Quantity": [10],
    "UnitPrice": [99.99],
    "Discount": [0.0],
    "SalesAmount": [999.9],
    "Profit": [200.0]
})

# ===================================
# 2. กำหนด ClickHouse HTTP URL
# ===================================
CLICKHOUSE_DATABASE = "default"
CLICKHOUSE_URL = f"http://localhost:9000/?database={CLICKHOUSE_DATABASE}"
HEADERS = {'Content-Type': 'application/octet-stream'}

# ===================================
# 3. สร้าง table ถ้ายังไม่มี
# ===================================
create_sql = """
CREATE TABLE IF NOT EXISTS default.sales_data (
    Date Date,
    ProductID String,
    ProductName String,
    Category String,
    Brand String,
    CustomerID String,
    CustomerName String,
    Gender String,
    Region String,
    StoreID String,
    StoreName String,
    StoreCity String,
    Quantity UInt32,
    UnitPrice Float64,
    Discount Float64,
    SalesAmount Float64,
    Profit Float64
) ENGINE = MergeTree()
ORDER BY Date
"""

response = requests.post(f"{CLICKHOUSE_URL}&query={create_sql}", headers=HEADERS)
if response.status_code == 200:
    print("✅ Table created (or already exists)!")
else:
    print(f"❌ Error creating table: {response.text}")
    exit(1)

# ===================================
# 4. เตรียม CSV data (TabSeparated)
# ===================================
csv_buffer = io.StringIO()
df.to_csv(csv_buffer, sep='\t', header=False, index=False,
          date_format='%Y-%m-%d', float_format='%.6f', lineterminator='\n')
csv_data = csv_buffer.getvalue()

# ===================================
# 5. Insert ผ่าน HTTP
# ===================================
insert_url = f"{CLICKHOUSE_URL}&query=INSERT INTO {CLICKHOUSE_DATABASE}.sales_data FORMAT TabSeparated"
response = requests.post(insert_url, data=csv_data.encode('utf-8'), headers=HEADERS)

if response.status_code == 200:
    print("✅ Data inserted successfully!")
else:
    print(f"❌ Error inserting data: {response.status_code} - {response.text}")
    exit(1)

# ===================================
# 6. Verify insertion
# ===================================
verify_url = f"{CLICKHOUSE_URL}&query=SELECT COUNT(*) FROM {CLICKHOUSE_DATABASE}.sales_data"
response = requests.get(verify_url)
if response.status_code == 200:
    count = int(response.text.strip())
    print(f"🎯 Verification: {count} rows in ClickHouse")
else:
    print(f"❌ Error verifying data: {response.text}")
