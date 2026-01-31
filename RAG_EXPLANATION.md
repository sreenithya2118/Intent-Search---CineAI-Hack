# 🔄 RAG (Retrieval-Augmented Generation) for Semantic Video Search

## What is RAG?

**RAG (Retrieval-Augmented Generation)** is an AI architecture that combines two powerful techniques:

1. **Retrieval**: Finding relevant information from a knowledge base/database
2. **Augmented Generation**: Using a Large Language Model (LLM) to generate responses based on the retrieved information

### Traditional RAG Flow:
```
User Query
    ↓
[Retrieval System] → Find relevant documents/chunks
    ↓
[LLM Generator] → Generate response using retrieved context
    ↓
Enhanced Answer
```

### Key Benefits:
- **Grounding**: LLM responses are based on actual data (not hallucinated)
- **Up-to-date**: Can work with recent information not in LLM training data
- **Domain-specific**: Can leverage specialized knowledge bases
- **Transparency**: Can cite sources from retrieved information

---

## Current Project Architecture (Without RAG)

Your current system uses **Retrieval-Only** approach:

```
User Query: "hesitant reaction before answering"
    ↓
[Semantic Search] → Find matching video frames/captions
    ↓
[Return Results] → Raw matches with timestamps
```

**What's Missing:**
- ❌ No intelligent query interpretation
- ❌ No contextual explanations
- ❌ No summarization of results
- ❌ No conversational interaction
- ❌ No suggestions for related searches

---

## How RAG Can Enhance This Project

### Architecture Overview

```
User Query: "hesitant reaction before answering"
    ↓
[RAG Retrieval Layer] → Semantic search (existing)
    ↓
[Context Assembly] → Gather relevant captions, timestamps, metadata
    ↓
[LLM Generator] → Generate enhanced response
    ↓
[Response] → Natural language explanation + video clips
```

---

## Specific RAG Applications for Video Search

### 1. **Intelligent Query Understanding & Expansion**

**Current Problem**: Simple keyword removal for temporal words
```python
# Current approach (intent_search.py)
clean = query.lower()
for w in ["before", "after", "during"]:
    clean = clean.replace(w, "")
```

**RAG Enhancement**: Use LLM to understand and expand queries
```python
# RAG-enhanced query understanding
def expand_query_with_rag(query):
    # Retrieve similar past queries and their successful results
    similar_queries = retrieve_similar_queries(query)
    
    # Use LLM to interpret intent
    prompt = f"""
    User query: "{query}"
    Similar successful queries: {similar_queries}
    
    Analyze this query and provide:
    1. Main semantic concept
    2. Temporal intent (before/after/during)
    3. Emotional context
    4. Alternative phrasings
    """
    
    interpretation = llm.generate(prompt)
    return interpretation
```

**Benefits**:
- Understands complex queries: "the moment right before someone hesitates"
- Handles synonyms: "uncertain" = "hesitant" = "reluctant"
- Expands queries: "hesitant reaction" → ["uncertain pause", "reluctant gesture", "hesitation moment"]

---

### 2. **Contextual Result Explanation**

**Current Problem**: Returns raw matches without explanation
```json
{
  "caption": "a person looking hesitant before speaking",
  "score": 0.78,
  "start": 12.4,
  "end": 13.2
}
```

**RAG Enhancement**: Generate natural language explanations
```python
def explain_results_with_rag(query, search_results):
    # Retrieve top matches
    top_matches = search_results[:5]
    
    # Build context
    context = "\n".join([
        f"Match {i+1}: {r['caption']} (at {r['start']}s, score: {r['score']})"
        for i, r in enumerate(top_matches)
    ])
    
    # Generate explanation
    prompt = f"""
    User searched for: "{query}"
    
    Found matches:
    {context}
    
    Explain why these results match the query. Highlight:
    - Semantic similarities
    - Emotional context
    - Why the score indicates relevance
    """
    
    explanation = llm.generate(prompt)
    return explanation
```

**Example Output**:
```
"Found 3 relevant moments showing hesitant reactions:

1. At 12.4s: 'a person looking hesitant before speaking' (78% match)
   - Captures the uncertainty and pause before dialogue
   - High score indicates strong semantic match with 'hesitant reaction'

2. At 18.2s: 'someone appearing uncertain before responding' (72% match)
   - Similar emotional state, different phrasing
   - Shows the system understands synonyms

3. At 25.1s: 'a person with reluctant expression' (68% match)
   - Captures the hesitation emotion
   - Lower score but still relevant
```

---

### 3. **Multi-Modal Context Assembly**

**Current Problem**: Only uses frame captions, misses broader context

