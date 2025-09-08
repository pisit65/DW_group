import pandas as pd
import random
from datetime import datetime, timedelta

# สร้าง sample dataset
num_rows = 30

# กำหนดวันเริ่มต้น
start_date = datetime(2024, 1, 1)

# ตัวอย่างมิติ
products = [
    ("P001", "Laptop", "Electronics", "Dell"),
    ("P002", "Smartphone", "Electronics", "Samsung"),
    ("P003", "Shoes", "Fashion", "Nike"),
    ("P004", "Backpack", "Fashion", "Adidas"),
    ("P005", "Headphones", "Electronics", "Sony"),
]

customers = [
    ("C001", "Alice", "Female", "Bangkok"),
    ("C002", "Bob", "Male", "Chiang Mai"),
    ("C003", "Charlie", "Male", "Khon Kaen"),
    ("C004", "Diana", "Female", "Phuket"),
    ("C005", "Ethan", "Male", "Ubon Ratchathani"),
]

stores = [
    ("S001", "CentralWorld", "Bangkok"),
    ("S002", "Maya", "Chiang Mai"),
    ("S003", "Terminal21", "Khon Kaen"),
    ("S004", "Jungceylon", "Phuket"),
    ("S005", "BigC", "Ubon Ratchathani"),
]

# สร้างข้อมูล FactSales
data = []
for i in range(num_rows):
    date = start_date + timedelta(days=random.randint(0, 60))
    product = random.choice(products)
    customer = random.choice(customers)
    store = random.choice(stores)
    quantity = random.randint(1, 5)
    unit_price = random.randint(500, 30000)
    discount = random.choice([0, 0.05, 0.1, 0.15])
    sales_amount = quantity * unit_price * (1 - discount)
    profit = sales_amount * random.uniform(0.1, 0.3)
    
    data.append([
        date.date(), product[0], product[1], product[2], product[3],
        customer[0], customer[1], customer[2], customer[3],
        store[0], store[1], store[2],
        quantity, unit_price, discount, round(sales_amount, 2), round(profit, 2)
    ])

columns = [
    "Date", "ProductID", "ProductName", "Category", "Brand",
    "CustomerID", "CustomerName", "Gender", "Region",
    "StoreID", "StoreName", "StoreCity",
    "Quantity", "UnitPrice", "Discount", "SalesAmount", "Profit"
]

df = pd.DataFrame(data, columns=columns)

df.to_csv("sample_sales_data.csv", index=False)
# import caas_jupyter_tools
# caas_jupyter_tools.display_dataframe_to_user("Sample Sales Dataset", df)
