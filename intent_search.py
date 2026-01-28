from semantic_search import search_frames
from video_utils import ensure_clip

WINDOW = 5
import json

VIDEO_URL = "http://localhost:8000/videos/video.mp4"

def get_youtube_url():
    try:
        with open("video_config.json", "r") as f:
            config = json.load(f)
            return config.get("url", "https://www.youtube.com/watch?v=zhEWqfP6V_w")
    except:
        return "https://www.youtube.com/watch?v=zhEWqfP6V_w"

def detect_intent(query: str):
    q = query.lower()
    if "before" in q:
        return "before"
    elif "after" in q:
        return "after"
    return "during"

def intent_search(query: str):
    intent = detect_intent(query)

    clean = query.lower()
    for w in ["before", "after", "during"]:
        clean = clean.replace(w, "")
    clean = clean.strip()

    results = search_frames(clean)
    enhanced = []

    for r in results:
        # Use start time as reference for "before/after" logic
        ts = r["start"]
        end_ts = r["end"]

        if intent == "before":
            # Start earlier, end at the event
            adj_start = max(ts - WINDOW, 0)
            adj_end = ts
        elif intent == "after":
            # Start at event, end later
            adj_start = end_ts
            adj_end = end_ts + WINDOW
        else:
            # Show the event itself
            adj_start = ts
            adj_end = end_ts

        # Ensure minimum duration of 3 seconds for visibility
        if adj_end - adj_start < 3.0:
            diff = 3.0 - (adj_end - adj_start)
            adj_start = max(0, adj_start - diff / 2)
            adj_end = adj_end + diff / 2

        enhanced.append({
            "best_frame": r["best_frame"],
            "caption": r["caption"],
            "intent": intent,
            "original_start": ts,
            "original_end": end_ts,
            "start": adj_start,
            "end": adj_end,
            "score": r["score"],
            # "video_url": f"{VIDEO_URL}#t={adj_start},{adj_end}" # OLD
            "video_url": f"http://localhost:8000/clips/{ensure_clip(adj_start, adj_end)}",
            "full_video_url": f"{get_youtube_url()}&t={int(adj_start)}s"
        })

    return enhanced
