from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
import time

CONNECTION_STRING = "mongodb+srv://admin:Kiendien0205@shopping.ngrztip.mongodb.net/"

all_fields = ["title", "product_description", 'availability', 'currency', 'info', 'price', 'rating', 'rating_count', 'return_policy']

model = SentenceTransformer('all-MiniLM-L6-v2')

client = MongoClient(CONNECTION_STRING)
# Target your specific database and collection
db = client['shopping']
collection = db['testing']

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
    # Generate embedding for the query
    query_embedding = model.encode(query_text).tolist()
    
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
    # Get results from both search methods
    lexical_results = search_products_lexical(query_text, limit=limit * 2)
    vector_results = search_products_vector(query_text, limit=limit * 2)
    
    # Reciprocal Rank Fusion (RRF) scoring
    k = 60  # constant for RRF formula
    rrf_scores = {}
    
    # Score lexical results with weight
    for rank, doc in enumerate(lexical_results, start=1):
        doc_id = str(doc['_id'])
        rrf_scores[doc_id] = {
            'doc': doc,
            'score': 0.8 / (k + rank)  # 0.8 weight for lexical
        }
    
    # Add vector results with weight
    for rank, doc in enumerate(vector_results, start=1):
        doc_id = str(doc['_id'])
        vector_score = 1.0 / (k + rank)  # 1.0 weight for vector
        
        if doc_id in rrf_scores:
            rrf_scores[doc_id]['score'] += vector_score
        else:
            rrf_scores[doc_id] = {
                'doc': doc,
                'score': vector_score
            }
    
    # Sort by combined score and return top results
    sorted_results = sorted(rrf_scores.values(), key=lambda x: x['score'], reverse=True)[:limit]
    
    # Add score to each document
    for item in sorted_results:
        item['doc']['score'] = item['score']
    
    return [item['doc'] for item in sorted_results]

def comparision(search_term):
    search_time = time.time()
    print("=== Lexical Results ===")
    results_lexical = search_products_lexical(search_term)
    if not results_lexical:
        print(f"No results found for '{search_term}'")
    else:
        for doc in results_lexical:
            print(f"Score: {doc.get('score'):.2f} | Name: {doc.get('title')}")
        print(f'Time: {time.time() - search_time}')

    vector_time = time.time()
    print("\n=== Vector Results ===")
    results_vector = search_products_vector(search_term)
    if not results_vector:
        print(f"No results found for '{search_term}'")
    else:
        for doc in results_vector:
            print(f"Score: {doc.get('score'):.2f} | Name: {doc.get('title')}")
        print(f'Time: {time.time() - vector_time}')

    both_time = time.time()
    print("\n=== Lexical + Vector Results ===")
    result = both(search_term)
    if not result:
        print(f"No results found for '{search_term}'")
    else:
        for doc in result:
            print(f"Score: {doc.get('score'):.2f} | Name: {doc.get('title')}")
        print(f'Time: {time.time() - both_time}')

search_term = "RTX 4060"
comparision(search_term)
client.close()