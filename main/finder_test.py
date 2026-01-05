"""
The "Hybrid Search + Reranking" Approach (The Smart Filter)
This is the industry standard for e-commerce search (like Amazon or Algolia).

Step 1: Broad Retrieval (Recall): Use a loose search (FTS OR Vector) to grab the top 50-100 candidates. This ensures we don't miss anything relevant.
Step 2: LLM Reranking (Precision): Pass those 50 items (including their availability, info, description) to a fast LLM (like GPT-4o-mini or Haiku).
Step 3: Reasoning: The LLM analyzes the full context: "Item 1 is out of stock - discard. Item 2 is 'Octa-core' which means 8 threads - keep. Item 3 is too expensive - discard."
Pros: Extremely accurate. Can handle "8 cores" vs "Octa-core" and "compare to market" logic because the LLM sees the batch of products.
Cons: Higher latency (processing 50 items takes time) and cost.
"""


import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

try:
    connection = psycopg2.connect(
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        dbname=DBNAME
    )
    print("Connection successful!")
    
    cursor = connection.cursor()

    search_query = "rtx & 4060"
    sql_query_data = """
    SELECT asin, title, brand, price, rating, 
        ts_rank(fts, to_tsquery('english', %s)) as relevance
    FROM data
    WHERE fts @@ to_tsquery('english', %s)
    ORDER BY relevance DESC, rating DESC
    LIMIT 5;
    """

    cursor.execute(sql_query_data, (search_query, search_query))
    results = cursor.fetchall()
    
    if results:
        for row in results:
            print(f"\nASIN: {row[0]}")
            print(f"Title: {row[1]}")
            print(f"Brand: {row[2]}")
            print(f"Price: {row[3]}")
            print(f"Rating: {row[4]}")
            print(f"Relevance Score: {row[5]:.4f}")
    else:
        print("No results found.")
    
    cursor.close()
    connection.close()

except Exception as e:
    print(f"Failed to connect: {e}")