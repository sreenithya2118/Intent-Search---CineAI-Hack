# vector_store.py
import chromadb
from sentence_transformers import SentenceTransformer
import os
import re

# Path fixed to this package dir so chroma_db is always Intent_search_AI/chroma_db
# regardless of where uvicorn is started (avoids empty DB when cwd differs)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma_db")
CAPTIONS_PATH = os.path.join(BASE_DIR, "captions.txt")
TRANSCRIPTIONS_PATH = os.path.join(BASE_DIR, "audio_transcriptions.txt")

# Initialize embedding model (same as semantic_search.py)
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize ChromaDB (new client API - PersistentClient for local persistence)
client = chromadb.PersistentClient(path=CHROMA_PATH)

# Use cosine distance so "1 - distance" = cosine similarity (matches sentence-transformers)
collection = client.get_or_create_collection(
    name="video_captions",
    metadata={"hnsw:space": "cosine", "description": "Video frame captions and embeddings"}
)

# Audio transcriptions collection (separate from video captions)
audio_collection = client.get_or_create_collection(
    name="audio_transcriptions",
    metadata={"hnsw:space": "cosine", "description": "Audio transcriptions and embeddings"}
)

def load_captions_to_vector_db(append_only=False):
    """
    Load captions.txt into vector database.
    append_only: If True, only add new captions (by frame name), don't clear existing.
    """
    if not os.path.exists(CAPTIONS_PATH):
        print("⚠️ captions.txt not found.")
        return

    captions = []
    frames = []
    ids = []

    with open(CAPTIONS_PATH, "r") as f:
        for idx, line in enumerate(f):
            if ": " in line:
                frame, caption = line.strip().split(": ", 1)
                frames.append(frame)
                captions.append(caption)
                ids.append(frame)  # Use frame filename as id for deduplication

    if not captions:
        print("⚠️ No captions found.")
        return

    # If append_only, skip frames already in the DB
    if append_only:
        try:
            existing = set(collection.get()["ids"])
            to_add = [(f, c, i) for f, c, i in zip(frames, captions, ids) if i not in existing]
            if not to_add:
                print("✅ No new captions to add to vector DB")
                return
            frames, captions, ids = zip(*to_add)
            frames, captions, ids = list(frames), list(captions), list(ids)
            print(f"🔄 Adding {len(captions)} new captions (skipping {len(existing)} existing)...")
        except Exception as e:
            print(f"⚠️ Could not check existing: {e}, doing full reload")
            append_only = False

    if not append_only:
        try:
            all_ids = collection.get()["ids"]
            if all_ids:
                collection.delete(ids=all_ids)
        except Exception as e:
            print(f"⚠️ Could not clear existing data: {e}")

    # Extract timestamps for metadata
    timestamps = []
    for frame in frames:
        try:
            nums = re.findall(r"\d+", frame)
            frame_num = int(nums[-1]) if nums else 0
            timestamp = frame_num / 5.0
            timestamps.append(timestamp)
        except:
            timestamps.append(0.0)

    print(f"🔄 Generating embeddings for {len(captions)} captions...")
    embeddings = embedding_model.encode(captions).tolist()

    batch_size = 100
    print(f"💾 Storing {len(captions)} captions in vector database...")
    for i in range(0, len(captions), batch_size):
        batch_end = min(i + batch_size, len(captions))
        collection.add(
            embeddings=embeddings[i:batch_end],
            documents=captions[i:batch_end],
            metadatas=[
                {"frame": frame, "timestamp": ts}
                for frame, ts in zip(frames[i:batch_end], timestamps[i:batch_end])
            ],
            ids=ids[i:batch_end]
        )
        print(f"  Stored {batch_end}/{len(captions)} captions...")
    print(f"✅ Stored {len(captions)} captions in vector database")


def ensure_vector_db_loaded():
    """If chroma_db is empty but captions.txt exists, load it. Keeps RAG ready on every startup."""
    try:
        if collection.count() == 0 and os.path.exists(CAPTIONS_PATH):
            print("🔄 Vector DB empty but captions.txt found — loading for RAG search...")
            load_captions_to_vector_db()
        if audio_collection.count() == 0 and os.path.exists(TRANSCRIPTIONS_PATH):
            print("🔄 Audio Vector DB empty but audio_transcriptions.txt found — loading...")
            load_transcriptions_to_vector_db()
    except Exception as e:
        print(f"⚠️ ensure_vector_db_loaded: {e}")


