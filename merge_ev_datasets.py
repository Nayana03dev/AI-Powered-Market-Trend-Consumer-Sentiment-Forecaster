import os
import pandas as pd
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ===============================
# 1️⃣ Load Cleaned News
# ===============================
news_path = os.path.join(BASE_DIR, 'processed_data', 'cleaned_news.csv')
news_df = pd.read_csv(news_path)

# Map news columns to unified format
news_df = news_df.rename(columns={
    "content": "text",
    "published_at": "date",
    "source_type": "product_name"  # or None if not relevant
})
news_df['source'] = 'news'
news_df['rating'] = None
# Ensure all final columns exist
for col in ['text','product_name','rating','date','source']:
    if col not in news_df.columns:
        news_df[col] = None

# ===============================
# 2️⃣ Load Reviews from SQLite
# ===============================
db_path = os.path.join(BASE_DIR, 'ev_database.db')
conn = sqlite3.connect(db_path)

# Update this to your actual review table name
review_table_name = 'ev_reviews'

# Load table
reviews_df = pd.read_sql_query(f"SELECT * FROM {review_table_name}", conn)
conn.close()

# Map review columns to unified format
reviews_df = reviews_df.rename(columns={
    "review": "text",
    "model_name": "product_name",
    "ingestion_date": "date"
})
reviews_df['source'] = 'review'

# Ensure rating exists
if 'rating' not in reviews_df.columns:
    reviews_df['rating'] = None

# Ensure all final columns exist
for col in ['text','product_name','rating','date','source']:
    if col not in reviews_df.columns:
        reviews_df[col] = None

# ===============================
# 3️⃣ Merge News & Reviews
# ===============================
columns = ['source','text','product_name','rating','date']
final_df = pd.concat([news_df[columns], reviews_df[columns]], ignore_index=True)

# ===============================
# 4️⃣ Save Unified Dataset
# ===============================
output_path = os.path.join(BASE_DIR, 'processed_data', 'final_ev_dataset.csv')
final_df.to_csv(output_path, index=False)
print(f"✅ Unified EV dataset saved at {output_path}")