**RAG Enhancement**: Combine multiple information sources
```python
def retrieve_context_for_rag(query, timestamp):
    # 1. Frame captions (existing)
    frame_captions = get_captions_around(timestamp, window=5)
    
    # 2. Audio transcript (if available)
    audio_context = get_audio_transcript(timestamp, window=5)
    
    # 3. Scene metadata (if available)
    scene_info = get_scene_metadata(timestamp)
    
    # 4. Temporal context (before/after frames)
    temporal_context = get_surrounding_captions(timestamp, before=10, after=10)
    
    # 5. Similar scenes from other videos (if multi-video database)
    similar_scenes = find_similar_scenes(query)
    
    return {
        "frame_captions": frame_captions,
        "audio": audio_context,
        "scene": scene_info,
        "temporal": temporal_context,
        "similar": similar_scenes
    }
```

**Benefits**:
- Richer context for LLM to understand
- Better explanations combining visual + audio
- Can reference similar scenes for comparison

---

### 4. **Conversational Search Interface**

**Current Problem**: Single-shot queries, no conversation

**RAG Enhancement**: Maintain conversation context
```python
class ConversationalVideoSearch:
    def __init__(self):
        self.conversation_history = []
        self.search_context = {}
    
    def search_with_conversation(self, query, follow_up=False):
        # Retrieve relevant past context
        if follow_up:
            previous_results = self.search_context.get("last_results", [])
            conversation = "\n".join(self.conversation_history[-3:])
        else:
            previous_results = []
            conversation = ""
        
        # Semantic search (existing)
        results = semantic_search(query)
        
        # Build RAG context
        context = {
            "query": query,
            "results": results,
            "previous_results": previous_results,
            "conversation": conversation
        }
        
        # Generate conversational response
        prompt = f"""
        User query: "{query}"
        Previous conversation: {conversation}
        Search results: {format_results(results)}
        
        Provide a natural, conversational response that:
        1. Acknowledges the query
        2. Explains what was found
        3. Offers to refine or expand the search
        """
        
        response = llm.generate(prompt)
        
        # Update history
        self.conversation_history.append(f"User: {query}")
        self.conversation_history.append(f"Assistant: {response}")
        self.search_context["last_results"] = results
        
        return {
            "response": response,
            "results": results,
            "suggestions": self.generate_suggestions(query, results)
        }
```

**Example Conversation**:
```
User: "Find hesitant reactions"
Assistant: "I found 5 moments showing hesitant reactions. The strongest match is at 12.4s where someone appears uncertain before speaking. Would you like to see moments specifically before dialogue, or explore other emotional states?"

User: "Show me the one before dialogue"
Assistant: "Here's the clip at 12.4s showing the hesitant moment right before dialogue begins. The person's body language suggests uncertainty. I can also show you similar moments if you'd like."
```

---

### 5. **Intelligent Result Summarization**

**Current Problem**: Returns individual clips without overview

**RAG Enhancement**: Generate summaries of search results
```python
def summarize_search_results(query, results):
    # Retrieve all matching clips
    clips = results
    
    # Build context
    context = "\n".join([
        f"Clip {i+1}: {r['caption']} at {r['start']}s-{r['end']}s (score: {r['score']})"
        for i, r in enumerate(clips)
    ])
    
    # Generate summary
    prompt = f"""
    User searched for: "{query}"
    
    Found {len(clips)} matching video clips:
    {context}
    
    Provide a concise summary:
    1. Overall theme/pattern in the results
    2. Time distribution (when do these moments occur?)
    3. Key characteristics shared across clips
    4. Recommendation: which clip best matches the query?
    """
    
    summary = llm.generate(prompt)
    return summary
```

**Example Output**:
```
"Found 5 clips showing hesitant reactions, primarily occurring in the first half of the video (12-30 seconds). These moments share common characteristics: uncertain facial expressions, pauses before speech, and body language suggesting reluctance. The clip at 12.4s has the highest relevance score (0.78) and best captures the 'hesitant reaction before answering' query."
```

---

### 6. **Query Suggestion & Refinement**

**Current Problem**: No guidance if search returns poor results

**RAG Enhancement**: Suggest alternative queries
```python
def suggest_queries_with_rag(query, results):
    if len(results) == 0 or max(r['score'] for r in results) < 0.5:
        # Poor results - suggest alternatives
        prompt = f"""
        User searched for: "{query}"
        No good matches found.
        
        Based on the video content available, suggest 3-5 alternative queries that might yield better results.
        Consider:
        - Synonyms and related terms
        - More specific or more general phrasings
        - Different emotional descriptors
        """
        
        suggestions = llm.generate(prompt)
        return suggestions
    
    # Good results - suggest related searches
    else:
        prompt = f"""
        User searched for: "{query}" and found relevant results.
        
        Suggest 3 related queries that might also be interesting:
        - Similar emotional states
        - Related actions or moments
        - Temporal variations (before/after)
        """
        
        suggestions = llm.generate(prompt)
        return suggestions
```

