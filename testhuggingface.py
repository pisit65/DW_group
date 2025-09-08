
import requests
import time

API_TOKEN = ""  # ใส่ Token ที่เป็น Full access ของคุณ
model = "google/gemma-7b"

url = f"https://api-inference.huggingface.co/models/{model}"
headers = {"Authorization": f"Bearer {API_TOKEN}"}
data = {"inputs": "สวัสดีครับ คุณเป็นใคร?", "parameters": {"max_new_tokens": 50}}

# --- โค้ดที่ปรับปรุงแล้ว ---

def query_model(payload):
    response = requests.post(url, headers=headers, json=payload)
    return response

# ลองส่ง request ครั้งแรก
response = query_model(data)

# ถ้าเจอสถานะ 503 Service Unavailable (ซึ่งมักหมายถึงโมเดลกำลังโหลด)
# ให้รอแล้วลองใหม่
while response.status_code == 503:
    estimated_time = response.json().get("estimated_time", 20)
    print(f"Model is loading, waiting for {estimated_time:.2f} seconds...")
    time.sleep(estimated_time)
    response = query_model(data)

# ตรวจสอบสถานะสุดท้ายก่อนปริ้นท์
if response.status_code == 200:
    try:
        print(response.json())
    except requests.exceptions.JSONDecodeError:
        print("Failed to decode JSON, raw response text:")
        print(response.text)
else:
    print(f"Request failed with status code: {response.status_code}")
    print("Response content:")
    print(response.text)