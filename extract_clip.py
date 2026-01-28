import subprocess
import re

video_path = "../video.mp4"
frames = ["frame_0044.jpg", "frame_0024.jpg"]  # sample frames

for frame in frames:
    sec = int(re.findall(r"\d+", frame)[0])
    start = max(sec - 3, 0)
    duration = 6

    output = f"clip_{sec}.mp4"

    cmd = [
        "ffmpeg",
        "-y",
        "-ss", str(start),
        "-i", video_path,
        "-t", str(duration),
        output
    ]

    subprocess.run(cmd)

    print(f"Created {output}")

