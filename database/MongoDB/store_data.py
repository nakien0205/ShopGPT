from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
import pandas as pd
from dotenv import load_dotenv
import os

load_dotenv('D:\Python\Projects\ShopGPT\.env')

CONNECTION_STRING = os.environ.get("CONNECTION_STRING")

model = SentenceTransformer('all-MiniLM-L6-v2')

client = MongoClient(CONNECTION_STRING)
# Target your specific database and collection
db = client['shopping']
collection = db['testing']

def read_csv(path):
    df = pd.read_csv(path)
    data = df.to_dict('records')

    collection.insert_many(data)