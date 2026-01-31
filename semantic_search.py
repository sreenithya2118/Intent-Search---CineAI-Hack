from sentence_transformers import SentenceTransformer, util
import torch
import re

# Load model once (IMPORTANT for performance)
model = SentenceTransformer("all-MiniLM-L6-v2")

captions = []
frames = []
caption_embeddings = None

def load_data():
    global captions, frames, caption_embeddings
    captions = []
    frames = []
    
    if not os.path.exists("captions.txt"):
        print("⚠️ captions.txt not found. Search will return empty.")
        return

    with open("captions.txt", "r") as f:
        for line in f:
            if ": " in line:
                frame, caption = line.strip().split(": ", 1)
                frames.append(frame)
                captions.append(caption)

    if captions:
        print(f"🔄 Loading {len(captions)} captions into embeddings...")
        caption_embeddings = model.encode(captions, convert_to_tensor=True)
    else:
        print("⚠️ No captions found in file.")

# Initial load
import os
load_data()


def search(query, top_k=10, threshold=0.4):

    query_embedding = model.encode(query, convert_to_tensor=True)
    scores = util.cos_sim(query_embedding, caption_embeddings)[0]

    # Get a larger pool of potential matches to cluster
    top_results = torch.topk(scores, k=min(50, len(scores)))

    hits = []
    for score, idx in zip(top_results.values, top_results.indices):
        score_val = float(score)
        if score_val < threshold:
            continue
        
        idx_val = int(idx)
        frame = frames[idx_val]
        nums = re.findall(r"\d+", frame)
        ts = int(nums[-1]) / 5.0 if nums else 0.0
        
        # Support both clip_XXX and youtube_XXX prefixes
        m = re.match(r"clip_(\d+)_frame", frame)
        if m:
            clip_id = f"clip_{m.group(1)}"
        else:
            m = re.match(r"youtube_(\d+)_frame", frame)
            if m:
                clip_id = f"youtube_{m.group(1)}"
            else:
                clip_id = "0"
        
        hits.append({
            "frame": frame,
            "score": score_val,
            "caption": captions[idx_val],
            "timestamp": ts,
            "clip_id": clip_id
        })

    # Sort by clip_id then timestamp for clustering
    hits.sort(key=lambda x: (x["clip_id"], x["timestamp"]))

    # Cluster hits into clips
    clips = []
    if not hits:
        return []

    current_clip = [hits[0]]
    # Time gap threshold to consider frames part of same clip (e.g. 1.0 second)
    GAP_THRESHOLD = 1.0 

    for hit in hits[1:]:
        same_clip = hit["clip_id"] == current_clip[-1]["clip_id"]
        time_gap_ok = hit["timestamp"] - current_clip[-1]["timestamp"] <= GAP_THRESHOLD
        if same_clip and time_gap_ok:
            current_clip.append(hit)
        else:
            # Consolidate clip
            best_hit = max(current_clip, key=lambda x: x["score"])
            clips.append({
                "start": current_clip[0]["timestamp"],
                "end": current_clip[-1]["timestamp"],
                "score": best_hit["score"],
                "caption": best_hit["caption"],
                "best_frame": best_hit["frame"],
                "frame_count": len(current_clip)
            })
            current_clip = [hit]
    
    # Append last clip
    if current_clip:
        best_hit = max(current_clip, key=lambda x: x["score"])
        clips.append({
            "start": current_clip[0]["timestamp"],
            "end": current_clip[-1]["timestamp"],
            "score": best_hit["score"],
            "caption": best_hit["caption"],
            "best_frame": best_hit["frame"],
            "frame_count": len(current_clip)
        })

    # Sort clips by score (descending)
    clips.sort(key=lambda x: x["score"], reverse=True)

    # Return top clips (e.g. top 5) to avoid noise
    return clips[:1]


def search_frames(query):
    return search(query)
