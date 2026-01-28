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
        hits.append({
            "frame": frames[idx_val],
            "score": score_val,
            "caption": captions[idx_val],
            "timestamp": int(re.findall(r"\d+", frames[idx_val])[0]) / 5.0
        })

    # Sort by timestamp to enable clustering
    hits.sort(key=lambda x: x["timestamp"])

    # Cluster hits into clips
    clips = []
    if not hits:
        return []

    current_clip = [hits[0]]
    # Time gap threshold to consider frames part of same clip (e.g. 1.0 second)
    GAP_THRESHOLD = 1.0 

    for hit in hits[1:]:
        if hit["timestamp"] - current_clip[-1]["timestamp"] <= GAP_THRESHOLD:
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
