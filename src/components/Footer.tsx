export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p style={{ marginBottom: 8 }}>
          <span style={{ background: 'linear-gradient(135deg,#a855f7,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800, fontSize: 18 }}>⚡ AniStream</span>
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          Powered by <a href="https://anilist.co" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', textDecoration: 'none' }}>AniList</a> &amp; <a href="https://consumet.org" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', textDecoration: 'none' }}>Consumet</a>
          &nbsp;·&nbsp; For educational purposes only
        </p>
      </div>
    </footer>
  );
}
