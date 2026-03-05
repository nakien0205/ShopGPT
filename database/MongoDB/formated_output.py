from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv('D:\Python\Projects\ShopGPT\.env')

CONNECTION_STRING = os.environ.get("CONNECTION_STRING")

all_fields = ['title', 'price', 'discount', 'currency', 'brand', 'product_description', 'info', 'rating', 'rating_count', 'availability', 'return_policy', 'images']


def get_product_data(products_data):
    """
    Formats product data into a text prompt for LLM to determine the best product.
    Handles missing fields and deduplicates products.
    
    Args:
        products_data: List of product documents from database query (output of both())
        
    Returns:
        str: Formatted prompt for LLM
    """

    # Deduplicate products based on title (case-insensitive)
    seen_titles = set()
    unique_products = []
    
    for item in products_data:
        metadata = item.get('doc', {})
        title = metadata.get('title', '').strip().lower()
        
        # Skip if we've seen this title or if it's empty
        if title and title not in seen_titles:
            seen_titles.add(title)
            unique_products.append(metadata)
    
    # Format each product
    prompt_parts = []
    
    # Format each product
    for idx, product in enumerate(unique_products, 1):
        # Title
        title = product.get('title', 'Untitled Product')
        prompt_parts.append(f"\n### Product {idx + 1}: {title}")
        
        # Price and Currency
        price = product.get('price', 'N/A')
        currency = product.get('currency', '')
        if price != 'N/A' and currency:
            prompt_parts.append(f"- **Price:** {currency} {price}")
        elif price != 'N/A':
            prompt_parts.append(f"- **Price:** {price}")
        else:
            prompt_parts.append(f"- **Price:** Not available")
        
        # Specs (from info field)
        specs = product.get('info', '').strip()
        if specs:
            # Truncate if too long
            if len(specs) > 200:
                specs = specs[:200] + "..."
            prompt_parts.append(f"- **Specs:** {specs}")
        else:
            prompt_parts.append(f"- **Specs:** Not available")
        
        # Description (shortened)
        description = product.get('product_description', '').strip()
        if description:
            # Truncate to 300 chars for shortened version
            if len(description) > 300:
                description = description[:300] + "..."
            prompt_parts.append(f"- **Description:** {description}")
        else:
            prompt_parts.append(f"- **Description:** Not available")
        
        # Rating (as additional info)
        rating = product.get('rating')
        rating_count = product.get('rating_count')
        if rating and rating_count:
            prompt_parts.append(f"- **Rating:** {rating}/5 ({rating_count} reviews)")
        elif rating:
            prompt_parts.append(f"- **Rating:** {rating}/5")
        
        # Availability
        availability = product.get('availability', '').strip()
        if availability and availability != 'N/A':
            prompt_parts.append(f"- **Availability:** {availability}")
        
        # Return Policy
        return_policy = product.get('return_policy', '').strip()
        if return_policy:
            prompt_parts.append(f"- **Return Policy:** {return_policy}")
    
    return "\n".join(prompt_parts)


# Example usage
# if __name__ == "__main__":
#     client = MongoClient(CONNECTION_STRING)
#     db = client['shopping']
#     collection = db['testing']
#     search_term = "RTX 4060"
#     llm_prompt = get_product_data(search_term)
#     print(llm_prompt)
#     client.close()

