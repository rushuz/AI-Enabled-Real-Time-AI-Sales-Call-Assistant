import { Button } from '@/components/livekit/button';

function WelcomeImage() {
  return (
    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg mb-6">
      <svg
        width="80"
        height="80"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white size-20"
      >
        <path
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="scale(2.5) translate(4, 4)"
        />
      </svg>
    </div>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} className="bg-gradient-to-br from-orange-50 to-white min-h-[calc(100vh-200px)]">
      <section className="flex flex-col items-center justify-center text-center py-20 px-4">
        <WelcomeImage />

        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          TechPro <span className="text-orange-600">Sales Assistant</span>
        </h1>

        <p className="text-gray-600 max-w-2xl text-lg leading-relaxed mb-8">
          Experience AI-powered sales conversations with real-time sentiment analysis.
          Our intelligent assistant helps you understand customer needs and close more deals.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-md border border-orange-200">
            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
            <span className="text-gray-700 font-medium">Live Transcription</span>
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-md border border-orange-200">
            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <span className="text-gray-700 font-medium">Sentiment Analysis</span>
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-md border border-orange-200">
            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
            </svg>
            <span className="text-gray-700 font-medium">AI Recommendations</span>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={onStartCall}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-12 rounded-xl text-lg shadow-lg transform hover:scale-105 transition-all"
        >
          {startButtonText}
        </Button>

        <p className="text-sm text-gray-500 mt-6">
          Powered by LiveKit, Google Gemini AI, and Deepgram
        </p>
      </section>
    </div>
  );
};
