import subprocess
import os

video_path = "video.mp4"
frames_dir = "frames"

# Ensure directory exists
os.makedirs(frames_dir, exist_ok=True)

# ffmpeg command: extract at 5 FPS
# -vf fps=5: Filter to output 5 frames per second
# %04d: Sequence numbering padded with zeros (0001, 0002, ...)
cmd = [
    "ffmpeg",
    "-i", video_path,
    "-vf", "fps=5",
    f"{frames_dir}/frame_%04d.jpg"
]

print(f"Extracting frames from {video_path} to {frames_dir} at 5 FPS...")
subprocess.run(cmd)
print("Extraction complete.")
