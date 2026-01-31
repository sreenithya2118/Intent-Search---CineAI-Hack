# 🎬 Intent-Based Semantic Video Search Engine - Technical Explanation

## Problem Statement

**Challenge**: Video editors struggle to find specific footage using natural language queries like:
- "hesitant reaction before answering"
- "tense pause before dialogue"
- "crowd celebrating after goal"

**Limitation**: Traditional keyword-based search fails because:
- It cannot understand **semantic meaning** (e.g., "hesitant" vs "uncertain" vs "reluctant")
- It cannot capture **emotional context** (e.g., "tense pause" requires understanding of atmosphere)
- It cannot interpret **temporal relationships** (e.g., "before", "after", "during")
- It requires exact word matches, missing synonyms and conceptual matches

---

## Solution Overview

This project implements a **semantic search engine** that enables intelligent video retrieval based on:
1. **Meaning & Intent**: Understanding what the user is looking for semantically
2. **Emotional Context**: Capturing emotions and atmosphere from visual content
3. **Temporal Relationships**: Supporting queries with "before", "after", "during" modifiers

### Core Innovation

Instead of searching video metadata or transcripts, the system:
- **Extracts frames** from video at regular intervals (5 FPS)
- **Generates AI-powered visual captions** for each frame using Vision-Language models
- **Creates semantic embeddings** of both queries and captions
- **Performs similarity search** in the embedding space
- **Handles temporal intent** by adjusting time windows based on query modifiers

---

## Tools & Technologies Used

### 1. **AI/ML Stack**

#### **Vision-Language Model: `nlpconnect/vit-gpt2-image-captioning`**
- **Purpose**: Generates natural language descriptions of video frames
- **Architecture**: 
  - **Encoder**: Vision Transformer (ViT) - processes images into visual features
  - **Decoder**: GPT-2 - generates text captions from visual features
- **Why This Model**: 
  - Understands visual content semantically (not just objects, but context, emotion, actions)
  - Generates human-readable captions that capture meaning and emotion
  - Example: Frame showing a person → Caption: "a person looking hesitant before speaking"

#### **Semantic Embedding Model: `all-MiniLM-L6-v2` (Sentence Transformers)**
- **Purpose**: Converts text (queries and captions) into dense vector embeddings
- **Technology**: Sentence-BERT (SBERT) architecture
- **Why This Model**:
  - Creates 384-dimensional vectors that capture semantic meaning
  - Enables similarity search: "hesitant reaction" matches "uncertain pause" even without keyword overlap
  - Fast and efficient for real-time search

### 2. **Video Processing Stack**

#### **FFmpeg**
- **Purpose**: Video manipulation and frame extraction
- **Usage**:
  - Extracts frames at 5 FPS (5 frames per second)
  - Generates trimmed video clips from time ranges
  - Handles video format conversion

#### **yt-dlp**
- **Purpose**: Downloads videos from YouTube
- **Features**: Handles various video formats, quality selection, metadata extraction

### 3. **Backend Framework**

#### **FastAPI**
- **Purpose**: RESTful API server
- **Endpoints**:
  - `/process-video`: Initiates video processing pipeline
  - `/process-status`: Returns processing status
  - `/intent-search`: Performs semantic search with temporal intent
  - `/search`: Basic semantic search
- **Features**: CORS support, static file serving, background tasks

### 4. **Python Libraries**

- **PyTorch**: Deep learning framework for running AI models
- **Transformers (Hugging Face)**: Pre-trained model loading and inference
- **Pillow (PIL)**: Image processing for frame handling
- **Uvicorn**: ASGI server for FastAPI

---

## System Architecture & Data Flow

### Phase 1: Video Ingestion & Processing Pipeline

