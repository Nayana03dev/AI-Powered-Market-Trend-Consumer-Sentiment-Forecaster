import pandas as pd
import sqlite3
from datetime import datetime

# STEP 1: Load the three CSV files
df1 = pd.read_csv("raw_data/2-wheeler-EV-bikewale.csv")
df2 = pd.read_csv("raw_data/4-wheeler-EV-cardekho.csv")
df3 = pd.read_csv("raw_data/4-wheeler-EV-carwale.csv")

# STEP 2: Add source column 
df1["source"] = "bikewale"
df2["source"] = "cardekho"
df3["source"] = "carwale"

# STEP 3: Combine all datasets
df = pd.concat([df1, df2, df3], ignore_index=True)

# STEP 4: Print combined data
print("Combined Data:")
print(df.head())

#CLEANING DATA

# Remove duplicate rows
df = df.drop_duplicates()

# Remove rows where review column is empty
df = df.dropna(subset=["review"])

# Clean column names
df.columns = df.columns.str.strip()
df.columns = df.columns.str.lower()
df.columns = df.columns.str.replace(" ", "_")

# Remove duplicate columns
df = df.loc[:, ~df.columns.duplicated()]

# Reset index
df = df.reset_index(drop=True)

print("After Cleaning:")
print(df.head())


# Add vehicle ID
df["vehicle_id"] = range(1, len(df) + 1)

# Add ingestion date
df["ingestion_date"] = datetime.now()

print("Schema Added:")
print(df.head())

# Save final dataset
df.to_csv("processed_data/final_ev_dataset.csv", index=False)

print("Final structured dataset saved successfully!")

# STEP 7: Store in SQLite database 
conn = sqlite3.connect("ev_database.db")
df.to_sql("ev_reviews", conn, if_exists="replace", index=False)
conn.close()

print("Data stored in database successfully!")

# print("Bikewale Data:")
# print(df1.head())

# print("Cardekho Data:")
# print(df2.head())

# print("Carwale Data:")
# print(df3.head())
