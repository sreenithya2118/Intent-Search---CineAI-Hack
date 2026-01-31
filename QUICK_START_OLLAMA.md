# 🚀 Quick Start: Ollama Setup (Free Local LLM)

## Step-by-Step Setup

### Step 1: Install Ollama

**Windows:**
1. Go to: https://ollama.ai/download
2. Download the Windows installer
3. Run the installer
4. Ollama will start automatically

**Mac:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Step 2: Download llama3.2:1b Model

Open a **new terminal/command prompt** and run:

```bash
ollama pull llama3.2:1b
```

**Wait for download to complete** (~1.6 GB, takes 2-5 minutes depending on internet speed)

### Step 3: Verify Installation

Test that everything works:

```bash
ollama run llama3.2:1b "Hello, how are you?"
```

You should get a response from the AI.

### Step 4: Create .env File

Create a file named `.env` in your project root with this content:

```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
```

**Windows PowerShell:**
```powershell
echo "OLLAMA_URL=http://localhost:11434" > .env
echo "OLLAMA_MODEL=llama3.2:1b" >> .env
```

**Mac/Linux:**
```bash
cat > .env << EOF
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b
EOF
```

### Step 5: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs `requests` (needed for Ollama API calls).

### Step 6: Run Setup Checker (Optional)

```bash
python setup_ollama.py
```

This script will verify everything is set up correctly.

### Step 7: Start Your Server

```bash
uvicorn app:app --reload
```

### Step 8: Test RAG Search

1. Open frontend: http://localhost:5500
2. Process a video (if not already done)
3. Use "RAG-Enhanced Search"
4. Enter a query like: "hesitant reaction before answering"
5. You should see AI-generated explanations! 🎉

---

## System Requirements

- **RAM:** 4 GB minimum (8 GB recommended)
- **Storage:** 5 GB free space
- **CPU:** Any modern CPU (GPU optional)

---

## Troubleshooting

### "Cannot connect to Ollama"

**Solution:**
1. Make sure Ollama is running:
   ```bash
   ollama list
   ```
2. If not running:
   - Windows: Search "Ollama" in Start menu and open it
   - Mac/Linux: Run `ollama serve` in terminal

### "Model not found"

**Solution:**
```bash
ollama pull llama3.2:1b
```

### "Request timed out"

**Solution:**
- First request is slow (model loading, wait 10-20 seconds)
- This is normal, subsequent requests are faster

---

## What Changed?

✅ **Removed:** OpenAI API (paid)
✅ **Added:** Ollama (free, local)
✅ **Updated:** `rag_generator.py` to use Ollama
✅ **Updated:** `requirements.txt` (removed openai, added requests)

---

## Benefits

- ✅ **100% Free** - No API costs
- ✅ **Privacy** - All processing on your machine
- ✅ **Offline** - Works without internet (after download)
- ✅ **Fast** - 2-5 seconds per response
- ✅ **Small** - Only 1.6 GB download

---

## Next Steps

Once setup is complete, you can:
1. Use RAG search in the UI
2. Get AI explanations for search results
3. Get intelligent query suggestions
4. All completely free and local!

Enjoy your free AI-powered video search! 🎬🤖

