# rag_generator.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Ollama configuration
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:1b")

def call_ollama(prompt, system_message="You are a helpful assistant.", max_tokens=150):
    """Call local Ollama LLM"""
    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/chat",
            json={
                "model": OLLAMA_MODEL,
                "messages": [
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                "options": {
                    "temperature": 0.7,
                    "num_predict": max_tokens
                }
            },
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        return result.get("message", {}).get("content", "").strip()
    except requests.exceptions.ConnectionError:
        print(f"⚠️ Cannot connect to Ollama at {OLLAMA_URL}. Make sure Ollama is running.")
        return None
    except requests.exceptions.Timeout:
        print(f"⚠️ Ollama request timed out. Model might be loading or too slow.")
        return None
    except Exception as e:
        print(f"⚠️ Ollama error: {e}")
        return None

def generate_explanation(query, search_results):
    """Generate natural language explanation of search results"""
    
    if not search_results:
        return "No matching moments found. Try rephrasing your query or using different keywords."
    
    # Build context from results
    context_parts = []
    for i, result in enumerate(search_results[:5], 1):
        context_parts.append(
            f"{i}. At {result['start']:.1f}s-{result['end']:.1f}s: "
            f"'{result['caption']}' (relevance: {result['score']:.0%})"
        )
    
    context = "\n".join(context_parts)
    
    # Create prompt
    prompt = f"""You are a helpful video search assistant. A user searched for: "{query}"

Found {len(search_results)} matching video moments:
{context}

Provide a concise, friendly explanation (2-3 sentences) that:
1. Confirms what was found
2. Highlights why the top result matches the query
3. Mentions the relevance score

Be conversational and helpful."""

    # Try Ollama first
    explanation = call_ollama(
        prompt,
        system_message="You are a helpful video search assistant.",
        max_tokens=150
    )
    
    # Fallback if Ollama fails
    if not explanation:
        if search_results:
            return f"Found {len(search_results)} matching moments. Top result: '{search_results[0]['caption']}' at {search_results[0]['start']:.1f}s with {search_results[0]['score']:.0%} relevance."
        return "No results found."
    
    return explanation

def generate_suggestions(query, search_results):
    """Generate query suggestions"""
    
    if not search_results:
        prompt = f"""User searched for: "{query}" but found no results.

Suggest 3 alternative search queries that might work better. Consider:
- More general terms
- Different emotional descriptors
- Synonyms

Return only the 3 suggestions, one per line."""
    else:
        prompt = f"""User searched for: "{query}" and found relevant results.

Suggest 3 related queries that might also be interesting:
- Similar emotional states
- Related actions
- Temporal variations (before/after)

Return only the 3 suggestions, one per line."""

    # Try Ollama
    response = call_ollama(
        prompt,
        system_message="You are a helpful search assistant.",
        max_tokens=100
    )
    
    if response:
        suggestions = response.strip().split("\n")
        cleaned = [s.strip("- ").strip().strip('"').strip("'") for s in suggestions if s.strip()]
        return cleaned[:3] if cleaned else [
            "Try a more general query",
            "Use different keywords",
            "Search for related concepts"
        ]
    
    # Fallback
    if not search_results:
        return [
            "Try a more general query",
            "Use different keywords",
            "Search for related concepts"
        ]
    else:
        return [
            f"Similar to '{query}' but more specific",
            "Related emotional states",
            "Temporal variations (before/after)"
        ]

def generate_summary(query, search_results):
    """Generate summary of all results"""
    
    if not search_results:
        return "No results found."
    
    time_range = f"{search_results[0]['start']:.1f}s to {search_results[-1]['end']:.1f}s"
    avg_score = sum(r['score'] for r in search_results) / len(search_results)
    
    return f"Found {len(search_results)} relevant moments ({time_range}) with average relevance of {avg_score:.0%}."
