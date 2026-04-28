/**
 * AniStream Backend API
 * Self-hosted anime scraping server using @consumet/extensions
 *
 * Deploy to: Railway, Render, Fly.io, or any Node.js host
 * Set PORT env var if needed (default 4000)
 *
 * Endpoints:
 *   GET /health                        - health check
 *   GET /api/episodes/jikan/:malId     - episode list from Jikan (fast, reliable)
 *   GET /api/stream/hianime/:episodeId - HLS sources from Hianime scraper
 *   GET /api/stream/pahe/:sessionId    - HLS sources from AnimePahe
 *   GET /api/search/:query             - search anime
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Allow requests from the frontend (configure FRONTEND_URL in env)
app.use(cors({
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET'],
}));

app.use(express.json());

// ─── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Episodes from Jikan (MAL ID) ─────────────────────────────────────────────
app.get('/api/episodes/jikan/:malId', async (req, res) => {
  const { malId } = req.params;
  const page = parseInt(req.query.page ?? '1');
  try {
    const r = await fetch(`https://api.jikan.moe/v4/anime/${malId}/episodes?page=${page}`, {
      signal: AbortSignal.timeout(8000),
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Streaming from Hianime (via @consumet/extensions) ────────────────────────
app.get('/api/stream/hianime/:episodeId(*)', async (req, res) => {
  const episodeId = req.params.episodeId;
  try {
    const { ANIME } = await import('@consumet/extensions');
    const hianime = new ANIME.Hianime();
    // Hianime's fetchEpisodeSources - try subbed first
    const data = await Promise.race([
      hianime.fetchEpisodeSources(episodeId, 'sub'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
    ]);
    res.json(data);
  } catch (e) {
    res.status(503).json({ error: e.message, sources: [] });
  }
});

// ─── Streaming from META Anilist (uses Hianime internally) ────────────────────
app.get('/api/stream/anilist/:episodeId(*)', async (req, res) => {
  const episodeId = req.params.episodeId;
  try {
    const { META } = await import('@consumet/extensions');
    const al = new META.Anilist();
    const data = await Promise.race([
      al.fetchEpisodeSources(episodeId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
    ]);
    if (data?.sources?.length) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'No sources found', sources: [] });
    }
  } catch (e) {
    res.status(503).json({ error: e.message, sources: [] });
  }
});

// ─── Search anime ──────────────────────────────────────────────────────────────
app.get('/api/search/:query', async (req, res) => {
  const { query } = req.params;
  try {
    const { META } = await import('@consumet/extensions');
    const al = new META.Anilist();
    const results = await Promise.race([
      al.search(query),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
    ]);
    res.json(results);
  } catch (e) {
    res.status(503).json({ error: e.message, results: [] });
  }
});

// ─── Anime info + episodes (from Anilist meta provider) ───────────────────────
app.get('/api/anime/:anilistId', async (req, res) => {
  const { anilistId } = req.params;
  try {
    const { META } = await import('@consumet/extensions');
    const al = new META.Anilist();
    const data = await Promise.race([
      al.fetchAnimeInfo(anilistId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
    ]);
    res.json(data);
  } catch (e) {
    res.status(503).json({ error: e.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 AniStream Backend running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Stream: http://localhost:${PORT}/api/stream/anilist/<episodeId>`);
  console.log('\n   Set FRONTEND_URL env var to your frontend deployment URL');
  console.log('   Deploy to Railway/Render with: npm start\n');
});