def search_vector_db(query, top_k=10, threshold=0.4):
    """Search vector database for similar captions"""
    try:
        # Check if collection has data
        count = collection.count()
        if count == 0:
            print("⚠️ Vector database is empty. Run load_captions_to_vector_db() first.")
            return []
        
        # Generate query embedding
        query_embedding = embedding_model.encode(query).tolist()
        
        # Search
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(50, count),
            include=["documents", "metadatas", "distances"]
        )
        
        # Process results
        hits = []
        for i, (doc, metadata, distance) in enumerate(zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        )):
            # Convert distance to similarity score (ChromaDB uses distance, lower is better)
            score = 1 - distance  # Convert to similarity
            
            if score < threshold:
                continue

            frame = metadata.get("frame", "")
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
                "caption": doc,
                "score": score,
                "timestamp": metadata.get("timestamp", 0.0),
                "clip_id": clip_id
            })
        
        # Sort by clip_id then timestamp for clustering (cluster within same clip)
        hits.sort(key=lambda x: (x["clip_id"], x["timestamp"]))
        
        # Cluster hits (same logic as semantic_search.py)
        clips = []
        if not hits:
            return []
        
        current_clip = [hits[0]]
        GAP_THRESHOLD = 1.0
        
        for hit in hits[1:]:
            same_clip = hit["clip_id"] == current_clip[-1]["clip_id"]
            time_gap_ok = hit["timestamp"] - current_clip[-1]["timestamp"] <= GAP_THRESHOLD
            if same_clip and time_gap_ok:
                current_clip.append(hit)
            else:
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
        
        clips.sort(key=lambda x: x["score"], reverse=True)
        return clips[:5]  # Return top 5 instead of 1
        
    except Exception as e:
        print(f"⚠️ Error searching vector database: {e}")
        return []


def get_sample_captions_for_suggestions(query: str, limit: int = 15):
    """
    Get caption samples from the DB for suggestion generation.
    Uses threshold=0 so we always get the 'closest' captions even when query doesn't match well.
    This ensures suggestions reflect ACTUAL video content (e.g. Spiderman) not hardcoded fallbacks.
    """
    try:
        count = collection.count()
        if count == 0:
            return []
        query_embedding = embedding_model.encode(query).tolist()
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(limit, count),
            include=["documents", "metadatas", "distances"]
        )
        out = []
        for doc, metadata, distance in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        ):
            out.append({
                "caption": doc,
                "score": 1 - distance,
                "timestamp": metadata.get("timestamp", 0.0),
                "frame": metadata.get("frame", "")
            })
        return out
    except Exception as e:
        print(f"⚠️ Error getting sample captions: {e}")
        return []


def load_transcriptions_to_vector_db(append_only=False):
    """
    Load audio_transcriptions.txt into vector database.
    append_only: If True, only add new transcriptions (by ID), don't clear existing.
    """
    if not os.path.exists(TRANSCRIPTIONS_PATH):
        # Not an error - file is created when audio is processed (requires openai-whisper)
        return

    transcriptions = []
    trans_ids = []
    timestamps = []

    with open(TRANSCRIPTIONS_PATH, "r", encoding="utf-8") as f:
        for line in f:
            if ": " in line:
                trans_id, text = line.strip().split(": ", 1)
                trans_ids.append(trans_id)
                transcriptions.append(text)
                
                # Extract timestamp from ID (format: prefix_audio_123.45)
                try:
                    match = re.search(r"_audio_([\d.]+)$", trans_id)
                    if match:
                        timestamps.append(float(match.group(1)))
                    else:
                        timestamps.append(0.0)
                except:
                    timestamps.append(0.0)

    if not transcriptions:
        print("⚠️ No transcriptions found.")
        return

    # If append_only, skip IDs already in the DB
    if append_only:
        try:
            existing = set(audio_collection.get()["ids"])
            to_add = [(t, tid, ts) for t, tid, ts in zip(transcriptions, trans_ids, timestamps) if tid not in existing]
            if not to_add:
                print("✅ No new transcriptions to add to vector DB")
                return
            transcriptions, trans_ids, timestamps = zip(*to_add)
            transcriptions, trans_ids, timestamps = list(transcriptions), list(trans_ids), list(timestamps)
            print(f"🔄 Adding {len(transcriptions)} new transcriptions (skipping {len(existing)} existing)...")
        except Exception as e:
            print(f"⚠️ Could not check existing: {e}, doing full reload")
            append_only = False

    if not append_only:
        try:
            all_ids = audio_collection.get()["ids"]
            if all_ids:
                audio_collection.delete(ids=all_ids)
        except Exception as e:
            print(f"⚠️ Could not clear existing audio data: {e}")

    print(f"🔄 Generating embeddings for {len(transcriptions)} transcriptions...")
    embeddings = embedding_model.encode(transcriptions).tolist()

    batch_size = 100
    print(f"💾 Storing {len(transcriptions)} transcriptions in vector database...")
    for i in range(0, len(transcriptions), batch_size):
        batch_end = min(i + batch_size, len(transcriptions))
        
        # Extract clip_id from transcription ID (zero-pad to 3 digits for consistency)
        clip_ids = []
        for tid in trans_ids[i:batch_end]:
            m = re.match(r"clip_(\d+)_audio", tid)
            if m:
                clip_ids.append(f"clip_{m.group(1).zfill(3)}")
            else:
                m = re.match(r"youtube_(\d+)_audio", tid)
                if m:
                    clip_ids.append(f"youtube_{m.group(1).zfill(3)}")
                else:
                    clip_ids.append("0")
        
        audio_collection.add(
            embeddings=embeddings[i:batch_end],
            documents=transcriptions[i:batch_end],
            metadatas=[
                {"transcription_id": tid, "timestamp": ts, "clip_id": cid}
                for tid, ts, cid in zip(trans_ids[i:batch_end], timestamps[i:batch_end], clip_ids)
            ],
            ids=trans_ids[i:batch_end]
        )
        print(f"  Stored {batch_end}/{len(transcriptions)} transcriptions...")
    print(f"✅ Stored {len(transcriptions)} transcriptions in vector database")