---

### 7. **Multi-Video Knowledge Base**

**Current Problem**: Single video at a time

**RAG Enhancement**: Cross-video knowledge retrieval
```python
def rag_multi_video_search(query):
    # Retrieve from multiple videos
    all_results = []
    for video_id in video_database:
        results = semantic_search_in_video(query, video_id)
        all_results.extend(results)
    
    # Rank across all videos
    ranked_results = rank_results(all_results)
    
    # Generate cross-video summary
    prompt = f"""
    User searched for: "{query}"
    
    Found matches across {len(video_database)} videos:
    {format_multi_video_results(ranked_results)}
    
    Provide insights:
    1. Which video has the most relevant content?
    2. Are there patterns across different videos?
    3. Recommendations for the best matches
    """
    
    summary = llm.generate(prompt)
    return {
        "results": ranked_results,
        "summary": summary
    }
```

---

## Implementation Architecture

### Enhanced System Flow with RAG

```
┌─────────────────────────────────────────────────────────────┐
│                    User Query Input                          │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
        ┌──────────────────────────────┐
        │   Query Understanding (LLM)   │
        │  - Interpret intent           │
        │  - Expand synonyms            │
        │  - Extract temporal cues      │
        └──────────────┬───────────────┘
                       ↓
        ┌──────────────────────────────┐
        │   Semantic Search (Existing)  │
        │  - Embed query                │
        │  - Find similar captions      │
        │  - Rank by similarity         │
        └──────────────┬───────────────┘
                       ↓
        ┌──────────────────────────────┐
        │   Context Assembly (RAG)     │
        │  - Gather frame captions      │
        │  - Add temporal context       │
        │  - Include metadata           │
        │  - Retrieve similar scenes    │
        └──────────────┬───────────────┘
                       ↓
        ┌──────────────────────────────┐
        │   LLM Generation (RAG)       │
        │  - Explain results            │
        │  - Summarize findings         │
        │  - Suggest alternatives       │
        │  - Generate conversation      │
        └──────────────┬───────────────┘
                       ↓
        ┌──────────────────────────────┐
        │   Enhanced Response           │
        │  - Natural language           │
        │  - Video clips                │
        │  - Explanations               │
        │  - Suggestions                │
        └──────────────────────────────┘
```

---

## Code Implementation Example

### Basic RAG Integration

```python
# rag_enhanced_search.py
from transformers import AutoModelForCausalLM, AutoTokenizer
from semantic_search import search_frames, load_data
import json

# Load LLM (e.g., GPT-2, LLaMA, or use OpenAI API)
# For local: model = AutoModelForCausalLM.from_pretrained("gpt2")
# For API: use openai.ChatCompletion or similar

class RAGVideoSearch:
    def __init__(self):
        # Existing semantic search
        load_data()
        
        # LLM for generation (choose based on your needs)
        # Option 1: Local model
        # self.tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
        # self.model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
        
        # Option 2: API (recommended for better quality)
        # import openai
        # self.llm_client = openai.OpenAI(api_key="your-key")
    
    def search_with_rag(self, query: str):
        # Step 1: Retrieve (existing semantic search)
        raw_results = search_frames(query)
        
        if not raw_results:
            return self._handle_no_results(query)
        
        # Step 2: Build context for LLM
        context = self._build_context(query, raw_results)
        
        # Step 3: Generate enhanced response
        explanation = self._generate_explanation(query, context, raw_results)
        
        # Step 4: Generate suggestions
        suggestions = self._generate_suggestions(query, raw_results)
        
        return {
            "query": query,
            "results": raw_results,
            "explanation": explanation,
            "suggestions": suggestions,
            "summary": self._generate_summary(query, raw_results)
        }
    
    def _build_context(self, query, results):
        """Assemble context from search results"""
        context_parts = []
        
        for i, result in enumerate(results[:5]):  # Top 5 results
            context_parts.append(
                f"Match {i+1}: '{result['caption']}' "
                f"at {result['start']:.1f}s-{result['end']:.1f}s "
                f"(relevance: {result['score']:.2f})"
            )
        
        return "\n".join(context_parts)
    
    def _generate_explanation(self, query, context, results):
        """Use LLM to explain why results match"""
        prompt = f"""You are a video search assistant. A user searched for: "{query}"

Found {len(results)} matching video moments:
{context}

Explain why these results are relevant to the query. Focus on:
1. Semantic similarities between query and captions
2. Why the relevance scores indicate good matches
3. What emotional or contextual elements are captured

Keep the explanation concise (2-3 sentences)."""
        
        # Generate using LLM
        # For API:
        # response = self.llm_client.chat.completions.create(
        #     model="gpt-3.5-turbo",
        #     messages=[{"role": "user", "content": prompt}]
        # )
        # return response.choices[0].message.content
        
        # For demo, return template:
        return f"Found {len(results)} moments matching '{query}'. The top result at {results[0]['start']:.1f}s shows '{results[0]['caption']}' with {results[0]['score']:.0%} relevance, indicating strong semantic match."
    
    def _generate_suggestions(self, query, results):
        """Suggest related queries"""
        if len(results) == 0:
            return [
                "Try a more general query",
                "Use different emotional descriptors",
                "Search for specific actions instead"
            ]
        
        # Analyze successful query patterns
        return [
            f"'{query}' but in different context",
            f"Similar to '{query}' but more specific",
            f"Opposite of '{query}'"
        ]
    
    def _generate_summary(self, query, results):
        """Summarize all results"""
        if not results:
            return "No matches found for your query."
        
        time_range = f"{results[0]['start']:.1f}s to {results[-1]['end']:.1f}s"
        avg_score = sum(r['score'] for r in results) / len(results)
        
        return f"Found {len(results)} relevant moments ({time_range}) with average relevance of {avg_score:.0%}."
    
    def _handle_no_results(self, query):
        """Handle case when no results found"""
        return {
            "query": query,
            "results": [],
            "explanation": f"No matches found for '{query}'. Try rephrasing or using different keywords.",
            "suggestions": [
                "Use more general terms",
                "Try synonyms",
                "Remove specific temporal words"
            ],
            "summary": "No results found."
        }
```

