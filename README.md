# 🎬 Semantic Video Search

A powerful video search engine that allows you to search for events inside a video using natural language. It automatically downloads videos, extracts frames, generates captions using AI, and performs semantic search to find the exact moments you are looking for.

## ✨ Features

-   **Natural Language Search**: Search for "a goal", "crowd cheering", or "player running".
-   **Temporal Intent**: Supports queries like "**before** the goal" or "**after** the whistle".
-   **Auto-Trimming**: Returns playable MP4 clips of the exact matching range.
-   **Deep Linking**: Provides a direct link to the original YouTube video at the start time.
-   **Dynamic Video Loading**: Switch the video source directly from the UI by pasting a YouTube URL.
-   **AI-Powered**: Uses `nlpconnect/vit-gpt2-image-captioning` for high-quality frame descriptions and SBERT for semantic matching.
-   **RAG-Enhanced Search**: Get AI-generated explanations, intelligent suggestions, and summaries (using free local Ollama LLM).

## 🛠️ Installation

1.  **Prerequisites**:
    -   Python 3.8+
    -   `ffmpeg` (Required for video processing)
        -   Mac: `brew install ffmpeg`
        -   Linux: `sudo apt install ffmpeg`

2.  **Install Python Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Setup Ollama (for RAG features - Free Local LLM)**:
    - Install Ollama: https://ollama.ai/download
    - Download model: `ollama pull llama3.2:1b`
    - Create `.env` file with:
      ```
      OLLAMA_URL=http://localhost:11434
      OLLAMA_MODEL=llama3.2:1b
      ```
    - See `QUICK_START_OLLAMA.md` for detailed setup

## 🚀 Running the App

You need to run both the Backend (API) and the Frontend (UI).

### 1. Start the Backend
```bash
uvicorn app:app --reload
```
*The API runs on `http://localhost:8000`.*

### 2. Start the Frontend
Open a new terminal tab:
```bash
python -m http.server 5500
```
*The UI is accessible at `http://localhost:5500`.*

## 📖 Usage Guide

1.  **Open the App**: Go to `http://localhost:5500` in your browser.
2.  **Load a Video**:
    -   In the "Switch Video Source" box, paste a YouTube URL (e.g., a sports highlight or movie trailer).
    -   Click **Load Video**.
    -   Wait for the process to complete (Downloading -> Extracting -> Captioning). *This can take 5-10 minutes for a short video.*
3.  **Search**:
    -   **Basic Search**: Type a query like *"red car driving"* or *"before the explosion"* and click **Search**.
    -   **RAG-Enhanced Search**: Use the "RAG-Enhanced Search" section for AI explanations, suggestions, and summaries.
4.  **View Results**:
    -   Watch the **Trimmed Clip** directly in the player.
    -   Read **AI-generated explanations** (RAG search only).
    -   Try **suggested queries** (RAG search only).
    -   Click **Jump to time in full video** to view the original context on YouTube.

## 📂 Project Structure

-   `app.py`: FastAPI backend and API endpoints.
-   `process_video.py`: Pipeline for downloading and processing YouTube videos.
-   `extract_frames.py`: uses ffmpeg to extract frames at 5 FPS.
-   `caption_frames.py`: Generates AI captions for extracted frames.
-   `semantic_search.py`: Core logic for embedding and searching captions.
-   `intent_search.py`: Handles temporal queries (before/after/during) and clip generation.
-   `video_utils.py`: Helper for generating MP4 clips.
-   `rag_generator.py`: AI explanation generation using Ollama (free local LLM).
-   `rag_search.py`: RAG wrapper combining retrieval + generation.
-   `vector_store.py`: ChromaDB vector database for persistent embeddings.
-   `index.html`: The frontend user interface.
