# 🎬 AnimeHub - Modern Anime Streaming Site

A beautiful, modern anime streaming platform built with **Next.js**, **React**, and **Tailwind CSS**.

## 🌟 Features

- **Beautiful UI**: Modern gradient design with purple and pink themes
- **Browse Anime**: Explore a collection of popular anime titles
- **Search Functionality**: Filter anime by title or genre
- **Anime Details**: View detailed information about each anime including:
  - Rating and episode count
  - Genre tags
  - Status (Ongoing/Completed)
  - Synopsis
  - Recommendations for similar anime
- **Favorites**: Add anime to your favorites (client-side storage ready)
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dark Mode**: Modern dark theme optimized for late-night viewing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Tech Stack

- **Frontend Framework**: Next.js 16
- **UI Library**: React 19
- **Styling**: Tailwind CSS with custom gradients
- **Language**: TypeScript
- **State Management**: React hooks
- **Dev Server**: Next.js built-in dev server

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page with search & grid
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── anime/
│   │   └── [id]/page.tsx     # Anime detail page
│   ├── browse/
│   │   └── page.tsx          # Browse page (placeholder)
│   └── trending/
│       └── page.tsx          # Trending page (placeholder)
├── components/
│   ├── Header.tsx            # Navigation header
│   ├── Footer.tsx            # Footer
│   └── AnimeCard.tsx         # Anime card component
├── types/
│   └── anime.ts              # TypeScript types
└── data/
    └── anime.ts              # Mock anime data
```

## 🎨 Features in Detail

### Home Page
- Search bar with real-time filtering
- Anime grid displaying 8 popular series
- Beautiful hero section with gradients
- Call-to-action for subscription

### Anime Detail Page
- Full anime poster and information
- Rating, episode count, status, and year
- Genre tags
- Complete synopsis
- "Watch Now" and "Watch Trailer" buttons
- Add to favorites functionality
- Related anime recommendations

### Responsive Navigation
- Sticky header with logo and navigation
- Mobile-friendly hamburger menu
- Smooth transitions and hover effects

## 📊 Sample Data

The site includes 8 popular anime with complete information:
1. Attack on Titan - 9.1 rating
2. Demon Slayer - 8.7 rating
3. Death Note - 9.0 rating
4. Steins;Gate - 9.1 rating
5. Jujutsu Kaisen - 8.8 rating
6. My Hero Academia - 8.3 rating
7. Neon Genesis Evangelion - 8.0 rating
8. Cowboy Bebop - 8.9 rating

## 🔧 Build for Production

```bash
npm run build
npm run start
```

## 🎯 Future Enhancements

- [ ] User authentication and profiles
- [ ] Backend database integration (MongoDB/PostgreSQL)
- [ ] Streaming video player integration
- [ ] User ratings and reviews
- [ ] Watchlist management
- [ ] Episode tracking
- [ ] Advanced filtering and sorting
- [ ] Recommendation algorithm
- [ ] Social features (comments, sharing)
- [ ] Admin panel for content management

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to submit PRs or open issues.

---

**Made with ❤️ using Next.js**
