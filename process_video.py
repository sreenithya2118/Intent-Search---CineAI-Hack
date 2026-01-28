import sys
import os
import json
import shutil
import subprocess

def default_logger(msg):
    print(msg)

import re

def parse_time(time_str):
    """Converts HH:MM:SS,mmm or HH:MM:SS.mmm to seconds"""
    h, m, s = time_str.replace(',', '.').split(':')
    return int(h) * 3600 + int(m) * 60 + float(s)

def srt_to_captions(srt_path, output_path, fps=5):
    """Parses SRT and writes to captions.txt mapping timestamps to frame numbers"""
    with open(srt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find blocks of: ID \n Start --> End \n Text
    blocks = re.findall(r'(\d+)\n(\d{2}:\d{2}:\d{2}[,.]\d{3}) --> (\d{2}:\d{2}:\d{2}[,.]\d{3})\n(.*?)(?=\n\n|\Z)', content, re.DOTALL)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        for _, start_str, end_str, text in blocks:
            text = text.replace('\n', ' ').strip()
            if not text:
                continue
            
            start_sec = parse_time(start_str)
            end_sec = parse_time(end_str)
            
            # Map time range to frames
            start_frame = int(start_sec * fps)
            end_frame = int(end_sec * fps)
            
            # Write keyframes in this range (e.g. every 1 second or every frame? every frame is too much duplicate text)
            # Strategy: Write the caption for every frame in the duration to ensure dense searchability
            # or just write it once aligned to the start frame?
            # semantic_search clusters by timestamp. If we only have 1 frame per sentence, we might miss "during".
            # Visual captioning does every frame. Let's do every frame to match existing density.
            for frame_idx in range(start_frame, end_frame + 1):
                # Using 4 digit padding to match extract_frames format
                f.write(f"frame_{frame_idx:04d}.jpg: {text}\n")

def process_video_logic(youtube_url, update_status=default_logger):
    try:
        update_status("Starting processing for: " + youtube_url)

        # 1. Download Video
        update_status("⬇️ Downloading video...")
        cmd_dl = [
            "yt-dlp",
            "-f", "best[ext=mp4]/best", 
            "-o", "video.mp4",
            "--force-overwrites",
            "--extractor-args", "youtube:player_client=android",
            youtube_url
        ]
        # Capture output or check=True
        subprocess.run(cmd_dl, check=True)

        # 2. Update Configuration
        update_status("📝 Updating config...")
        config = {"url": youtube_url}
        with open("video_config.json", "w") as f:
            json.dump(config, f, indent=4)

        # 3. Clean up old data
        update_status("🧹 Cleaning up old frames and clips...")
        if os.path.exists("frames"):
            shutil.rmtree("frames")
        if os.path.exists("clips"):
            shutil.rmtree("clips")
        
        os.makedirs("frames", exist_ok=True)
        os.makedirs("clips", exist_ok=True)
        
        # 4. Extract Frames
        update_status("🎞️ Extracting frames (5 FPS)...")
        subprocess.run([sys.executable, "extract_frames.py"], check=True)

        # 5. Generate Captions (ALWAYS use Visual AI)
        update_status("🤖 Generating visual captions with ViT-GPT2 (this usually takes 5-10 mins)...")
        subprocess.run([sys.executable, "caption_frames.py"], check=True)

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
