import pandas as pd
from clickhouse_connect import get_client
import psycopg2

# 1. ดึงข้อมูลจาก PostgreSQL
conn = psycopg2.connect(
    host="localhost",
    database="mydb",
    user="dicek",
    password="2546"
)
df = pd.read_sql("SELECT * FROM sales_data", conn)
conn.close()

# 2. เชื่อม ClickHouse - explicitly specify default database
client = get_client(
    host='localhost',
    port=8123,
    username='default',
    database='default'
)
print("Connected to ClickHouse")

# 3. Verify we're in the right database
current_db = client.query("SELECT currentDatabase()").first_row[0]
print(f"Current database: {current_db}")

# 4. Drop and create table with explicit database reference
try:
    client.command("DROP TABLE IF EXISTS default.sales_data")
    print("Dropped existing table from default database")
except:
    pass

create_table_sql = """
CREATE TABLE default.sales_data (
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

client.command(create_table_sql)
print("Created table in default database")

# 5. Verify table creation immediately
try:
    tables = client.query("SHOW TABLES FROM default").result_rows
    print(f"Tables in default database: {[row[0] for row in tables]}")
except Exception as e:
    print(f"Error checking tables: {e}")

# 6. Prepare data
df_clean = df.copy()
if 'date' in df_clean.columns:
    df_clean['date'] = pd.to_datetime(df_clean['date']).dt.date
elif 'Date' in df_clean.columns:
    df_clean['Date'] = pd.to_datetime(df_clean['Date']).dt.date

df_clean = df_clean.fillna({
    'ProductID': '', 'ProductName': '', 'Category': '', 'Brand': '',
    'CustomerID': '', 'CustomerName': '', 'Gender': '', 'Region': '',
    'StoreID': '', 'StoreName': '', 'StoreCity': '',
    'Quantity': 0, 'UnitPrice': 0.0, 'Discount': 0.0, 'SalesAmount': 0.0, 'Profit': 0.0
})

print(f"Data shape: {df_clean.shape}")

# 7. Insert data with explicit table reference
try:
    data_tuples = [tuple(row) for row in df_clean.values]
    batch_size = 1000
    total_rows = len(data_tuples)
    
    for i in range(0, total_rows, batch_size):
        batch = data_tuples[i:i + batch_size]
        client.insert('default.sales_data', batch)  # Explicit database.table
        print(f"Inserted batch {i//batch_size + 1}: {len(batch)} rows")
    
    print(f"Successfully inserted {total_rows} rows")

    # Immediate verification
    result = client.query("SELECT COUNT(*) FROM default.sales_data")
    count = result.first_row[0]
    print(f"Verification: {count} rows in default.sales_data")

    # Show sample data
    sample = client.query("SELECT * FROM default.sales_data LIMIT 3")
    print("Sample data:")
    for row in sample.result_rows:
        print(row)

except Exception as e:
    print(f"Error during insertion: {e}")