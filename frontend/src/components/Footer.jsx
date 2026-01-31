export default function Footer() {
  const stack = [
    'FastAPI',
    'yt-dlp',
    'ffmpeg',
    'Vit-GPT2',
    'SBERT',
    'ChromaDB',
    'Ollama / OpenAI',
    'React',
  ]
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-stack">
          <span className="footer-stack-label">Stack:</span>
          <span className="footer-stack-list">
            {stack.join(' · ')}
          </span>
        </div>
        <div className="footer-meta">
          <p className="footer-copy">
            Semantic Video Search: ingest → frame extraction (5 FPS) → image captioning (encoder–decoder) → sentence embeddings (cosine similarity) → vector store. Temporal intent (before/after/during) for clip boundaries; RAG over retrieved captions for explanations and suggestion prompts.
          </p>
          <p className="footer-legal">
            © {new Date().getFullYear()} — Frame-level captioning, dense retrieval &amp; RAG over ChromaDB.
          </p>
        </div>
      </div>
    </footer>
  )
}
