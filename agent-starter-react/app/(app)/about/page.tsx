export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-orange-600">About TechPro Sales Assistant</h1>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-orange-500">What is This Project?</h2>
          <p className="leading-relaxed">
            TechPro Sales Assistant is an advanced AI-powered voice conversation platform designed to enhance
            sales interactions between sales representatives and customers. The system uses cutting-edge voice
            technology and real-time sentiment analysis to provide insights that help sales teams better
            understand customer needs and improve conversion rates.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-orange-500">How It Works</h2>
          <div className="space-y-3">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-700 mb-2">1. Voice Interaction</h3>
              <p>Sales representatives can conduct natural voice conversations with customers through our
              LiveKit-powered interface. The AI assistant (Alex) engages customers professionally and naturally.</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-700 mb-2">2. Real-Time Transcription</h3>
              <p>All conversations are transcribed in real-time using Deepgram's state-of-the-art speech-to-text
              technology, creating an accurate record of the entire interaction.</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-700 mb-2">3. Sentiment Analysis</h3>
              <p>Using Google's Gemini AI, we analyze customer sentiment, confidence levels, and extract key points
              from each message. This provides real-time insights into customer interest and concerns.</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-700 mb-2">4. Actionable Recommendations</h3>
              <p>The system provides instant recommendations to sales representatives, helping them adapt their
              approach based on customer sentiment and engagement levels.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-orange-500">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-orange-200 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-600 mb-2">Frontend</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Next.js 15 & React 19</li>
                <li>LiveKit Components</li>
                <li>Tailwind CSS</li>
                <li>Framer Motion</li>
              </ul>
            </div>

            <div className="border border-orange-200 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-600 mb-2">Backend</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>FastAPI</li>
                <li>MongoDB</li>
                <li>Google Gemini AI</li>
                <li>Python 3.x</li>
              </ul>
            </div>

            <div className="border border-orange-200 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-600 mb-2">AI Agent</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>LiveKit Agents</li>
                <li>Deepgram STT/TTS</li>
                <li>Google Gemini 2.0 Flash</li>
                <li>Silero VAD</li>
              </ul>
            </div>

            <div className="border border-orange-200 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-600 mb-2">Storage</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>MongoDB Atlas</li>
                <li>Real-time transcripts</li>
                <li>User authentication</li>
                <li>Session history</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-orange-500">Key Features</h2>
          <ul className="list-disc list-inside space-y-2 leading-relaxed">
            <li>Real-time voice conversations with AI-powered sales assistant</li>
            <li>Live transcription of all conversations</li>
            <li>Instant sentiment analysis (positive, neutral, negative)</li>
            <li>Confidence scoring for each customer interaction</li>
            <li>Key point extraction from customer messages</li>
            <li>Actionable recommendations for sales representatives</li>
            <li>Secure user authentication and session management</li>
            <li>Beautiful, responsive interface with orange/white theme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-orange-500">Benefits</h2>
          <div className="bg-gradient-to-r from-orange-100 to-orange-50 p-6 rounded-lg border border-orange-200">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">✓</span>
                <span>Improve sales conversion rates with real-time insights</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">✓</span>
                <span>Understand customer sentiment and adapt your approach accordingly</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">✓</span>
                <span>Maintain complete records of all sales conversations</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">✓</span>
                <span>Train sales teams with AI-generated recommendations</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">✓</span>
                <span>Scale customer interactions without compromising quality</span>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-orange-500">Get Started</h2>
          <p className="leading-relaxed mb-4">
            Ready to transform your sales conversations? Click the "Start Call" button on the home page to
            begin your first AI-powered sales interaction. You'll see real-time transcriptions on the right
            and sentiment analysis on the left, giving you complete visibility into the conversation dynamics.
          </p>
          <a
            href="/"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Start Your First Call
          </a>
        </section>
      </div>
    </div>
  );
}
