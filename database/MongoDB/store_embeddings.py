from pymongo import MongoClient
from sentence_transformers import SentenceTransformer

CONNECTION_STRING = "mongodb+srv://admin:Kiendien0205@shopping.ngrztip.mongodb.net/"

client = MongoClient(CONNECTION_STRING)
db = client['shopping']
collection = db["testing"]

model = SentenceTransformer('all-MiniLM-L6-v2')


# Create the embedding field if it does not exist
for doc in collection.find({"embedding": {"$exists": False}}):

    title = doc.get("title", "")
    description = doc.get("product_description", "")
    info = doc.get("info", "")

    combined_text = f"Title: {title}. Description: {description}. Info: {info}."
    vector = model.encode(combined_text).tolist()
    
    # Update the document with the new 'embedding' field
    collection.update_one(
        {"_id": doc["_id"]},
        {"$set": {"embedding": vector}}
    )
