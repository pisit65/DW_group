import requests

CLICKHOUSE_URL = "http://localhost:8123/?database=default"
r = requests.get(f"{CLICKHOUSE_URL}&query=SELECT * FROM sales_data LIMIT 10")
print(r.text)
