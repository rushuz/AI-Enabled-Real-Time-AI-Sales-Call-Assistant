"use client";

import { useEffect, useState } from "react";

interface SentimentData {
  sentiment: string;
  confidence: number;
  key_points: string[];
  recommendation_to_salesperson: string;
}

interface SentimentAnalysisProps {
  roomId: string;
  lastMessageTimestamp?: number;
}

export function SentimentAnalysis({ roomId, lastMessageTimestamp }: SentimentAnalysisProps) {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/get-latest-analysis?room_id=${encodeURIComponent(roomId)}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.analysis) {
            setSentimentData(data.analysis);
            setError(null);
          }
        } else {
          setError("Unable to fetch sentiment data");
        }
      } catch (err) {
        console.error("Error fetching sentiment:", err);
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchSentiment();

    // Poll every 3 seconds
    const interval = setInterval(fetchSentiment, 3000);

    return () => clearInterval(interval);
  }, [roomId, lastMessageTimestamp]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-300";
      case "negative":
        return "bg-red-100 text-red-800 border-red-300";
      case "neutral":
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "😊";
      case "negative":
        return "😟";
      case "neutral":
      default:
        return "😐";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return "text-green-600";
    if (confidence >= 0.4) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading && !sentimentData) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing conversation...</p>
        </div>
      </div>
    );
  }

  if (error && !sentimentData) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-6">
        <div className="text-center">
          <p className="text-gray-600">Waiting for conversation data...</p>
        </div>
      </div>
    );
  }

  if (!sentimentData) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-6">
        <div className="text-center">
          <p className="text-gray-600">No sentiment data available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-orange-50 to-white p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 shadow-md border-2 border-orange-200">
        <h2 className="text-xl font-bold text-orange-600 mb-1">Real-Time Analysis</h2>
        <p className="text-sm text-gray-600">AI-powered sentiment insights</p>
      </div>

      {/* Sentiment Card */}
      <div className="bg-white rounded-xl p-6 shadow-md border-2 border-orange-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Customer Sentiment
        </h3>
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{getSentimentEmoji(sentimentData.sentiment)}</div>
          <div className="flex-1">
            <div
              className={`inline-block px-4 py-2 rounded-full font-bold text-lg capitalize border-2 ${getSentimentColor(
                sentimentData.sentiment
              )}`}
            >
              {sentimentData.sentiment}
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="bg-white rounded-xl p-6 shadow-md border-2 border-orange-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Confidence Score
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-3xl font-bold ${getConfidenceColor(sentimentData.confidence)}`}>
              {(sentimentData.confidence * 100).toFixed(0)}%
            </span>
            <span className="text-sm text-gray-500">Accuracy</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${sentimentData.confidence * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Key Points */}
      <div className="bg-white rounded-xl p-6 shadow-md border-2 border-orange-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Key Points
        </h3>
        {sentimentData.key_points && sentimentData.key_points.length > 0 ? (
          <ul className="space-y-2">
            {sentimentData.key_points.map((point, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-orange-600 font-bold mt-1">•</span>
                <span className="text-gray-700 text-sm leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm italic">No key points identified yet</p>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl p-6 shadow-md border-2 border-orange-300">
        <h3 className="text-sm font-semibold text-orange-800 mb-3 uppercase tracking-wide flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Recommendation
        </h3>
        <p className="text-gray-800 leading-relaxed">
          {sentimentData.recommendation_to_salesperson || "Continue engaging with the customer"}
        </p>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live Updates Active</span>
      </div>
    </div>
  );
}
