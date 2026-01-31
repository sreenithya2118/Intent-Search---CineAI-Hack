# rag_search.py
from vector_store import search_vector_db, search_audio_vector_db
from rag_generator import generate_explanation, generate_summary
from video_utils import ensure_clip, _get_source_video_for_frame
import json
import os
import re

def get_video_config():
    try:
        with open("video_config.json", "r") as f:
            return json.load(f)
    except:
        return {}

def get_full_video_url(best_frame: str, start: float):
    """Return URL for 'full video' - YouTube link or source clip depending on mode."""
    config = get_video_config()
    mode = config.get("mode", "youtube")
    if mode == "clips":
        source_path, _ = _get_source_video_for_frame(best_frame)
        if source_path and os.path.exists(source_path):
            # Use actual filename (could be .mp4, .mov, etc.)
            basename = os.path.basename(source_path)
            return f"http://localhost:8000/source_clips/{basename}"
    # YouTube mode
    url = config.get("url", "https://www.youtube.com/watch?v=zhEWqfP6V_w")
    return f"{url}&t={int(start)}s"

def _normalize_clip_id_for_frame(clip_id: str) -> str:
    """Ensure clip_id has 3-digit padding for frame lookup (clip_001, youtube_001)."""
    if not clip_id or clip_id == "0":
        return clip_id
    m = re.match(r"(clip|youtube)_(\d+)$", clip_id)
    if m:
        return f"{m.group(1)}_{m.group(2).zfill(3)}"
    return clip_id

def rag_search(query: str, audio_only: bool = False):
    """RAG-enhanced search with explanations. When audio_only=True, prioritizes dialog/audio matches."""
    
    # Step 1: Retrieve from video captions and/or audio transcriptions
    video_results = [] if audio_only else search_vector_db(query, top_k=10, threshold=0.4)
    audio_results = search_audio_vector_db(query, top_k=15 if audio_only else 10, threshold=0.35 if audio_only else 0.4)
    
    # Merge and deduplicate results (prioritize higher scores)
    all_results = []
    seen_timestamps = set()
    
    # Add video results
    for result in video_results:
        key = (result.get("clip_id", "0"), round(result["start"], 1))
        if key not in seen_timestamps:
            all_results.append(result)
            seen_timestamps.add(key)
    
    # Add audio results (dialog matches) - build best_frame for clip generation
    for result in audio_results:
        key = (result.get("clip_id", "0"), round(result["start"], 1))
        if key not in seen_timestamps:
            # Frame 0 may not exist (FFmpeg usually starts at 1); ensure min duration for single segment
            frame_num = max(1, int(result["start"] * 5))  # 5 FPS
            if result["start"] == result["end"]:
                result["end"] = result["start"] + 3.0  # Estimate ~3s for single utterance
            clip_id = _normalize_clip_id_for_frame(result.get("clip_id", "0"))
            if clip_id and clip_id != "0":
                result["best_frame"] = f"{clip_id}_frame_{frame_num:04d}.jpg"
            else:
                result["best_frame"] = "frame_0001.jpg"  # fallback
            all_results.append(result)
            seen_timestamps.add(key)
    
    # Sort by score; for audio_only we have only dialog matches
    all_results.sort(key=lambda x: x["score"], reverse=True)
    search_results = all_results[:15] if audio_only else all_results[:10]
    
    # Step 2: Apply temporal intent (reuse existing logic)
    intent_results = []
    if search_results:
        # Detect intent
        q_lower = query.lower()
        if "before" in q_lower:
            intent = "before"
        elif "after" in q_lower:
            intent = "after"
        else:
            intent = "during"
        
        # Clean query
        clean_query = query.lower()
        for w in ["before", "after", "during"]:
            clean_query = clean_query.replace(w, "")
        clean_query = clean_query.strip()
        
        # Apply temporal adjustments
        WINDOW = 5
        AUDIO_PAD = 1.0  # Extra padding for dialog clips so full phrase is heard
        for r in search_results:
            ts = r["start"]
            end_ts = r["end"]
            is_audio = r.get("source") == "audio"
            pad = AUDIO_PAD if is_audio else 0

            if intent == "before":
                adj_start = max(ts - WINDOW, 0)
                adj_end = ts
            elif intent == "after":
                adj_start = end_ts
                adj_end = end_ts + WINDOW
            else:
                adj_start = max(ts - pad, 0)
                adj_end = end_ts + pad

            # Ensure minimum duration
            if adj_end - adj_start < 3.0:
                diff = 3.0 - (adj_end - adj_start)
                adj_start = max(0, adj_start - diff / 2)
                adj_end = adj_end + diff / 2
            
            clip_filename = ensure_clip(adj_start, adj_end, r["best_frame"])
            full_url = get_full_video_url(r["best_frame"], adj_start)
            intent_results.append({
                "best_frame": r["best_frame"],
                "caption": r["caption"],
                "intent": intent,
                "original_start": ts,
                "original_end": end_ts,
                "start": adj_start,
                "end": adj_end,
                "score": r["score"],
                "video_url": f"http://localhost:8000/clips/{clip_filename}",
                "full_video_url": full_url,
                "is_youtube": get_video_config().get("mode", "youtube") != "clips",
                "source": r.get("source", "video")  # "video" or "audio"
            })
    
    # Step 3: Generate explanations (RAG)
    explanation = generate_explanation(query, search_results)
    summary = generate_summary(query, search_results)
    
    # Step 4: Return enhanced results
    return {
        "query": query,
        "results": intent_results,
        "explanation": explanation,
        "summary": summary,
        "count": len(intent_results)
    }

