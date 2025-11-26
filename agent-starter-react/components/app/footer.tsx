export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-orange-50 to-white border-t-2 border-orange-200">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold text-orange-600 mb-3">TechPro Sales Assistant</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              AI-powered voice conversation platform with real-time sentiment analysis for enhanced sales
              interactions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-orange-600 mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/login" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  Login
                </a>
              </li>
              <li>
                <a href="/signup" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  Sign Up
                </a>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h3 className="text-lg font-bold text-orange-600 mb-3">Powered By</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>LiveKit Agents</li>
              <li>Google Gemini AI</li>
              <li>Deepgram STT/TTS</li>
              <li>MongoDB Atlas</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-orange-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} TechPro Sales Assistant. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Built with</span>
              <a
                href="https://docs.livekit.io/agents"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 font-semibold underline"
              >
                LiveKit Agents
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
