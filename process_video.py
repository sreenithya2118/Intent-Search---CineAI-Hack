import sys
import os
import json
import subprocess
import hashlib
from datetime import datetime

def default_logger(msg):
    print(msg)

import re

FRAMES_DIR = "frames"
CAPTIONS_FILE = "captions.txt"
VIDEO_HISTORY_FILE = "video_history.json"
SOURCE_CLIPS_DIR = "source_clips"
FPS = 5

def get_youtube_video_id(url):
    """Extract YouTube video ID from URL."""
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
        r'(?:embed\/)([0-9A-Za-z_-]{11})',
        r'(?:youtu\.be\/)([0-9A-Za-z_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    # Fallback: generate hash from URL
    return hashlib.md5(url.encode()).hexdigest()[:11]

def get_next_youtube_index():
    """Find next available youtube index from existing frames."""
    if not os.path.exists(FRAMES_DIR):
        return 1
    max_idx = 0
    for f in os.listdir(FRAMES_DIR):
        m = re.match(r"youtube_(\d+)_frame", f, re.IGNORECASE)
        if m:
            max_idx = max(max_idx, int(m.group(1)))
    return max_idx + 1

def get_existing_captioned_frames():
    """Return set of frame filenames already in captions.txt"""
    if not os.path.exists(CAPTIONS_FILE):
        return set()
    existing = set()
    with open(CAPTIONS_FILE, "r") as f:
        for line in f:
            if ": " in line:
                frame = line.strip().split(": ", 1)[0]
                existing.add(frame)
    return existing

def load_video_history():
    """Load video processing history."""
    if os.path.exists(VIDEO_HISTORY_FILE):
        with open(VIDEO_HISTORY_FILE, "r") as f:
            return json.load(f)
    return {"videos": []}

def save_video_history(history):
    """Save video processing history."""
    with open(VIDEO_HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4)

