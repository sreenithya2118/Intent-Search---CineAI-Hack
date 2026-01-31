"""
Process multiple uploaded video clips.
Saves each clip, extracts frames with clip-prefixed names, generates captions.
Incremental: does not erase existing frames or captions.
"""
import sys
import os
import json
import re
import subprocess

def default_logger(msg):
    print(msg)

SOURCE_CLIPS_DIR = "source_clips"
FRAMES_DIR = "frames"
CAPTIONS_FILE = "captions.txt"
FPS = 5

def get_next_clip_index():
    """Find next available clip index from existing source_clips."""
    if not os.path.exists(SOURCE_CLIPS_DIR):
        return 1
    max_idx = 0
    for f in os.listdir(SOURCE_CLIPS_DIR):
        m = re.match(r"clip_(\d+)\..*", f, re.IGNORECASE)
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

def caption_new_frames(new_frame_paths, update_status=default_logger):
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
        update_status("⚠️ Falling back to caption_frames.py (will overwrite - run with transformers for incremental)")
        subprocess.run([sys.executable, "caption_frames.py"], check=True)

def extract_frames_for_clip(video_path: str, output_prefix: str, frames_dir: str):
    """Extract frames from a video with a given prefix (e.g. clip_001_frame)."""
    os.makedirs(frames_dir, exist_ok=True)
    output_pattern = os.path.join(frames_dir, f"{output_prefix}_%04d.jpg")
    cmd = [
        "ffmpeg", "-i", video_path,
        "-vf", f"fps={FPS}",
        "-y", output_pattern
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def process_clips_logic(file_data, update_status=default_logger):
    """
    Process multiple uploaded video files. Incremental: keeps existing frames and captions.
    file_data: list of (filename, file_content_bytes) - content read before passing.
    """
    try:
        update_status("Starting processing for uploaded clips...")

        # 1. Prepare dirs (do NOT delete frames or clips - keep existing)
        os.makedirs(SOURCE_CLIPS_DIR, exist_ok=True)
        os.makedirs(FRAMES_DIR, exist_ok=True)
        os.makedirs("clips", exist_ok=True)

        # 2. Find next clip index and save uploaded files
        start_idx = get_next_clip_index()
        saved_paths = []
        for i, (filename, content) in enumerate(file_data):
            clip_id = f"{start_idx + i:03d}"
            ext = os.path.splitext(filename)[1] or ".mp4"
            save_path = os.path.join(SOURCE_CLIPS_DIR, f"clip_{clip_id}{ext}")
            with open(save_path, "wb") as f:
                f.write(content)
            saved_paths.append((clip_id, save_path))
            update_status(f"📥 Saved clip {clip_id}: {os.path.basename(save_path)}")

        # 3. Update config with all sources
        all_sources = []
        if os.path.exists(SOURCE_CLIPS_DIR):
            for f in sorted(os.listdir(SOURCE_CLIPS_DIR)):
                if f.lower().endswith((".mp4", ".mov", ".webm", ".avi", ".mkv")):
                    all_sources.append(os.path.join(SOURCE_CLIPS_DIR, f))
        config = {"mode": "clips", "sources": all_sources, "clip_count": len(all_sources)}
        with open("video_config.json", "w") as f:
            json.dump(config, f, indent=4)

        # 4. Extract frames for new clips only (keep existing frames)
        new_frame_paths = []
        for clip_id, video_path in saved_paths:
            update_status(f"🎞️ Extracting frames from clip {clip_id}...")
            prefix = f"clip_{clip_id}_frame"
            extract_frames_for_clip(video_path, prefix, FRAMES_DIR)
            for f in os.listdir(FRAMES_DIR):
                if f.startswith(prefix) and f.endswith(".jpg"):
                    new_frame_paths.append(os.path.join(FRAMES_DIR, f))
        new_frame_paths.sort()

        # 5. Caption only new frames and append to captions.txt
        existing = get_existing_captioned_frames()
        to_caption = [p for p in new_frame_paths if os.path.basename(p) not in existing]
        if to_caption:
            update_status("🤖 Generating visual captions for new frames...")
            caption_new_frames(to_caption, update_status)
        else:
            update_status("📝 No new frames to caption.")

        update_status("COMPLETED")

    except Exception as e:
        update_status(f"ERROR: {str(e)}")
        raise e


if __name__ == "__main__":
    print("Use via FastAPI /process-clips endpoint with file uploads.")
