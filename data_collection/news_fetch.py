import requests
import pandas as pd

# 🔐 Put your NEW API key here
API_KEY = "ba879e606f7743eaae643a01f1ed991c"

url = "https://newsapi.org/v2/everything"

params = {
    "q": "electric vehicle",
    "language": "en",
    "sortBy": "publishedAt",
    "pageSize": 50,
    "apiKey": API_KEY
}

response = requests.get(url, params=params)
data = response.json()

if data["status"] != "ok":
    print("Error:", data)
else:
    articles = data["articles"]

    news_data = []

    for article in articles:
        news_data.append({
            "title": article["title"],
            "description": article["description"],
            "source": article["source"]["name"],
            "published_at": article["publishedAt"],
            "url": article["url"]
        })

    df = pd.DataFrame(news_data)
    df.to_csv("ev_news_data.csv", index=False)

    print("✅ News data saved successfully!")