def extract_frames_for_youtube(video_path: str, output_prefix: str, frames_dir: str):
    """Extract frames from a video with a given prefix (e.g. youtube_001_frame)."""
    os.makedirs(frames_dir, exist_ok=True)
    output_pattern = os.path.join(frames_dir, f"{output_prefix}_%04d.jpg")
    cmd = [
        "ffmpeg", "-i", video_path,
        "-vf", f"fps={FPS}",
        "-y", output_pattern
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def caption_new_frames_for_youtube(new_frame_paths, update_status=default_logger):
    """Generate captions for new frames and append to captions.txt."""
    if not new_frame_paths:
        return
    try:
        from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
        from PIL import Image
        import torch
        from tqdm import tqdm

        model_name = "nlpconnect/vit-gpt2-image-captioning"
        model = VisionEncoderDecoderModel.from_pretrained(model_name)
        feature_extractor = ViTImageProcessor.from_pretrained(model_name)
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        max_length, num_beams = 16, 4
        gen_kwargs = {"max_length": max_length, "num_beams": num_beams}

        def predict_step(paths):
            images = [Image.open(p).convert("RGB") for p in paths]
            pixel_values = feature_extractor(images=images, return_tensors="pt").pixel_values.to(device)
            output_ids = model.generate(pixel_values, **gen_kwargs)
            return [t.strip() for t in tokenizer.batch_decode(output_ids, skip_special_tokens=True)]

        with open(CAPTIONS_FILE, "a") as outf:
            for path in tqdm(new_frame_paths, desc="Captioning new frames"):
                frame = os.path.basename(path)
                try:
                    captions = predict_step([path])
                    outf.write(f"{frame}: {captions[0]}\n")
                    outf.flush()
                except Exception as e:
                    update_status(f"⚠️ Caption error for {frame}: {e}")
    except ImportError:
        update_status("⚠️ Transformers not available for incremental captioning")

def parse_time(time_str):
    """Converts HH:MM:SS,mmm or HH:MM:SS.mmm to seconds"""
    h, m, s = time_str.replace(',', '.').split(':')
    return int(h) * 3600 + int(m) * 60 + float(s)

def srt_to_captions(srt_path, output_path, fps=5, prefix="youtube_001"):
    """Parses SRT and appends to captions.txt mapping timestamps to frame numbers with prefix"""
    with open(srt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find blocks of: ID \n Start --> End \n Text
    blocks = re.findall(r'(\d+)\n(\d{2}:\d{2}:\d{2}[,.]\d{3}) --> (\d{2}:\d{2}:\d{2}[,.]\d{3})\n(.*?)(?=\n\n|\Z)', content, re.DOTALL)
    
    # Append mode instead of overwrite
    with open(output_path, 'a', encoding='utf-8') as f:
        for _, start_str, end_str, text in blocks:
            text = text.replace('\n', ' ').strip()
            if not text:
                continue
            
            start_sec = parse_time(start_str)
            end_sec = parse_time(end_str)
            
            # Map time range to frames
            start_frame = int(start_sec * fps)
            end_frame = int(end_sec * fps)
            
            for frame_idx in range(start_frame, end_frame + 1):
                # Using prefix for unique naming
                f.write(f"{prefix}_frame_{frame_idx:04d}.jpg: {text}\n")

def process_video_logic(youtube_url, update_status=default_logger):
    """
    Process YouTube video. INCREMENTAL: keeps existing frames and captions from all videos.
    Uses unique prefixes (youtube_001, youtube_002, etc.) to avoid conflicts.
    Saves YouTube video to source_clips/ so it appears in "Your uploaded clips".
    """
    try:
        update_status("Starting processing for: " + youtube_url)
        
        video_id = get_youtube_video_id(youtube_url)
        
        # Check if this video was already processed
        history = load_video_history()
        for v in history.get("videos", []):
            if v.get("video_id") == video_id:
                update_status(f"⚠️ Video {video_id} already processed. Skipping to avoid duplicates.")
                update_status("COMPLETED")
                return

        # 1. Get next youtube index and prepare directories (NO DELETION)
        youtube_idx = get_next_youtube_index()
        youtube_prefix = f"youtube_{youtube_idx:03d}"
        
        os.makedirs(FRAMES_DIR, exist_ok=True)
        os.makedirs("clips", exist_ok=True)
        os.makedirs(SOURCE_CLIPS_DIR, exist_ok=True)
        
        # Save YouTube video to source_clips/ so it appears in "Your uploaded clips"
        youtube_video_path = os.path.join(SOURCE_CLIPS_DIR, f"{youtube_prefix}.mp4")

        # 2. Download Video directly to source_clips/
        update_status("⬇️ Downloading video...")
        cmd_dl = [
            "yt-dlp",
            "-f", "best[ext=mp4]/best", 
            "-o", youtube_video_path,
            "--force-overwrites",
            "--extractor-args", "youtube:player_client=android",
            youtube_url
        ]
        subprocess.run(cmd_dl, check=True)
        
        update_status(f"📥 Saved as {youtube_prefix}.mp4 in source_clips/")

        # 3. Update Configuration (append to history, not replace)
        update_status("📝 Updating config...")
        config = {
            "mode": "youtube", 
            "url": youtube_url,
            "current_prefix": youtube_prefix,
            "video_id": video_id,
            "video_path": youtube_video_path
        }
        with open("video_config.json", "w") as f:
            json.dump(config, f, indent=4)
        
        # Add to video history
        history["videos"].append({
            "type": "youtube",
            "url": youtube_url,
            "video_id": video_id,
            "prefix": youtube_prefix,
            "video_path": youtube_video_path,
            "processed_at": datetime.now().isoformat()
        })
        save_video_history(history)
        
        # 4. Extract Frames with unique prefix (keeps existing frames)
        update_status(f"🎞️ Extracting frames (5 FPS) with prefix {youtube_prefix}...")
        extract_frames_for_youtube(youtube_video_path, f"{youtube_prefix}_frame", FRAMES_DIR)
        
        # Collect new frame paths
        new_frame_paths = []
        for f in os.listdir(FRAMES_DIR):
            if f.startswith(youtube_prefix) and f.endswith(".jpg"):
                new_frame_paths.append(os.path.join(FRAMES_DIR, f))
        new_frame_paths.sort()
        
        update_status(f"📁 Extracted {len(new_frame_paths)} frames")

        # 5. Generate Captions for NEW frames only (append to captions.txt)
        existing_captions = get_existing_captioned_frames()
        to_caption = [p for p in new_frame_paths if os.path.basename(p) not in existing_captions]
        
        if to_caption:
            update_status(f"🤖 Generating visual captions for {len(to_caption)} new frames...")
            caption_new_frames_for_youtube(to_caption, update_status)
        else:
            update_status("📝 No new frames to caption.")

        update_status("COMPLETED")
        
    except Exception as e:
        update_status(f"ERROR: {str(e)}")
        raise e

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_video.py <YOUTUBE_URL>")
        sys.exit(1)
    
    url = sys.argv[1]
    process_video_logic(url)
