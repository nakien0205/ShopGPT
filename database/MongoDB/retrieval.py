from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
import time
from dotenv import load_dotenv
import os

load_dotenv('D:\Python\Projects\ShopGPT\.env')

CONNECTION_STRING = os.environ.get("CONNECTION_STRING")

all_fields = ["title", "product_description", 'availability', 'currency', 'info', 'price', 'rating', 'rating_count', 'return_policy', 'discount', 'brand', 'images']

model = SentenceTransformer('all-MiniLM-L6-v2')

client = MongoClient(CONNECTION_STRING)
# Target your specific database and collection
db = client['shopping']
collection = db['testing']

def _encode(query_text: str) -> tuple:
    """Return a cached embedding tuple for *query_text*.

    Storing as a tuple lets lru_cache work (numpy arrays are not hashable).
    Convert back to list before sending to MongoDB.
    """
    return tuple(model.encode(query_text).tolist())

def search_products_lexical(query_text, limit=5):
    """Lexical search using text index"""
    pipeline = [
        {
            "$search": {
                "index": "lexical",
                "text": {
                    "query": query_text,
                    "path": all_fields,
                    "fuzzy": {"maxEdits": 1} # Handles small typos
                }
            }
        },
        {
            # This stage helps you see the relevance score
            "$addFields": {
                "score": {"$meta": "searchScore"}
            }
        },
        {
            # Limit results for better performance
            "$limit": limit
        }
    ]
    
    results = collection.aggregate(pipeline)
    return list(results)

def search_products_vector(query_text, limit=5):
    """Vector search using embeddings"""
    # Generate embedding for the query (cached)
    query_embedding = list(_encode(query_text))
    
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector",
                "path": "embedding",  # Field name where embeddings are stored
                "queryVector": query_embedding,
                "numCandidates": limit * 10,  # Should be 10-20x limit
                "limit": limit
            }
        },
        {
            "$addFields": {
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]


    
    results = collection.aggregate(pipeline)
    return list(results)

def both(query_text, limit=5):
    """Hybrid search using Reciprocal Rank Fusion (RRF) to combine lexical and vector searches"""
    pipeline = [
        {
            "$search": {
                "index": "lexical",
                "text": {
                    "query": query_text,
                    "path": all_fields,
                    "fuzzy": {"maxEdits": 1} # Handles small typos
                }
            }
        },
        {
            # This stage helps you see the relevance score
            "$addFields": {
                "score": {"$meta": "searchScore"}
            }
        },
        {
            # Limit results for better performance
            "$limit": limit * 2
        }
    ]
    lexical_results = list(collection.aggregate(pipeline))

    query_embedding = list(_encode(query_text))
    
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector",
                "path": "embedding",  # Field name where embeddings are stored
                "queryVector": query_embedding,
                "numCandidates": limit * 10 * 2,  # Should be 10-20x limit
                "limit": limit * 2
            }
        },
        {
            "$addFields": {
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]
    vector_results = list(collection.aggregate(pipeline))
    
    # Reciprocal Rank Fusion scoring
    k = 60
    rrf_scores = {}
    
    for rank, doc in enumerate(lexical_results, start=1):
        l_data = {k: v for k, v in doc.items() if k in all_fields}
        doc_id = str(doc['_id'])

        rrf_scores[doc_id] = {
            'doc': l_data,
            'score': 0.8 / (k + rank)  # 0.8 weight for lexical since we only match the title
        }
    
    # Add vector results with weight
    for rank, doc in enumerate(vector_results, 1):
        v_data = {k: v for k, v in doc.items() if k in all_fields}
        doc_id = str(doc['_id'])

        vector_score = 1 / (k + rank)  # 1 weight for vector
        
        if doc_id in rrf_scores:
            rrf_scores[doc_id]['score'] += vector_score
        else:
            rrf_scores[doc_id] = {
                'doc': v_data,
                'score': vector_score
            }
    
    # Sort by combined score and return top results
    sorted_results = sorted(rrf_scores.values(), key=lambda x: x['score'], reverse=True)[:limit]

    return sorted_results

    # for item in sorted_results:
    #     item['doc']['score'] = item['score']
    
    # return [item['doc'] for item in sorted_results]

def comparision(search_term):
    # search_time = time.time()
    # print("=== Lexical Results ===")
    # results_lexical = search_products_lexical(search_term)
    # if not results_lexical:
    #     print(f"No results found for '{search_term}'")
    # else:
    #     for doc in results_lexical:
    #         print(f"Score: {doc.get('score'):.2f} | Name: {doc.get('title')}")
    #     print(f'Time: {time.time() - search_time}')
    #     print('=' * 70)
    #     print()


    # vector_time = time.time()
    # print("\n=== Vector Results ===")
    # results_vector = search_products_vector(search_term)
    # if not results_vector:
    #     print(f"No results found for '{search_term}'")
    # else:
    #     for doc in results_vector:
    #         print(f"Score: {doc.get('score'):.2f} | Name: {doc.get('title')}")
    #     print(f'Time: {time.time() - vector_time}')
    #     print('=' * 70)
    #     print()


    both_time = time.time()
    print("\n=== Lexical + Vector Results ===")
    result = both(search_term)
    if not result:
        print(f"No results found for '{search_term}'")
    else:
        for doc in result:
            print(f"Score: {doc.get('score'):.2f} | Name: {doc.get('title')}")
        print(f'Time: {time.time() - both_time}')
        print('=' * 70)
        print()