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

# Initialize embedding model (same as semantic_search.py)
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize ChromaDB (new client API - PersistentClient for local persistence)
client = chromadb.PersistentClient(path=CHROMA_PATH)

# Use cosine distance so "1 - distance" = cosine similarity (matches sentence-transformers)
collection = client.get_or_create_collection(
    name="video_captions",
    metadata={"hnsw:space": "cosine", "description": "Video frame captions and embeddings"}
)

def load_captions_to_vector_db():
    """Load captions.txt into vector database"""
    if not os.path.exists(CAPTIONS_PATH):
        print("⚠️ captions.txt not found.")
        return
    
    # Clear existing data (optional - remove if you want to keep old data)
    try:
        # Delete all items in collection
        all_ids = collection.get()["ids"]
        if all_ids:
            collection.delete(ids=all_ids)
    except Exception as e:
        print(f"⚠️ Could not clear existing data: {e}")
    
    captions = []
    frames = []
    ids = []
    
    # Read captions (use fixed path so it works regardless of cwd)
    with open(CAPTIONS_PATH, "r") as f:
        for idx, line in enumerate(f):
            if ": " in line:
                frame, caption = line.strip().split(": ", 1)
                frames.append(frame)
                captions.append(caption)
                ids.append(f"frame_{idx}")
    
    if not captions:
        print("⚠️ No captions found.")
        return
    
    # Generate embeddings
    print(f"🔄 Generating embeddings for {len(captions)} captions...")
    embeddings = embedding_model.encode(captions).tolist()
    
    # Extract timestamps for metadata
    timestamps = []
    for frame in frames:
        try:
            frame_num = int(re.findall(r"\d+", frame)[0])
            timestamp = frame_num / 5.0  # 5 FPS
            timestamps.append(timestamp)
        except:
            timestamps.append(0.0)
    
    # Store in vector DB (batch processing for large datasets)
    batch_size = 100
    print(f"💾 Storing {len(captions)} embeddings in vector database...")
    
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
            
            hits.append({
                "frame": metadata.get("frame", ""),
                "caption": doc,
                "score": score,
                "timestamp": metadata.get("timestamp", 0.0)
            })
        
        # Sort by timestamp for clustering
        hits.sort(key=lambda x: x["timestamp"])
        
        # Cluster hits (same logic as semantic_search.py)
        clips = []
        if not hits:
            return []
        
        current_clip = [hits[0]]
        GAP_THRESHOLD = 1.0
        
        for hit in hits[1:]:
            if hit["timestamp"] - current_clip[-1]["timestamp"] <= GAP_THRESHOLD:
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

