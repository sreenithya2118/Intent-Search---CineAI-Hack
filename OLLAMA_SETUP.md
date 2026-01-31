# 🦙 Ollama Setup Guide - Free Local LLM

## Quick Setup Steps

### Step 1: Install Ollama

**Windows:**
1. Download from: https://ollama.ai/download
2. Run the installer
3. Ollama will start automatically

**Mac:**
```bash
brew install ollama
# OR download from: https://ollama.ai/download
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Step 2: Download llama3.2:1b Model

Open a new terminal/command prompt and run:

```bash
ollama pull llama3.2:1b
```

This will download ~1.6 GB model. Wait for it to complete.

**Expected output:**
```
pulling manifest 
pulling 8f8c8c8c8c8c... 100% ▕████████████████▏ 1.6 GB                         
pulling 9f9f9f9f9f9f... 100% ▕████████████████▏ 2.1 MB                         
verifying sha256 digest 
writing manifest 
success
```

### Step 3: Verify Installation

Test that Ollama is working:

```bash
ollama run llama3.2:1b "Hello, how are you?"
```

You should get a response from the model.

### Step 4: Start Your Application

```bash
# Make sure Ollama is running (it should start automatically)
# Then start your FastAPI server
uvicorn app:app --reload
```

### Step 5: Test RAG Search

1. Open your frontend: http://localhost:5500
2. Process a video (if not already done)
3. Use RAG-Enhanced Search
4. You should see AI-generated explanations!

---

## System Requirements

### Minimum (for llama3.2:1b):
- **RAM:** 4 GB (2-3 GB for model)
- **Storage:** 5 GB free space
- **CPU:** Any modern CPU

### Recommended:
- **RAM:** 8 GB
- **Storage:** 10 GB free space
- **CPU:** Multi-core processor

---

## Troubleshooting

### Issue: "Cannot connect to Ollama"

**Solution:**
1. Make sure Ollama is running:
   ```bash
   # Check if Ollama is running
   ollama list
   ```
2. If not running, start it:
   - Windows: Ollama should auto-start, or search "Ollama" in Start menu
   - Mac/Linux: Run `ollama serve` in terminal

### Issue: "Model not found"

**Solution:**
```bash
# Download the model again
ollama pull llama3.2:1b

# Verify it's downloaded
ollama list
```

### Issue: "Request timed out"

**Solution:**
- Model might be loading for first time (wait 10-20 seconds)
- Your CPU might be slow (this is normal, just wait)
- Try a smaller model if issues persist

### Issue: "Out of memory"

**Solution:**
- Close other applications
- Use smaller model: `llama3.2:1b` (already smallest)
- Restart your computer

---

## Model Information

**llama3.2:1b:**
- Size: 1.6 GB download
- RAM Usage: 2-3 GB
- Speed: Fast (2-5 seconds per response on CPU)
- Quality: Good for simple tasks
- Best for: Low-end systems, quick responses

---

## Advanced Configuration

### Change Model (if you have more RAM):

Edit `.env`:
```env
OLLAMA_MODEL=phi3:mini  # Better quality, needs 4-6 GB RAM
# OR
OLLAMA_MODEL=mistral:7b  # Best quality, needs 8+ GB RAM
```

Then download the new model:
```bash
ollama pull phi3:mini
# OR
ollama pull mistral:7b
```

### Change Ollama URL (if running on different machine):

Edit `.env`:
```env
OLLAMA_URL=http://192.168.1.100:11434
```

---

## Verification Checklist

- [ ] Ollama installed
- [ ] `ollama --version` works
- [ ] Model downloaded: `ollama pull llama3.2:1b`
- [ ] Model works: `ollama run llama3.2:1b "test"`
- [ ] `.env` file created with Ollama config
- [ ] FastAPI server running
- [ ] RAG search works in UI

---

## Performance Tips

1. **First request is slow** - Model loads into memory (~5-10 seconds)
2. **Subsequent requests are faster** - Model stays in memory
3. **CPU is fine** - GPU optional but not required
4. **Close other apps** - Free up RAM for better performance

---

## Summary

✅ **No API keys needed** - Completely free and local
✅ **No internet required** - Works offline after download
✅ **Privacy** - All processing happens on your machine
✅ **Fast** - 2-5 seconds per response
✅ **Small** - Only 1.6 GB download

Enjoy your free, local AI-powered video search! 🚀

