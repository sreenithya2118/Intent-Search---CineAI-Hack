# Disable tokenizers parallelism before any Hugging Face imports to avoid fork deadlocks
import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"

from fastapi import FastAPI, BackgroundTasks, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from semantic_search import search_frames
from intent_search import intent_search
from process_video import process_video_logic
from process_clips import process_clips_logic
from pydantic import BaseModel

# RAG imports
try:
    from rag_search import rag_search
    from vector_store import load_captions_to_vector_db, ensure_vector_db_loaded, search_vector_db
    from rag_generator import generate_suggestions_from_vector_db
    RAG_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ RAG modules not available: {e}")
    RAG_AVAILABLE = False
    ensure_vector_db_loaded = None
    search_vector_db = None
    generate_suggestions_from_vector_db = None

# Production Planner imports
try:
    from production_planner import generate_production_plan
    PRODUCTION_PLANNER_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Production planner not available: {e}")
    PRODUCTION_PLANNER_AVAILABLE = False

class VideoRequest(BaseModel):
    url: str

class ProductionPlanRequest(BaseModel):
    script: str
    budget: float

app = FastAPI()

# CORS must be added early so all routes (including RAG/audio) get proper headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://[::]:5500",
        "http://[::]:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Range", "Content-Range", "Accept-Ranges", "Content-Length"],
)


@app.on_event("startup")
def startup():
    """Keep RAG ready: if vector DB is empty but captions exist, load them."""
    os.makedirs("source_clips", exist_ok=True)
    os.makedirs("clips", exist_ok=True)
    os.makedirs("frames", exist_ok=True)
    if RAG_AVAILABLE and ensure_vector_db_loaded:
        ensure_vector_db_loaded()
        # Also load audio transcriptions if available
        try:
            from vector_store import load_transcriptions_to_vector_db
            load_transcriptions_to_vector_db(append_only=True)
        except Exception as e:
            print(f"⚠️ Could not load audio transcriptions: {e}")


from semantic_search import search_frames, load_data

# ... imports ...

# Global status
processing_status = {"state": "idle", "message": ""}

def update_status(msg, append_vector_db=True):
    """
    Update processing status. 
    append_vector_db: Always True now to preserve historical data across all videos.
    """
    global processing_status
    if msg == "COMPLETED":
        print("🔄 processing complete. Reloading search index...")
        load_data()  # Reload embeddings (old method)
        if RAG_AVAILABLE:
            try:
                # ALWAYS use append_only=True to preserve historical data
                load_captions_to_vector_db(append_only=True)
                # Also load audio transcriptions
                from vector_store import load_transcriptions_to_vector_db
                load_transcriptions_to_vector_db(append_only=True)
            except Exception as e:
                print(f"⚠️ Vector DB load failed: {e}")
        processing_status = {"state": "completed", "message": "Done! Search now."}
    elif msg.startswith("ERROR"):
        processing_status = {"state": "error", "message": msg}
    else:
        processing_status = {"state": "processing", "message": msg}

@app.post("/process-video")
def process_video_endpoint(req: VideoRequest, background_tasks: BackgroundTasks):
    """Process YouTube video. Incremental: preserves existing frames and captions."""
    global processing_status
    processing_status = {"state": "starting", "message": "Starting job..."}
    # Use update_status which now always uses append_only=True for vector DB
    background_tasks.add_task(process_video_logic, req.url, update_status)
    return {"status": "started"}


@app.post("/process-clips")
async def process_clips_endpoint(
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...)
):
    """Process multiple uploaded video clips. Accepts mp4, mov, webm, etc."""
    global processing_status
    if not files:
        return {"error": "No files uploaded"}
    # Validate and read file contents (must do before bg task - request body closes)
    allowed = {".mp4", ".mov", ".webm", ".avi", ".mkv"}
    file_data = []  # [(filename, bytes), ...]
    for f in files:
        ext = os.path.splitext(f.filename or "")[1].lower()
        if ext in allowed:
            content = await f.read()
            file_data.append((f.filename or "video.mp4", content))
        else:
            print(f"Skipping {f.filename}: unsupported format")
    if not file_data:
        return {"error": "No valid video files (supported: mp4, mov, webm, avi, mkv)"}
    processing_status = {"state": "starting", "message": f"Processing {len(file_data)} clip(s)..."}
    def update_status_clips(msg):
        update_status(msg, append_vector_db=(msg == "COMPLETED"))
    background_tasks.add_task(process_clips_logic, file_data, update_status_clips)
    return {"status": "started", "file_count": len(file_data)}

