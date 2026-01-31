from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from semantic_search import search_frames
from intent_search import intent_search
from process_video import process_video_logic
from pydantic import BaseModel

# RAG imports
try:
    from rag_search import rag_search
    from vector_store import load_captions_to_vector_db, ensure_vector_db_loaded
    RAG_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ RAG modules not available: {e}")
    RAG_AVAILABLE = False
    ensure_vector_db_loaded = None

class VideoRequest(BaseModel):
    url: str

app = FastAPI()


@app.on_event("startup")
def startup():
    """Keep RAG ready: if vector DB is empty but captions exist, load them."""
    if RAG_AVAILABLE and ensure_vector_db_loaded:
        ensure_vector_db_loaded()


from semantic_search import search_frames, load_data

# ... imports ...

# Global status
processing_status = {"state": "idle", "message": ""}

def update_status(msg):
    global processing_status
    if msg == "COMPLETED":
        print("🔄 processing complete. Reloading search index...")
        load_data()  # Reload embeddings (old method)
        # Also load to vector DB if RAG is available
        if RAG_AVAILABLE:
            try:
                load_captions_to_vector_db()
            except Exception as e:
                print(f"⚠️ Vector DB load failed: {e}")
        processing_status = {"state": "completed", "message": "Done! Search now."}
    elif msg.startswith("ERROR"):
        processing_status = {"state": "error", "message": msg}
    else:
        processing_status = {"state": "processing", "message": msg}

@app.post("/process-video")
def process_video_endpoint(req: VideoRequest, background_tasks: BackgroundTasks):
    global processing_status
    processing_status = {"state": "starting", "message": "Starting job..."}
    background_tasks.add_task(process_video_logic, req.url, update_status)
    return {"status": "started"}

@app.get("/process-status")
def get_status():
    return processing_status

# Mount current directory to serve video.mp4 (simple approach for dev)
app.mount("/videos", StaticFiles(directory="."), name="videos")
app.mount("/clips", StaticFiles(directory="clips"), name="clips")
app.mount("/frames", StaticFiles(directory="frames"), name="frames")

# ✅ CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://[::]:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Range", "Content-Range", "Accept-Ranges", "Content-Length"],
)

@app.post("/search")
def search(query: str):
    return search_frames(query)

@app.post("/intent-search")
def intent(query: str):
    return intent_search(query)

# RAG endpoint
if RAG_AVAILABLE:
    @app.post("/rag-search")
    def rag_search_endpoint(query: str):
        """RAG-enhanced search with explanations"""
        return rag_search(query)
