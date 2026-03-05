from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv('D:\Python\Projects\ShopGPT\.env')

CONNECTION_STRING = os.environ.get("CONNECTION_STRING")

client = MongoClient(CONNECTION_STRING)
db = client['shopping']
collection = db["testing"]

all_fields = ['title', 'price', 'discount', 'currency', 'brand', 'product_description', 'info', 'rating', 'rating_count', 'availability', 'return_policy']


def migrate_images_to_links():
    """
    Migrates the 'images' field to a flat list of URL strings.
    Handles two legacy formats:
      - List of dicts: [{"src": "url"}, ...]
      - Comma-separated string: "url1, url2, url3"
    """
    query = {"$or": [
        {"images": {"$elemMatch": {"src": {"$exists": True}}}},
        {"images": {"$type": "string"}},
    ]}
    docs = collection.find(query, {"_id": 1, "images": 1})

    updated = 0
    for doc in docs:
        raw = doc.get("images")
        if isinstance(raw, str):
            flat_links = [link.strip() for link in raw.split(",") if link.strip()]
        elif isinstance(raw, list):
            flat_links = [img["src"] for img in raw if isinstance(img, dict) and img.get("src")]
        else:
            continue

        collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"images": flat_links}}
        )
        updated += 1

    print(f"Migration complete: {updated} document(s) updated.")


if __name__ == "__main__":
    migrate_images_to_links()