def search_audio_vector_db(query, top_k=10, threshold=0.4):
    """Search audio transcriptions vector database"""
    try:
        count = audio_collection.count()
        if count == 0:
            return []
        
        query_embedding = embedding_model.encode(query).tolist()
        
        results = audio_collection.query(
            query_embeddings=[query_embedding],
            n_results=min(50, count),
            include=["documents", "metadatas", "distances"]
        )
        
        hits = []
        for doc, metadata, distance in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        ):
            score = 1 - distance
            
            if score < threshold:
                continue
            
            cid = metadata.get("clip_id", "0")
            if cid == "0":
                tid = metadata.get("transcription_id", "")
                m = re.match(r"clip_(\d+)_audio", tid)
                if m:
                    cid = f"clip_{m.group(1).zfill(3)}"
                else:
                    m = re.match(r"youtube_(\d+)_audio", tid)
                    if m:
                        cid = f"youtube_{m.group(1).zfill(3)}"
            hits.append({
                "transcription_id": metadata.get("transcription_id", ""),
                "text": doc,
                "score": score,
                "timestamp": metadata.get("timestamp", 0.0),
                "clip_id": cid
            })
        
        # Sort and cluster similar to video search
        hits.sort(key=lambda x: (x["clip_id"], x["timestamp"]))
        
        clips = []
        if not hits:
            return []
        
        current_clip = [hits[0]]
        GAP_THRESHOLD = 2.0  # Slightly larger gap for audio (speech segments can be longer)
        
        for hit in hits[1:]:
            same_clip = hit["clip_id"] == current_clip[-1]["clip_id"]
            time_gap_ok = hit["timestamp"] - current_clip[-1]["timestamp"] <= GAP_THRESHOLD
            if same_clip and time_gap_ok:
                current_clip.append(hit)
            else:
                best_hit = max(current_clip, key=lambda x: x["score"])
                clips.append({
                    "start": current_clip[0]["timestamp"],
                    "end": current_clip[-1]["timestamp"],
                    "score": best_hit["score"],
                    "caption": best_hit["text"],
                    "best_frame": "",
                    "frame_count": len(current_clip),
                    "source": "audio",
                    "clip_id": best_hit["clip_id"]  # Needed for clip generation (youtube_002, clip_001)
                })
                current_clip = [hit]
        
        if current_clip:
            best_hit = max(current_clip, key=lambda x: x["score"])
            clips.append({
                "start": current_clip[0]["timestamp"],
                "end": current_clip[-1]["timestamp"],
                "score": best_hit["score"],
                "caption": best_hit["text"],
                "best_frame": "",
                "frame_count": len(current_clip),
                "source": "audio",
                "clip_id": best_hit["clip_id"]
            })
        
        clips.sort(key=lambda x: x["score"], reverse=True)
        return clips[:5]
        
    except Exception as e:
        print(f"⚠️ Error searching audio vector database: {e}")
        return []

