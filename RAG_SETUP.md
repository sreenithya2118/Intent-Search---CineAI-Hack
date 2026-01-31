# 🚀 RAG Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `openai` - For LLM API calls
- `chromadb` - Vector database for embeddings
- `python-dotenv` - Environment variable management

### 2. Set Up OpenAI API Key

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your-api-key-here
```

**Get your API key:**
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy it to your `.env` file

**Note:** The API key is required for RAG functionality. Without it, RAG will fall back to basic explanations.

### 3. Process a Video

1. Start the backend:
```bash
uvicorn app:app --reload
```

2. Open the frontend:
```bash
python -m http.server 5500
```

3. Load a video through the UI (paste YouTube URL and click "Load Video")
4. Wait for processing to complete

### 4. Test RAG Search

Once video is processed:
- Use the **RAG-Enhanced Search** section in the UI
- Enter a query like: "hesitant reaction before answering"
- Click "RAG Search"
- You'll see:
  - AI-generated explanation
  - Summary of results
  - Suggested alternative queries
  - Video clips with metadata

---

## How It Works

### Architecture

```
User Query
    ↓
[Vector Database] → Find similar captions (ChromaDB)
    ↓
[Intent Search] → Apply temporal adjustments (before/after/during)
    ↓
[LLM Generator] → Generate explanations & suggestions (OpenAI)
    ↓
Enhanced Results
```

### Files Created

1. **`vector_store.py`** - Manages ChromaDB vector database
   - Stores caption embeddings persistently
   - Enables fast similarity search
   - Handles multiple videos (future)

2. **`rag_generator.py`** - LLM integration
   - Generates natural language explanations
   - Creates query suggestions
   - Provides result summaries

3. **`rag_search.py`** - RAG wrapper
   - Combines retrieval + generation
   - Applies temporal intent logic
   - Returns enhanced results

### API Endpoints

**New Endpoint:**
- `POST /rag-search?query=<your-query>` - RAG-enhanced search

**Existing Endpoints (still work):**
- `POST /search?query=<query>` - Basic semantic search
- `POST /intent-search?query=<query>` - Intent-based search

---

## Troubleshooting

### Issue: "OpenAI API key not found"
**Solution:** 
- Check `.env` file exists in project root
- Verify `OPENAI_API_KEY=your-key` is set
- Restart the server after creating `.env`

### Issue: "Vector database is empty"
**Solution:**
- Process a video first (this loads captions into vector DB)
- Or manually run: `python -c "from vector_store import load_captions_to_vector_db; load_captions_to_vector_db()"`

### Issue: "RAG search returns error"
**Solution:**
- Check backend logs for error messages
- Verify OpenAI API key is valid
- Check internet connection (API calls require internet)
- If API fails, RAG falls back to basic explanations

### Issue: "ChromaDB errors"
**Solution:**
- Delete `./chroma_db` folder and reprocess video
- Check disk space
- Verify ChromaDB is installed: `pip install chromadb`

---

## Cost Considerations

### OpenAI API Costs (GPT-3.5-turbo)
- **Per search:** ~$0.001-0.002 (very cheap)
- **1000 searches:** ~$1-2
- **Free tier:** $5 credit for new users

### Free Alternatives

If you want to avoid API costs, you can:
1. Use the existing `/intent-search` endpoint (no LLM)
2. Modify `rag_generator.py` to use a local LLM (requires GPU)

---

## Advanced Configuration

### Change LLM Model

Edit `.env`:
```env
OPENAI_MODEL=gpt-4  # Default is gpt-3.5-turbo
```

### Adjust Search Threshold

Edit `rag_search.py`:
```python
search_results = search_vector_db(query, top_k=10, threshold=0.4)  # Change threshold
```

### Customize Explanations

Edit `rag_generator.py` - modify the prompts in:
- `generate_explanation()`
- `generate_suggestions()`

---

## Testing

### Test Vector Database
```python
from vector_store import load_captions_to_vector_db, search_vector_db

# Load captions
load_captions_to_vector_db()

# Test search
results = search_vector_db("hesitant reaction")
print(results)
```

### Test RAG Search
```bash
curl -X POST "http://localhost:8000/rag-search?query=hesitant%20reaction"
```

### Test in Browser
1. Open http://localhost:5500
2. Use RAG-Enhanced Search section
3. Try queries like:
   - "hesitant reaction before answering"
   - "crowd celebrating after goal"
   - "tense pause before dialogue"

---

## What's Next?

### Future Enhancements
1. **Conversational Interface** - Maintain chat history
2. **Multi-Video Support** - Search across multiple videos
3. **Feedback Loop** - Learn from user clicks
4. **Caching** - Cache LLM responses for common queries
5. **Local LLM** - Use local models instead of API

---

## Support

If you encounter issues:
1. Check backend logs (`uvicorn app:app --reload`)
2. Verify all dependencies are installed
3. Ensure `.env` file is configured
4. Test with a simple query first

---

## Summary

✅ **What's Added:**
- Vector database (ChromaDB) for persistent storage
- LLM integration (OpenAI) for explanations
- RAG wrapper combining retrieval + generation
- Enhanced UI with RAG search section

✅ **What's Preserved:**
- All existing functionality
- Backward compatibility
- Original search endpoints

✅ **Result:**
- Same search quality
- Plus AI explanations
- Plus intelligent suggestions
- Better user experience

