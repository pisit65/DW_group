# # import psycopg2
# # from faker import Faker
# # import random
# # from datetime import datetime, timedelta

# # fake = Faker()

# # # For local execution, use localhost instead of container hostname
# # conn = psycopg2.connect(
# #     host="localhost",      # Changed from "postgres" to "localhost"
# #     port=5432,             # This port is mapped in docker-compose.yml
# #     database="mydb",
# #     user="dicek",
# #     password="2546"
# # )
# # cur = conn.cursor()

# # # First, create the table if it doesn't exist
# # cur.execute("""
# #     CREATE TABLE IF NOT EXISTS sales_data (
# #         id SERIAL PRIMARY KEY,
# #         date DATE,
# #         product_id VARCHAR(50),
# #         product_name VARCHAR(100),
# #         category VARCHAR(50),
# #         brand VARCHAR(50),
# #         customer_id VARCHAR(50),
# #         customer_name VARCHAR(100),
# #         gender VARCHAR(10),
# #         region VARCHAR(50),
# #         store_id VARCHAR(50),
# #         store_name VARCHAR(100),
# #         store_city VARCHAR(50),
# #         quantity INTEGER,
# #         unit_price DECIMAL(10,2),
# #         discount DECIMAL(5,2),
# #         sales_amount DECIMAL(12,2),
# #         profit DECIMAL(12,2)
# #     )
# # """)

# # categories = ["Electronics", "Clothing", "Food", "Toys", "Books"]
# # brands = ["BrandA", "BrandB", "BrandC", "BrandD"]
# # regions = ["North", "South", "East", "West"]
# # stores = [
# #     {"id": "S001", "name": "Store1", "city": "Bangkok"},
# #     {"id": "S002", "name": "Store2", "city": "Chiang Mai"},
# #     {"id": "S003", "name": "Store3", "city": "Phuket"}
# # ]

# # def generate_sales_record():
# #     date = fake.date_between(start_date='-1y', end_date='today')
# #     product_id = fake.bothify(text="P###??")  # Removed unique to avoid conflicts
# #     product_name = fake.word().title()
# #     category = random.choice(categories)
# #     brand = random.choice(brands)
# #     customer_id = fake.bothify(text="C###??")  # Removed unique to avoid conflicts
# #     customer_name = fake.name()
# #     gender = random.choice(["Male", "Female"])
# #     region = random.choice(regions)
# #     store = random.choice(stores)
# #     quantity = random.randint(1, 20)
# #     unit_price = round(random.uniform(10, 1000), 2)
# #     discount = round(random.uniform(0, 30), 2)  # percentage
# #     sales_amount = round(quantity * unit_price * (1 - discount / 100), 2)
# #     profit = round(sales_amount * random.uniform(0.1, 0.3), 2)

# #     return (
# #         date, product_id, product_name, category, brand,
# #         customer_id, customer_name, gender, region,
# #         store["id"], store["name"], store["city"],
# #         quantity, unit_price, discount, sales_amount, profit
# #     )

# # num_records = 10  # กำหนดจำนวน record ที่ต้องการ
# # for i in range(num_records):
# #     try:
# #         record = generate_sales_record()
# #         cur.execute("""
# #             INSERT INTO sales_data (
# #                 date, product_id, product_name, category, brand,
# #                 customer_id, customer_name, gender, region,
# #                 store_id, store_name, store_city,
# #                 quantity, unit_price, discount, sales_amount, profit
# #             ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
# #         """, record)
        
# #         if (i + 1) % 100 == 0:
# #             print(f"Inserted {i + 1} records...")
            
# #     except Exception as e:
# #         print(f"Error inserting record {i + 1}: {e}")
# #         conn.rollback()  # <-- important
# #         continue

# # conn.commit()
# # cur.close()
# # conn.close()


# # print(f"{num_records} records inserted successfully!")



# import psycopg2
# from faker import Faker
# import random

# fake = Faker()

# # ตั้งค่า connection
# conn = psycopg2.connect(
#     host="postgres",  # ชื่อ container ของ PostgreSQL
#     port=5432,
#     database="mydb",
#     user="dicek",
#     password="2546"
# )


# cur = conn.cursor()

# # ตรวจสอบ schema ปัจจุบัน
# cur.execute("SELECT current_schema();")
# schema = cur.fetchone()[0]
# print(f"Current schema: {schema}")

# # ตรวจสอบ table
# cur.execute("""
#     SELECT column_name, data_type
#     FROM information_schema.columns
#     WHERE table_schema = 'public' AND table_name = 'sales_data';
# """)
# columns = cur.fetchall()
# print("Columns in sales_data:")
# for col in columns:
#     print(col)

# # ดูข้อมูลเก่า 10 record
# cur.execute("SELECT * FROM public.sales_data LIMIT 10;")
# rows = cur.fetchall()
# print("\nExisting records (up to 10):")
# for row in rows:
#     print(row)

