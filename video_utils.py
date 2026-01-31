import os
import subprocess
import re
import glob

VIDEO_PATH = "video.mp4"
CLIPS_DIR = "clips"
SOURCE_CLIPS_DIR = "source_clips"

# Ensure clips directory exists
os.makedirs(CLIPS_DIR, exist_ok=True)


def _get_source_video_for_frame(best_frame: str):
    """
    From frame filename, determine which source video to use.
    - frame_0001.jpg -> video.mp4 (legacy YouTube mode)
    - youtube_001_frame_0001.jpg -> source_clips/youtube_001.mp4
    - clip_001_frame_0001.jpg -> source_clips/clip_001.*
    Returns (video_path, source_id_or_none).
    """
    # Check for uploaded clip format
    m = re.match(r"clip_(\d+)_frame_\d+", best_frame)
    if m:
        clip_num = m.group(1).zfill(3)  # Normalize to 3 digits
        pattern = os.path.join(SOURCE_CLIPS_DIR, f"clip_{clip_num}.*")
        matches = glob.glob(pattern)
        if matches:
            return matches[0], f"clip_{clip_num}"
        # Fallback: try unpadded (e.g. clip_1)
        pattern2 = os.path.join(SOURCE_CLIPS_DIR, f"clip_{m.group(1)}.*")
        matches2 = glob.glob(pattern2)
        if matches2:
            return matches2[0], f"clip_{m.group(1)}"
    
    # Check for YouTube format with prefix - now stored in source_clips/
    m = re.match(r"youtube_(\d+)_frame_\d+", best_frame)
    if m:
        youtube_num = m.group(1).zfill(3)  # Normalize to 3 digits
        youtube_path = os.path.join(SOURCE_CLIPS_DIR, f"youtube_{youtube_num}.mp4")
        if os.path.exists(youtube_path):
            return youtube_path, f"youtube_{youtube_num}"
        # Fallback to video.mp4 for legacy
        return VIDEO_PATH, f"youtube_{youtube_num}"
    
    return VIDEO_PATH, None


def ensure_clip(start: float, end: float, best_frame: str = None) -> str:
    """
    Ensures a clip exists for the given start/end times.
    If best_frame is provided (e.g. clip_001_frame_0001.jpg), uses that clip's source video.
    Returns the filename of the generated clip.
    """
    # Round to reasonable precision to avoid duplicate clips for micro-diffs
    start = round(start, 2)
    end = round(end, 2)
    duration = round(end - start, 2)

    source_video, source_id = _get_source_video_for_frame(best_frame or "frame_0001.jpg")

    # Safe filename - include source_id to avoid collisions when multiple sources
    if source_id:
        filename = f"{source_id}_{start}_{end}.mp4"
    else:
        filename = f"clip_{start}_{end}.mp4"
    output_path = os.path.join(CLIPS_DIR, filename)

    if os.path.exists(output_path):
        return filename

    cmd_precise = [
        "ffmpeg",
        "-y",
        "-ss", str(start),
        "-i", source_video,
        "-t", str(duration),
        "-c:v", "libx264",
        "-c:a", "aac",
        "-strict", "experimental",
        output_path
    ]

    print(f"Generating clip: {filename}...")
    subprocess.run(cmd_precise, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    return filename
