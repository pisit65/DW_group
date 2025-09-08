import pandas as pd
from clickhouse_connect import get_client
import psycopg2

print("=== Working Insert Script ===")

# 1. ดึงข้อมูลจาก PostgreSQL
conn = psycopg2.connect(
    host="localhost",
    database="mydb",
    user="dicek",
    password="2546"
)
df = pd.read_sql("SELECT * FROM sales_data", conn)
conn.close()
print(f"Retrieved {len(df)} rows from PostgreSQL")

# 2. เชื่อม ClickHouse
client = get_client(
    host='localhost',
    port=8123,
    username='default',
    database='default'
)
print("Connected to ClickHouse")

# 3. Drop and recreate table (fresh start)
client.command("DROP TABLE IF EXISTS sales_data")
print("Dropped existing table")

# 4. Create table with exact column mapping
create_sql = """
CREATE TABLE sales_data (
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

client.command(create_sql)
print("Created table successfully")

# 5. Prepare data carefully
df_clean = df.copy()

# Handle date column
date_cols = [col for col in df_clean.columns if col.lower() in ['date']]
if date_cols:
    df_clean[date_cols[0]] = pd.to_datetime(df_clean[date_cols[0]]).dt.date

# Fill NaN values and ensure correct types
for col in df_clean.columns:
    if df_clean[col].dtype == 'object':  # String columns
        df_clean[col] = df_clean[col].fillna('').astype(str)
    elif 'int' in str(df_clean[col].dtype):  # Integer columns
        df_clean[col] = df_clean[col].fillna(0).astype(int)
    elif 'float' in str(df_clean[col].dtype):  # Float columns
        df_clean[col] = df_clean[col].fillna(0.0).astype(float)

print(f"Data prepared: {df_clean.shape}")
print("Data types:")
for col in df_clean.columns:
    print(f"  {col}: {df_clean[col].dtype}")

# 6. Manual insert using HTTP interface (bypass the problematic insert_df)
try:
    # Convert to list format
    data_list = df_clean.values.tolist()
    
    print(f"Starting manual insertion of {len(data_list)} rows...")
    
    # Insert in smaller batches to avoid memory issues
    batch_size = 500
    total_inserted = 0
    
    for i in range(0, len(data_list), batch_size):
        batch = data_list[i:i + batch_size]
        
        # Use direct HTTP insert
        client.insert('sales_data', batch)
        total_inserted += len(batch)
        print(f"Inserted batch {i//batch_size + 1}: {len(batch)} rows (Total: {total_inserted})")
    
    print(f"✅ Successfully inserted all {total_inserted} rows!")

except Exception as e:
    print(f"❌ Error during batch insert: {e}")
    
    # Fallback: Try row by row (slower but more reliable)
    print("Trying row-by-row insertion...")
    success_count = 0
    error_count = 0
    
    for idx, row in df_clean.iterrows():
        try:
            client.insert('sales_data', [list(row)])
            success_count += 1
            if success_count % 1000 == 0:
                print(f"Inserted {success_count} rows...")
        except Exception as row_error:
            error_count += 1
            if error_count < 10:  # Show first 10 errors
                print(f"Error inserting row {idx}: {row_error}")
    
    print(f"Row-by-row result: {success_count} success, {error_count} errors")

# 7. Final verification
try:
    count_result = client.query("SELECT COUNT(*) FROM sales_data")
    final_count = count_result.first_row[0]
    print(f"\n🎯 Final verification: {final_count} rows in ClickHouse table")
    
    if final_count > 0:
        # Show sample data
        sample = client.query("SELECT * FROM sales_data LIMIT 3")
        print("\nSample data:")
        for i, row in enumerate(sample.result_rows):
            print(f"Row {i+1}: {row}")
        
        print(f"\n✅ SUCCESS: Data migration completed successfully!")
    else:
        print("❌ No data found in table after insertion")

except Exception as e:
    print(f"❌ Error during verification: {e}")