### Integration with Existing API

```python
# app.py (enhanced)
from rag_enhanced_search import RAGVideoSearch

rag_search = RAGVideoSearch()

@app.post("/rag-search")
def rag_search_endpoint(query: str):
    """Enhanced search with RAG explanations"""
    return rag_search.search_with_rag(query)

@app.post("/intent-search")
def intent(query: str):
    """Existing endpoint - can be enhanced with RAG"""
    results = intent_search(query)
    
    # Add RAG explanation
    if results:
        explanation = rag_search._generate_explanation(
            query, 
            rag_search._build_context(query, results),
            results
        )
        return {
            "results": results,
            "explanation": explanation
        }
    
    return results
```

---

## Benefits of RAG for This Project

### 1. **Better User Experience**
- ✅ Natural language explanations instead of raw scores
- ✅ Conversational interface
- ✅ Helpful suggestions when searches fail

### 2. **Improved Search Quality**
- ✅ Query expansion and understanding
- ✅ Context-aware retrieval
- ✅ Multi-modal context assembly

### 3. **Intelligent Assistance**
- ✅ Explains why results match
- ✅ Suggests related searches
- ✅ Summarizes findings across multiple clips

### 4. **Scalability**
- ✅ Can work with multiple videos
- ✅ Learns from user interactions
- ✅ Adapts to domain-specific terminology

---

## Recommended LLM Options

### For Local Deployment:
1. **GPT-2** (small, fast, good for simple tasks)
2. **LLaMA 2/3** (better quality, requires more resources)
3. **Mistral 7B** (good balance)

### For API (Recommended):
1. **OpenAI GPT-3.5/4** (best quality, easy integration)
2. **Anthropic Claude** (excellent for long contexts)
3. **Google Gemini** (good multimodal support)

### For Video-Specific:
1. **Video-LLaMA** (designed for video understanding)
2. **Video-ChatGPT** (conversational video AI)

---

## Implementation Priority

### Phase 1: Basic RAG (Quick Wins)
1. ✅ Result explanation generation
2. ✅ Query suggestion when no results
3. ✅ Simple summarization

### Phase 2: Enhanced RAG (Medium Effort)
1. ✅ Conversational interface
2. ✅ Context assembly (temporal + multi-modal)
3. ✅ Query expansion

### Phase 3: Advanced RAG (Long-term)
1. ✅ Multi-video knowledge base
2. ✅ Learning from user feedback
3. ✅ Domain-specific fine-tuning

---

## Conclusion

RAG transforms your semantic video search from a **retrieval system** into an **intelligent assistant** that:
- Understands queries better
- Explains results naturally
- Suggests improvements
- Engages in conversation
- Provides contextual insights

The retrieval component (your existing semantic search) provides the **grounding**, while the generation component (LLM) provides the **intelligence** to make the system more user-friendly and powerful.

