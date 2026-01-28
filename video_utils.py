import os
import subprocess

VIDEO_PATH = "video.mp4"
CLIPS_DIR = "clips"

# Ensure clips directory exists
os.makedirs(CLIPS_DIR, exist_ok=True)

def ensure_clip(start: float, end: float) -> str:
    """
    Ensures a clip exists for the given start/end times.
    Returns the filename of the clip.
    """
    # Round to reasonable precision to avoid duplicate clips for micro-diffs
    start = round(start, 2)
    end = round(end, 2)
    duration = round(end - start, 2)
    
    # Safe filename
    filename = f"clip_{start}_{end}.mp4"
    output_path = os.path.join(CLIPS_DIR, filename)

    if os.path.exists(output_path):
        return filename

    # Generate clip if missing
    # -ss before -i is faster (seek)
    # -y overwrite
    # -avoid_negative_ts make_zero ensures timestamps start at 0
    cmd = [
        "ffmpeg",
        "-y",
        "-ss", str(start),
        "-i", VIDEO_PATH,
        "-t", str(duration),
        "-c", "copy", # Fast copy (might be imprecise keyframes), try re-encode if issues
        "-avoid_negative_ts", "make_zero",
        output_path
    ]
    
    # Using re-encoding for precision since 'copy' can snap to keyframes
    # and we need precise start times.
    cmd_precise = [
        "ffmpeg",
        "-y",
        "-ss", str(start),
        "-i", VIDEO_PATH,
        "-t", str(duration),
        "-c:v", "libx264", # Re-encode video
        "-c:a", "aac",     # Re-encode audio
        "-strict", "experimental",
        output_path
    ]

    print(f"Generating clip: {filename}...")
    # Using precise command (slower but accurate)
    subprocess.run(cmd_precise, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    return filename
