export default function Footer() {
  const stack = [
    'FastAPI',
    'React',
    'ChromaDB',
    'Sentence Transformers',
    'Vit-GPT2',
    'RAG',
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
            Semantic Video Search — dense retrieval, temporal intent, RAG over vector store.
          </p>
          <p className="footer-legal">
            © {new Date().getFullYear()} — Frame-level captioning &amp; embedding-based search.
          </p>
        </div>
      </div>
    </footer>
  )
}