# # --- ข้อมูลสำหรับสร้างใหม่ ---
# categories = ["Electronics", "Clothing", "Food", "Toys", "Books"]
# brands = ["BrandA", "BrandB", "BrandC", "BrandD"]
# regions = ["North", "South", "East", "West"]
# stores = [
#     {"id": "S001", "name": "Store1", "city": "Bangkok"},
#     {"id": "S002", "name": "Store2", "city": "Chiang Mai"},
#     {"id": "S003", "name": "Store3", "city": "Phuket"}
# ]

# def generate_sales_record():
#     # date = fake.date_between(start_date='-1m', end_date='today')
#     date = fake.date_between(start_date='-3m', end_date='today')
#     product_id = fake.bothify(text="P###??")
#     product_name = fake.word().title()
#     category = random.choice(categories)
#     brand = random.choice(brands)
#     customer_id = fake.bothify(text="C###??")
#     customer_name = fake.name()
#     gender = random.choice(["Male", "Female"])
#     region = random.choice(regions)
#     store = random.choice(stores)
#     quantity = random.randint(1, 20)
#     unit_price = round(random.uniform(10, 1000), 2)
#     discount = round(random.uniform(0, 30), 2)
#     sales_amount = round(quantity * unit_price * (1 - discount / 100), 2)
#     profit = round(sales_amount * random.uniform(0.1, 0.3), 2)

#     return (
#         date, product_id, product_name, category, brand,
#         customer_id, customer_name, gender, region,
#         store["id"], store["name"], store["city"],
#         quantity, unit_price, discount, sales_amount, profit
#     )

# # จำนวน record ที่ต้องการ insert
# num_records = 10
# inserted = 0

# for i in range(num_records):
#     try:
#         record = generate_sales_record()
#         cur.execute("""
#             INSERT INTO public.sales_data (
#                 date, productid, productname, category, brand,
#                 customerid, customername, gender, region,
#                 storeid, storename, storecity,
#                 quantity, unitprice, discount, salesamount, profit
#             ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
#         """, record)


#         inserted += 1
        
#         if inserted % 100 == 0:
#             print(f"Inserted {inserted} records...")
            
#     except Exception as e:
#         print(f"Error inserting record {i + 1}: {e}")
#         conn.rollback()  # clear transaction
#         continue

# conn.commit()
# cur.close()
# conn.close()

# print(f"{inserted} new records inserted successfully!")




import psycopg2
from faker import Faker
import random

fake = Faker()

# ตั้งค่า connection สำหรับ Docker
conn = psycopg2.connect(
    host="172.20.0.2",  # หรือชื่อ container PostgreSQL
    port=5432,
    database="mydb",
    user="dicek",
    password="2546"
)

cur = conn.cursor()

categories = ["Electronics", "Clothing", "Food", "Toys", "Books"]
brands = ["BrandA", "BrandB", "BrandC", "BrandD"]
regions = ["North", "South", "East", "West"]
stores = [
    {"id": "S001", "name": "Store1", "city": "Bangkok"},
    {"id": "S002", "name": "Store2", "city": "Chiang Mai"},
    {"id": "S003", "name": "Store3", "city": "Phuket"}
]

def generate_sales_record():
    date = fake.date_between(start_date='-3m', end_date='today')
    product_id = fake.bothify(text="P###??")
    product_name = fake.word().title()
    category = random.choice(categories)
    brand = random.choice(brands)
    customer_id = fake.bothify(text="C###??")
    customer_name = fake.name()
    gender = random.choice(["Male", "Female"])
    region = random.choice(regions)
    store = random.choice(stores)
    quantity = random.randint(1, 20)
    unit_price = round(random.uniform(10, 1000), 2)
    discount = round(random.uniform(0, 30), 2)
    sales_amount = round(quantity * unit_price * (1 - discount / 100), 2)
    profit = round(sales_amount * random.uniform(0.1, 0.3), 2)

    return (
        date, product_id, product_name, category, brand,
        customer_id, customer_name, gender, region,
        store["id"], store["name"], store["city"],
        quantity, unit_price, discount, sales_amount, profit
    )

num_records = 10
inserted = 0

for i in range(num_records):
    try:
        record = generate_sales_record()
        cur.execute("""
            INSERT INTO public.sales_data (
                date, product_id, product_name, category, brand,
                customer_id, customer_name, gender, region,
                store_id, store_name, store_city,
                quantity, unit_price, discount, sales_amount, profit
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, record)

        inserted += 1
        
    except Exception as e:
        print(f"Error inserting record {i + 1}: {e}")
        conn.rollback()
        continue

conn.commit()
cur.close()
conn.close()
print(f"{inserted} new records inserted successfully!")
