import os
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


@app.on_event("startup")
def startup():
    """Keep RAG ready: if vector DB is empty but captions exist, load them."""
    os.makedirs("source_clips", exist_ok=True)
    os.makedirs("clips", exist_ok=True)
    os.makedirs("frames", exist_ok=True)
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
    background_tasks.add_task(process_clips_logic, file_data, update_status)
    return {"status": "started", "file_count": len(file_data)}

@app.get("/process-status")
def get_status():
    return processing_status

# Ensure dirs exist before mounting (mount happens at import, startup runs later)
os.makedirs("source_clips", exist_ok=True)
os.makedirs("clips", exist_ok=True)
os.makedirs("frames", exist_ok=True)

# Mount current directory to serve video.mp4 (simple approach for dev)
app.mount("/videos", StaticFiles(directory="."), name="videos")
app.mount("/clips", StaticFiles(directory="clips"), name="clips")
app.mount("/frames", StaticFiles(directory="frames"), name="frames")
app.mount("/source_clips", StaticFiles(directory="source_clips"), name="source_clips")

# ✅ CORS FIX
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

@app.post("/search")
def search(query: str):
    return search_frames(query)

@app.post("/intent-search")
def intent(query: str):
    return intent_search(query)

# RAG endpoints
if RAG_AVAILABLE:
    @app.post("/rag-suggestions")
    def rag_suggestions_endpoint(query: str):
        """Return suggestions with proper intent + emotion, grounded in vector DB captions."""
        vector_results = []
        if search_vector_db:
            # Lower threshold so we get related captions for suggestion context
            vector_results = search_vector_db(query, top_k=15, threshold=0.25)
        suggestions = generate_suggestions_from_vector_db(query, vector_results) if generate_suggestions_from_vector_db else []
        return {"query": query, "suggestions": suggestions}

    @app.post("/rag-search")
    def rag_search_endpoint(query: str):
        """RAG-enhanced search with explanations (run after user picks a suggestion)."""
        return rag_search(query)

# Production Planner endpoints
if PRODUCTION_PLANNER_AVAILABLE:
    @app.post("/production-plan")
    def production_plan_endpoint(req: ProductionPlanRequest):
        """Generate production breakdown from script and budget"""
        return generate_production_plan(req.script, req.budget)
