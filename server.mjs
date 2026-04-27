import express from 'express'
import fetch from 'node-fetch'

const app = express()
const PORT = 3000

app.set('view engine', 'ejs')
app.use(express.static('public'))

async function fetchAnime(search = '') {
  try {
    const query = search
      ? `query { Page(page:1,perPage:20) { media(search:"${search}",type:ANIME) { id title { english romaji } coverImage { large } averageScore episodes startDate { year } genres description } } }`
      : `query { Page(page:1,perPage:20) { media(type:ANIME,sort:SCORE_DESC) { id title { english romaji } coverImage { large } averageScore episodes startDate { year } genres description } } }`

    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    
    const data = await res.json()
    console.log('✅ Fetched anime data')
    return data.data?.Page?.media || []
  } catch (e) {
    console.error('❌ Fetch error:', e.message)
    return []
  }
}

app.get('/', async (req, res) => {
  try {
    const anime = await fetchAnime()
    res.render('index', { anime })
  } catch (err) {
    console.error('Route error:', err)
    res.send('<h1>Error loading page</h1>')
  }
})

app.get('/search', async (req, res) => {
  try {
    const q = req.query.q
    if (!q) return res.send('')
    
    const anime = await fetchAnime(q)
    
    let html = ''
    anime.forEach(a => {
      const title = a.title?.english || a.title?.romaji || 'Unknown'
      const cover = a.coverImage?.large || 'https://via.placeholder.com/300x400?text=No+Image'
      const rating = a.averageScore ? (a.averageScore / 10).toFixed(1) : '0'
      html += `<div class="bg-gray-900/50 rounded-lg overflow-hidden border border-purple-500/20 hover:border-purple-500 hover:scale-105 transition-all"><div class="h-64"><img src="${cover}" alt="${title}" class="w-full h-full object-cover"></div><div class="p-4"><h3 class="font-bold text-purple-300 truncate">${title}</h3><p class="text-sm text-gray-400">⭐ ${rating}</p></div></div>`
    })
    res.send(html || '<p class="col-span-full text-gray-400">No results</p>')
  } catch (err) {
    console.error('Search error:', err)
    res.send('<p class="text-red-400">Error</p>')
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ ANIMEHUB RUNNING: http://localhost:${PORT}`)
  console.log(`🌐 PUBLIC: http://0.0.0.0:${PORT}`)
  console.log(`💾 Ready for streaming!`)
})