```
YouTube URL
    ↓
[yt-dlp] Download video → video.mp4
    ↓
[extract_frames.py + FFmpeg] Extract frames at 5 FPS → frames/frame_0001.jpg, frame_0002.jpg, ...
    ↓
[caption_frames.py + ViT-GPT2] Generate AI captions for each frame
    ↓
captions.txt (Format: "frame_0001.jpg: a person looking hesitant before speaking")
    ↓
[semantic_search.py + SentenceTransformer] Create embeddings for all captions
    ↓
Embeddings stored in memory (PyTorch tensors)
```

**Key Files**:
- `process_video.py`: Orchestrates the entire pipeline
- `extract_frames.py`: Frame extraction using FFmpeg
- `caption_frames.py`: AI caption generation
- `semantic_search.py`: Embedding creation and storage

### Phase 2: Query Processing & Search

```
User Query: "hesitant reaction before answering"
    ↓
[intent_search.py] Detect intent: "before" detected
    ↓
Clean query: "hesitant reaction answering" (remove temporal words)
    ↓
[semantic_search.py] 
    ├─ Encode query → Query embedding (384-dim vector)
    ├─ Compute cosine similarity with all caption embeddings
    ├─ Get top 50 matches (above threshold 0.4)
    └─ Cluster matches by timestamp (within 1 second = same clip)
    ↓
Results: [{start: 12.4s, end: 13.2s, score: 0.78, caption: "..."}, ...]
    ↓
[intent_search.py] Apply temporal intent:
    ├─ If "before": Start 5 seconds earlier, end at event
    ├─ If "after": Start at event, end 5 seconds later
    └─ If "during": Use exact match time range
    ↓
[video_utils.py + FFmpeg] Generate trimmed MP4 clip
    ↓
Return: {video_url, full_video_url, start, end, caption, score, intent}
```

**Key Files**:
- `intent_search.py`: Intent detection and temporal adjustment
- `semantic_search.py`: Core similarity search algorithm
- `video_utils.py`: Clip generation

### Phase 3: Frontend Display

```
[app.py] FastAPI serves:
    ├─ /intent-search endpoint
    ├─ /clips/ (static files - trimmed videos)
    ├─ /frames/ (static files - frame images)
    └─ /videos/ (static files - full video)
    ↓
[index.html] Frontend:
    ├─ Displays search results
    ├─ Shows best matching frame thumbnail
    ├─ Plays trimmed video clip
    └─ Provides link to original YouTube video at timestamp
```

---

## How It Solves the Problem

### 1. **Semantic Understanding**

**Problem**: Keyword search fails for synonyms and conceptual matches.

**Solution**: 
- Uses **sentence embeddings** that capture semantic meaning
- "hesitant reaction" matches "uncertain pause" because embeddings are similar in vector space
- Cosine similarity (0-1 scale) measures semantic closeness, not exact word matches

**Example**:
```
Query: "hesitant reaction"
Caption: "a person looking uncertain before speaking"
Similarity Score: 0.82 (high match, even though no keywords overlap)
```

### 2. **Emotional & Contextual Understanding**

**Problem**: Traditional search cannot capture emotions, atmosphere, or subtle visual cues.

**Solution**:
- **Vision-Language model (ViT-GPT2)** analyzes visual content directly
- Generates captions that describe:
  - Emotions: "hesitant", "tense", "excited"
  - Atmosphere: "pause", "silence", "anticipation"
  - Actions: "looking", "reacting", "preparing"
- These captions are then searchable semantically

**Example**:
```
Frame shows: Person with furrowed brow, hand raised but not speaking
AI Caption: "a person looking hesitant before answering"
Query: "tense pause before dialogue"
Match: Yes (semantic similarity captures the emotional context)
```

### 3. **Temporal Intent Handling**

**Problem**: Users need footage "before" or "after" an event, not just the event itself.

**Solution**:
- **Intent detection**: Parses query for "before", "after", "during"
- **Temporal adjustment**: 
  - "before X": Returns 5-second window ending at X
  - "after X": Returns 5-second window starting at X
  - "during X": Returns exact match time range

**Example**:
```
Query: "before crowd celebrating"
1. Find semantic match: "crowd celebrating" at 45.2s
2. Detect intent: "before"
3. Adjust: Return clip from 40.2s to 45.2s (5 seconds before the event)
```

