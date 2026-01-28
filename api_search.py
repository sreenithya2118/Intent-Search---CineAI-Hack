import sys
import json

# Simple wrapper around semantic_search
from semantic_search import search

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No query provided"}))
        return

    query = sys.argv[1]
    results = search(query)

    print(json.dumps({
        "query": query,
        "results": results
    }))

if __name__ == "__main__":
    main()

