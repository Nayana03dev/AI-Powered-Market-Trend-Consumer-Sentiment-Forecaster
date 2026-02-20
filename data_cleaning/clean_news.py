import pandas as pd
import os


def clean_news_data():
    # Define file paths
    input_path = os.path.join("raw_data", "ev_news_data.csv")
    output_path = os.path.join("processed_data", "cleaned_news.csv")

    # Load raw news data
    news = pd.read_csv(input_path)

    print("Before cleaning:", news.shape)

    # 1️⃣ Remove rows with no title
    news = news.dropna(subset=["title"])

    # 2️⃣ Combine title + description (important for NLP)
    news["description"] = news["description"].fillna("")
    news["content"] = news["title"] + ". " + news["description"]

    # 3️⃣ Convert date format
    news["published_at"] = pd.to_datetime(news["published_at"], errors="coerce")

    # 🔹 Improvement: Remove rows where date conversion failed
    news = news.dropna(subset=["published_at"])

    # 4️⃣ Remove duplicates
    news = news.drop_duplicates(subset=["content"])

    # 5️⃣ Keep only required columns
    news = news[["content", "published_at", "source"]]

    # 6️⃣ Add source type column
    news["source_type"] = "news"

    print("After cleaning:", news.shape)

    # Save cleaned file
    news.to_csv(output_path, index=False)

    print("News cleaned and saved successfully!")


if __name__ == "__main__":
    clean_news_data()