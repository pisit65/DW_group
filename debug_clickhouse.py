from clickhouse_connect import get_client

# Connect the same way as your insert script
client = get_client(
    host='localhost',
    port=8123,
    username='default',
    database='default'
)

print("=== ClickHouse Debug Info ===")

# Check current database
result = client.query("SELECT currentDatabase()")
current_db = result.first_row[0]
print(f"Current database: {current_db}")

# List all databases
result = client.query("SHOW DATABASES")
databases = [row[0] for row in result.result_rows]
print(f"Available databases: {databases}")

# List tables in current database
result = client.query("SHOW TABLES")
tables = [row[0] for row in result.result_rows]
print(f"Tables in {current_db}: {tables}")

# Search for sales_data table in all databases
result = client.query("SELECT database, name FROM system.tables WHERE name = 'sales_data'")
found_tables = result.result_rows
print(f"sales_data table found in: {found_tables}")

if found_tables:
    for db, table in found_tables:
        count_result = client.query(f"SELECT COUNT(*) FROM {db}.{table}")
        count = count_result.first_row[0]
        print(f"Rows in {db}.{table}: {count}")
else:
    print("sales_data table not found in any database!")

# List ALL tables in system
print("\n=== All Tables in System ===")
result = client.query("SELECT database, name, engine FROM system.tables")
all_tables = result.result_rows
for db, name, engine in all_tables:
    print(f"{db}.{name} ({engine})")