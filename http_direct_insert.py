import pandas as pd
import psycopg2
import requests
import io
import time # We'll keep the pause for testing if needed

print("=== Direct HTTP Insert Method ===")

# 1. ดึงข้อมูลจาก PostgreSQL
try:
    conn = psycopg2.connect(
        host="localhost",
        database="mydb",
        user="dicek",
        password="2546"
    )
    df = pd.read_sql("SELECT * FROM sales_data", conn)
    conn.close()
    print(f"Retrieved {len(df)} rows from PostgreSQL")
except Exception as e:
    print(f"❌ Error connecting to PostgreSQL: {e}")
    exit(1)


# 2. Prepare ClickHouse HTTP connection
# Be explicit about the database in the connection URL
CLICKHOUSE_DATABASE = "default"
clickhouse_url = f"http://localhost:8123/?database={CLICKHOUSE_DATABASE}"
headers = {'Content-Type': 'application/octet-stream'}


# 3. Drop and create table using HTTP
# Be explicit about the database in the SQL
drop_sql = f"DROP TABLE IF EXISTS {CLICKHOUSE_DATABASE}.sales_data"
create_sql = f"""
CREATE TABLE {CLICKHOUSE_DATABASE}.sales_data (
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

try:
    # Drop table
    response = requests.post(clickhouse_url, data=drop_sql, headers=headers)
    print(f"Drop table response: {response.status_code}")
    if response.status_code != 200:
        print(f"Drop table error: {response.text}")


    # Create table
    response = requests.post(clickhouse_url, data=create_sql, headers=headers)
    print(f"Create table response: {response.status_code}")

    if response.status_code == 200:
        print("✅ Table created successfully")
    else:
        print(f"❌ Error creating table: {response.text}")
        exit(1)

except Exception as e:
    print(f"❌ Error with table operations: {e}")
    exit(1)


# 4. Prepare data (No changes needed in this section)
df_clean = df.copy()
# A simpler way to handle case-insensitivity from source
df_clean.columns = [col.capitalize() for col in df_clean.columns]
if 'Date' in df_clean.columns:
    df_clean['Date'] = pd.to_datetime(df_clean['Date']).dt.strftime('%Y-%m-%d')
df_clean = df_clean.fillna({
    'Productid': '', 'Productname': '', 'Category': '', 'Brand': '',
    'Customerid': '', 'Customername': '', 'Gender': '', 'Region': '',
    'Storeid': '', 'Storename': '', 'Storecity': '',
    'Quantity': 0, 'Unitprice': 0.0, 'Discount': 0.0, 'Salesamount': 0.0, 'Profit': 0.0
})
print(f"Data prepared: {df_clean.shape}")


# 5. Convert to CSV format and insert via HTTP
try:
    csv_buffer = io.StringIO()
    # Using the lineterminator argument for older pandas versions
    df_clean.to_csv(csv_buffer, sep='\t', header=False, index=False,
                    date_format='%Y-%m-%d', float_format='%.6f',
                    lineterminator='\n')
    csv_data = csv_buffer.getvalue()
    print(f"Prepared CSV data: {len(csv_data)} characters")

    # Be explicit about the database and table in the insert URL
    insert_url = f"{clickhouse_url}&query=INSERT INTO {CLICKHOUSE_DATABASE}.sales_data FORMAT TabSeparated"
    response = requests.post(insert_url, data=csv_data.encode('utf-8'), headers=headers)

    if response.status_code == 200:
        print("✅ Data inserted successfully via HTTP!")
    else:
        print(f"❌ Error inserting data: {response.status_code} - {response.text}")

except Exception as e:
    print(f"❌ Error during HTTP insertion: {e}")


# 6. Verify insertion
try:
    # Be explicit about the database in the verification URL
    verify_url = f"{clickhouse_url}&query=SELECT COUNT(*) FROM {CLICKHOUSE_DATABASE}.sales_data"
    response = requests.get(verify_url)

    if response.status_code == 200:
        count = int(response.text.strip())
        print(f"🎯 Verification: {count} rows in ClickHouse")

        if count > 0:
            print(f"\n✅ SUCCESS: {count} rows migrated successfully!")
        else:
            print("❌ No data found in table")
    else:
        print(f"❌ Error verifying data: {response.text}")

except Exception as e:
    print(f"❌ Error during verification: {e}")