### 4. **Intelligent Clustering**

**Problem**: Multiple frames might match, creating fragmented results.

**Solution**:
- **Temporal clustering**: Groups consecutive matches within 1 second into single clips
- **Best match selection**: Within each cluster, selects frame with highest similarity score
- **Smooth time ranges**: Returns continuous clips, not scattered frames

**Example**:
```
Matches at: 12.0s, 12.2s, 12.4s, 12.6s (all within 1 second)
Result: Single clip from 12.0s to 12.6s (not 4 separate results)
```

### 5. **End-to-End Workflow**

**Problem**: Editors need playable clips, not just timestamps.

**Solution**:
- **Auto-trimming**: Generates MP4 clips automatically
- **Deep linking**: Provides YouTube URL with timestamp
- **Visual preview**: Shows best matching frame thumbnail
- **Seamless integration**: All processing happens in background, results are ready to use

---

## Technical Highlights

### 1. **Efficient Embedding Storage**
- Captions are pre-embedded once during video processing
- Embeddings stored as PyTorch tensors in memory
- Query embedding computed on-the-fly (fast)
- Cosine similarity computed using optimized PyTorch operations

### 2. **Scalable Architecture**
- Background task processing (non-blocking)
- Static file serving for videos/clips
- RESTful API design (easy to extend)

### 3. **Robust Error Handling**
- Graceful degradation if captions missing
- Status polling for long-running tasks
- Error messages in processing pipeline

### 4. **Performance Optimizations**
- Model loaded once (not per request)
- Batch processing for embeddings
- Efficient frame extraction (5 FPS balances coverage vs. processing time)
- Clip caching (generated once, reused)

---

## Example Workflow

### Input:
```
YouTube URL: https://www.youtube.com/watch?v=xyz123
Query: "hesitant reaction before answering"
```

### Processing:
1. **Download** video (30 seconds)
2. **Extract** 150 frames (5 FPS × 30s)
3. **Caption** each frame:
   - Frame 44: "a person looking hesitant before speaking"
   - Frame 45: "a person with uncertain expression"
   - ...
4. **Embed** all 150 captions
5. **Search** for "hesitant reaction":
   - Find matches at frames 44, 45, 46 (all clustered)
   - Best match: Frame 44 (score: 0.78)
   - Time range: 8.8s - 9.2s
6. **Apply intent** "before":
   - Adjust to: 3.8s - 8.8s (5 seconds before)
7. **Generate clip**: `clip_3.8_8.8.mp4`
8. **Return**:
   ```json
   {
     "start": 3.8,
     "end": 8.8,
     "caption": "a person looking hesitant before speaking",
     "score": 0.78,
     "intent": "before",
     "video_url": "http://localhost:8000/clips/clip_3.8_8.8.mp4",
     "full_video_url": "https://youtube.com/watch?v=xyz123&t=3s"
   }
   ```

---

## Advantages Over Traditional Search

| Traditional Keyword Search | Semantic Search Engine |
|---------------------------|------------------------|
| ❌ Requires exact word matches | ✅ Understands synonyms and concepts |
| ❌ Cannot capture emotions | ✅ Analyzes visual content for emotions |
| ❌ No temporal understanding | ✅ Handles "before/after/during" queries |
| ❌ Limited to metadata/transcripts | ✅ Analyzes actual video frames |
| ❌ Fragmented results | ✅ Clustered, continuous clips |
| ❌ Manual timestamp lookup | ✅ Auto-generated playable clips |

---

## Conclusion

This semantic video search engine solves the core problem by:
1. **Understanding meaning** through AI-powered visual captioning
2. **Capturing emotions** via Vision-Language models
3. **Interpreting intent** through temporal query parsing
4. **Delivering results** as ready-to-use video clips

The system transforms the video editing workflow from manual keyword searching to intelligent, intent-based retrieval that understands what editors are truly looking for.

