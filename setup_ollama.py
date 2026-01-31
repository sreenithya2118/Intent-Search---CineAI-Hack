#!/usr/bin/env python3
"""
Setup script to verify Ollama installation and download llama3.2:1b model
"""
import subprocess
import sys
import requests
import time

def check_ollama_installed():
    """Check if Ollama is installed"""
    try:
        result = subprocess.run(
            ["ollama", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            print("✅ Ollama is installed")
            print(f"   Version: {result.stdout.strip()}")
            return True
        else:
            print("❌ Ollama is installed but not working properly")
            return False
    except FileNotFoundError:
        print("❌ Ollama is not installed")
        print("\n📥 Please install Ollama first:")
        print("   Windows: Download from https://ollama.ai/download")
        print("   Mac: brew install ollama")
        print("   Linux: curl -fsSL https://ollama.ai/install.sh | sh")
        return False
    except Exception as e:
        print(f"❌ Error checking Ollama: {e}")
        return False

def check_ollama_running():
    """Check if Ollama server is running"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            print("✅ Ollama server is running")
            return True
        else:
            print("⚠️ Ollama server responded with error")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Ollama server is not running")
        print("\n🔧 Please start Ollama:")
        print("   Windows: Ollama should auto-start, or search 'Ollama' in Start menu")
        print("   Mac/Linux: Run 'ollama serve' in terminal")
        return False
    except Exception as e:
        print(f"⚠️ Error checking Ollama server: {e}")
        return False

def check_model_downloaded(model_name="llama3.2:1b"):
    """Check if model is downloaded"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get("models", [])
            model_names = [m.get("name", "") for m in models]
            if model_name in model_names:
                print(f"✅ Model '{model_name}' is downloaded")
                return True
            else:
                print(f"❌ Model '{model_name}' is not downloaded")
                print(f"   Available models: {', '.join(model_names) if model_names else 'None'}")
                return False
    except Exception as e:
        print(f"⚠️ Error checking models: {e}")
        return False

def download_model(model_name="llama3.2:1b"):
    """Download the model"""
    print(f"\n📥 Downloading model '{model_name}'...")
    print("   This may take a few minutes (1.6 GB download)...")
    print("   Please wait...\n")
    
    try:
        # Start download
        process = subprocess.Popen(
            ["ollama", "pull", model_name],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        
        # Stream output
        for line in process.stdout:
            print(f"   {line.strip()}")
        
        process.wait()
        
        if process.returncode == 0:
            print(f"\n✅ Model '{model_name}' downloaded successfully!")
            return True
        else:
            print(f"\n❌ Failed to download model '{model_name}'")
            return False
    except Exception as e:
        print(f"\n❌ Error downloading model: {e}")
        return False

def test_model(model_name="llama3.2:1b"):
    """Test if model works"""
    print(f"\n🧪 Testing model '{model_name}'...")
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": model_name,
                "prompt": "Say hello in one sentence.",
                "stream": False
            },
            timeout=30
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Model is working!")
            print(f"   Response: {result.get('response', '')[:100]}...")
            return True
        else:
            print(f"❌ Model test failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing model: {e}")
        return False

def main():
    """Main setup function"""
    print("🦙 Ollama Setup Checker\n")
    print("=" * 50)
    
    # Step 1: Check if Ollama is installed
    print("\n[1/4] Checking Ollama installation...")
    if not check_ollama_installed():
        print("\n❌ Please install Ollama first and run this script again.")
        sys.exit(1)
    
    # Step 2: Check if Ollama server is running
    print("\n[2/4] Checking Ollama server...")
    if not check_ollama_running():
        print("\n❌ Please start Ollama server and run this script again.")
        sys.exit(1)
    
    # Step 3: Check if model is downloaded
    model_name = "llama3.2:1b"
    print(f"\n[3/4] Checking if model '{model_name}' is downloaded...")
    if not check_model_downloaded(model_name):
        # Download the model
        if not download_model(model_name):
            print("\n❌ Failed to download model. Please try manually:")
            print(f"   ollama pull {model_name}")
            sys.exit(1)
    else:
        print(f"✅ Model '{model_name}' is already downloaded")
    
    # Step 4: Test the model
    print(f"\n[4/4] Testing model '{model_name}'...")
    if not test_model(model_name):
        print("\n⚠️ Model test failed, but it might still work. Try using RAG search.")
    else:
        print("\n✅ Model is working correctly!")
    
    # Final summary
    print("\n" + "=" * 50)
    print("✅ Setup Complete!")
    print("\n📝 Next steps:")
    print("   1. Make sure .env file exists with Ollama configuration")
    print("   2. Install Python dependencies: pip install -r requirements.txt")
    print("   3. Start your server: uvicorn app:app --reload")
    print("   4. Test RAG search in the UI")
    print("\n🎉 You're ready to use free, local AI-powered video search!")

if __name__ == "__main__":
    main()

