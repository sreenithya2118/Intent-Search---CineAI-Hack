"""
Audio processing module: Extract audio from video, transcribe with Whisper, and store transcriptions.
"""
import os
import subprocess
import json
import re
from datetime import datetime

# Use same base dir as vector_store so transcriptions are always found
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO_DIR = os.path.join(BASE_DIR, "audio_extracts")
TRANSCRIPTIONS_FILE = os.path.join(BASE_DIR, "audio_transcriptions.txt")

def default_logger(msg):
    print(msg)

def extract_audio_from_video(video_path: str, output_audio_path: str, update_status=default_logger):
    """
    Extract audio from video file using ffmpeg.
    Returns path to extracted audio file.
    """
    try:
        os.makedirs(os.path.dirname(output_audio_path), exist_ok=True)
        update_status(f"🎵 Extracting audio from {os.path.basename(video_path)}...")
        
        cmd = [
            "ffmpeg",
            "-i", video_path,
            "-vn",  # No video
            "-acodec", "pcm_s16le",  # PCM 16-bit
            "-ar", "16000",  # 16kHz sample rate (good for Whisper)
            "-ac", "1",  # Mono
            "-y",  # Overwrite
            output_audio_path
        ]
        
        subprocess.run(
            cmd,
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        
        update_status(f"✅ Audio extracted: {os.path.basename(output_audio_path)}")
        return output_audio_path
    except subprocess.CalledProcessError as e:
        update_status(f"⚠️ Error extracting audio: {e}")
        raise
    except Exception as e:
        update_status(f"⚠️ Unexpected error in audio extraction: {e}")
        raise

def transcribe_audio_with_whisper(audio_path: str, video_prefix: str, update_status=default_logger):
    """
    Transcribe audio using Whisper and return segments with timestamps.
    Returns list of dicts: [{"start": float, "end": float, "text": str}, ...]
    """
    try:
        import whisper
        
        update_status("🤖 Loading Whisper model...")
        # Use base model for balance of speed and accuracy
        # Options: tiny, base, small, medium, large
        model = whisper.load_model("base")
        
        update_status(f"🎤 Transcribing audio: {os.path.basename(audio_path)}...")
        result = model.transcribe(
            audio_path,
            language=None,  # Auto-detect language
            task="transcribe",
            verbose=False
        )
        
        segments = []
        for segment in result.get("segments", []):
            segments.append({
                "start": segment["start"],
                "end": segment["end"],
                "text": segment["text"].strip()
            })
        
        update_status(f"✅ Transcribed {len(segments)} audio segments")
        return segments
        
    except ImportError:
        update_status("⚠️ Whisper not installed. Install with: pip install openai-whisper")
        return []
    except Exception as e:
        update_status(f"⚠️ Error transcribing audio: {e}")
        return []

def save_transcriptions_to_file(segments: list, video_prefix: str, video_path: str, update_status=default_logger):
    """
    Save transcriptions to audio_transcriptions.txt with format:
    video_prefix_timestamp: transcription_text
    """
    if not segments:
        return
    
    os.makedirs(os.path.dirname(TRANSCRIPTIONS_FILE) if os.path.dirname(TRANSCRIPTIONS_FILE) else ".", exist_ok=True)
    
    update_status(f"💾 Saving {len(segments)} transcriptions...")
    
    with open(TRANSCRIPTIONS_FILE, "a", encoding="utf-8") as f:
        for segment in segments:
            # Create a unique ID based on video prefix and timestamp
            # Format: youtube_001_audio_123.45 or clip_001_audio_123.45
            timestamp_id = f"{video_prefix}_audio_{segment['start']:.2f}"
            transcription = segment["text"]
            
            # Write: timestamp_id: transcription_text
            f.write(f"{timestamp_id}: {transcription}\n")
    
    update_status(f"✅ Saved transcriptions to {TRANSCRIPTIONS_FILE}")

def process_audio_for_video(video_path: str, video_prefix: str, update_status=default_logger):
    """
    Complete audio processing pipeline:
    1. Extract audio from video
    2. Transcribe with Whisper
    3. Save transcriptions to file
    
    Returns list of transcription segments.
    """
    try:
        # 1. Extract audio
        os.makedirs(AUDIO_DIR, exist_ok=True)
        audio_filename = f"{video_prefix}.wav"
        audio_path = os.path.join(AUDIO_DIR, audio_filename)
        
        extract_audio_from_video(video_path, audio_path, update_status)
        
        # 2. Transcribe
        segments = transcribe_audio_with_whisper(audio_path, video_prefix, update_status)
        
        if not segments:
            update_status("⚠️ No audio transcriptions generated")
            return []
        
        # 3. Save to file
        save_transcriptions_to_file(segments, video_prefix, video_path, update_status)
        
        return segments
        
    except Exception as e:
        update_status(f"⚠️ Error processing audio: {e}")
        return []

def get_existing_transcriptions():
    """Return set of transcription IDs already in audio_transcriptions.txt"""
    if not os.path.exists(TRANSCRIPTIONS_FILE):
        return set()
    existing = set()
    with open(TRANSCRIPTIONS_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if ": " in line:
                trans_id = line.strip().split(": ", 1)[0]
                existing.add(trans_id)
    return existing