@app.get("/process-status")
def get_status():
    return processing_status

@app.get("/source-clips-list")
def list_source_clips():
    """Return list of uploaded clips in source_clips for UI display."""
    clips_dir = "source_clips"
    if not os.path.exists(clips_dir):
        return {"clips": []}
    allowed = {".mp4", ".mov", ".webm", ".avi", ".mkv"}
    clips = []
    for f in sorted(os.listdir(clips_dir)):
        ext = os.path.splitext(f)[1].lower()
        if ext in allowed:
            clips.append({"name": f, "url": f"/source_clips/{f}"})
    return {"clips": clips}

@app.get("/video-history")
def get_video_history():
    """Return history of all processed videos (YouTube and uploaded clips)."""
    import json
    history_file = "video_history.json"
    if not os.path.exists(history_file):
        return {"videos": [], "total": 0}
    try:
        with open(history_file, "r") as f:
            history = json.load(f)
        return {"videos": history.get("videos", []), "total": len(history.get("videos", []))}
    except Exception as e:
        return {"videos": [], "total": 0, "error": str(e)}

@app.get("/captions-stats")
def get_captions_stats():
    """Return statistics about captions.txt (total captions, unique sources)."""
    captions_file = "captions.txt"
    if not os.path.exists(captions_file):
        return {"total_captions": 0, "sources": {}}
    
    import re
    sources = {}
    total = 0
    with open(captions_file, "r") as f:
        for line in f:
            if ": " in line:
                total += 1
                frame = line.strip().split(": ", 1)[0]
                # Detect source type
                if frame.startswith("youtube_"):
                    m = re.match(r"youtube_(\d+)_frame", frame)
                    source = f"youtube_{m.group(1)}" if m else "youtube"
                elif frame.startswith("clip_"):
                    m = re.match(r"clip_(\d+)_frame", frame)
                    source = f"clip_{m.group(1)}" if m else "clip"
                else:
                    source = "legacy"
                sources[source] = sources.get(source, 0) + 1
    
    return {"total_captions": total, "sources": sources}

# Ensure dirs exist before mounting (mount happens at import, startup runs later)
os.makedirs("source_clips", exist_ok=True)
os.makedirs("clips", exist_ok=True)
os.makedirs("frames", exist_ok=True)

# Mount current directory to serve video.mp4 (simple approach for dev)
app.mount("/videos", StaticFiles(directory="."), name="videos")
app.mount("/clips", StaticFiles(directory="clips"), name="clips")
app.mount("/frames", StaticFiles(directory="frames"), name="frames")
app.mount("/source_clips", StaticFiles(directory="source_clips"), name="source_clips")

@app.post("/search")
def search(query: str):
    return search_frames(query)

@app.post("/intent-search")
def intent(query: str):
    return intent_search(query)

# RAG endpoints
if RAG_AVAILABLE:
    @app.post("/rag-search")
    def rag_search_endpoint(query: str):
        """RAG-enhanced search with explanations (run after user picks a suggestion)."""
        return rag_search(query)

    @app.post("/audio-search")
    def audio_search_endpoint(query: str):
        """Audio-focused search: prioritizes dialog matches, generates clips for matched speech."""
        return rag_search(query, audio_only=True)

# Production Planner endpoints
if PRODUCTION_PLANNER_AVAILABLE:
    @app.post("/production-plan")
    def production_plan_endpoint(req: ProductionPlanRequest):
        """Generate production breakdown from script and budget"""
        return generate_production_plan(req.script, req.budget)
