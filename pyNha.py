# from clickhouse_driver import Client

# client = Client(
#     host='127.0.0.1',   # ใช้ localhost
#     port=9000,
#     user='default',
#     password='2546',    # ต้องตรงกับ config
#     database='default'
# )

# result = client.execute("SELECT * FROM sales LIMIT 10")
# print(result)


from clickhouse_driver import Client
import json

client = Client(
    host='127.0.0.1',  # แทน clickhouse
    port=9000,
    user='default',
    password='2546',
    database='default'
)

result = client.execute("SELECT * FROM sales LIMIT 10")

# ดึง column names
columns = [desc[0] for desc in client.execute("DESCRIBE TABLE sales")]

# แปลงเป็น list ของ dict
data = [dict(zip(columns, row)) for row in result]

print(json.dumps(data, indent=2))
