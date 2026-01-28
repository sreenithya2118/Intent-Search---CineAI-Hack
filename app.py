from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from semantic_search import search_frames
from intent_search import intent_search
from process_video import process_video_logic
from pydantic import BaseModel

class VideoRequest(BaseModel):
    url: str

app = FastAPI()

from semantic_search import search_frames, load_data

# ... imports ...

# Global status
processing_status = {"state": "idle", "message": ""}

def update_status(msg):
    global processing_status
    if msg == "COMPLETED":
        print("🔄 processing complete. Reloading search index...")
        load_data() # Reload embeddings
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
