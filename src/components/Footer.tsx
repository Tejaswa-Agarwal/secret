export default function Footer() {
  return (
    <footer className="border-t border-purple-500/20 bg-black/50 backdrop-blur-sm py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-purple-400 mb-4">AnimeHub</h3>
            <p className="text-gray-400 text-sm">Your ultimate destination for anime streaming.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-purple-400">New Releases</a></li>
              <li><a href="#" className="hover:text-purple-400">Popular</a></li>
              <li><a href="#" className="hover:text-purple-400">Trending</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-purple-400">Help Center</a></li>
              <li><a href="#" className="hover:text-purple-400">Contact Us</a></li>
              <li><a href="#" className="hover:text-purple-400">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-purple-400">Privacy</a></li>
              <li><a href="#" className="hover:text-purple-400">Terms</a></li>
              <li><a href="#" className="hover:text-purple-400">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2024 AnimeHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
