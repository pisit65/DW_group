from clickhouse_connect import get_client

# Connect the same way as your insert script
client = get_client(
    host='localhost',
    port=8123,
    username='default',
    database='default'
)

print("=== Testing Connection ===")

# Check if we can see the test table created in CLI
try:
    result = client.query("SELECT * FROM test_connection")
    print(f"Found test_connection table with data: {result.result_rows}")
except Exception as e:
    print(f"Cannot see test_connection table: {e}")

# Create a table from Python and check
try:
    client.command("CREATE TABLE python_test (id UInt32) ENGINE = Memory")
    client.command("INSERT INTO python_test VALUES (999)")
    result = client.query("SELECT * FROM python_test")
    print(f"Created python_test table with data: {result.result_rows}")
except Exception as e:
    print(f"Error creating python_test: {e}")

# Check all tables again
try:
    result = client.query("SHOW TABLES")
    tables = [row[0] for row in result.result_rows]
    print(f"All tables visible from Python: {tables}")
except Exception as e:
    print(f"Error listing tables: {e}")