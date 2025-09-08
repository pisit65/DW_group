

from openai import OpenAI

client = OpenAI(api_key="sk-proj") #<<add your API key here

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "สวัสดี ช่วยแนะนำตัวเองหน่อย"}
    ]
)

print(response.choices[0].message.content)
