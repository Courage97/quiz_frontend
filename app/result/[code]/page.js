'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useRouter} from 'next/navigation';
import Link from 'next/link'

export default function ResultsPage() {
  const { code } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const participantId = searchParams.get('participant_id');
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  const submitFeedback = async () => {
    try {
      const payload = {
        participant: parseInt(participantId),
        comments: feedback.trim(),
        rating: rating
      };
      
      console.log('Submitting feedback:', payload);
      
      const res = await fetch('http://127.0.0.1:8000/api/feedback/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
        setSubmissionError(null);
      } else {
        const errorText = await res.text();
        console.error('Failed to submit feedback:', res.status, errorText);
        setSubmissionError(`Failed to submit feedback: ${errorText}`);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setSubmissionError('Network error submitting feedback. Please try again.');
    }
  };

  useEffect(() => {
    if (!participantId) {
      router.push('/');
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/sessions/${code}/results/?participant_id=${participantId}`
        );
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        const data = await res.json();
        console.log('API Response:', data); // Debug log
        setResults(data);
      } catch (err) {
        console.error('Failed to fetch results:', err);
        setError('Failed to fetch results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [code, participantId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Loading Results</h2>
          <p className="text-slate-600">Please wait while we fetch your quiz results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full border-l-4 border-red-500">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Handle different response formats
  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-l-4 border-yellow-500">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No Results Found</h2>
            <p className="text-slate-600">No results data was received from the server.</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if results has the expected structure
  if (!results.leaderboard || !Array.isArray(results.leaderboard)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Quiz Complete!</h1>
            <p className="text-lg text-slate-600">Your results are being processed</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">Well Done!</h2>
            <p className="text-slate-600 mb-6">Your quiz has been completed successfully.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Leave Your Feedback</h3>
            <textarea
              className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="How was your quiz experience?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="mt-4">
              <button
                onClick={submitFeedback}
                disabled={feedback.trim() === '' || submitted}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                {submitted ? 'Thank You!' : 'Submit Feedback'}
              </button>
            </div>
            {submissionError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{submissionError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Find the participant in the leaderboard
  const participantEntry = results.leaderboard.find(p => p.id === parseInt(participantId));
  if (!participantEntry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Quiz Results</h1>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-red-500">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Participant Not Found</h2>
            <p className="text-slate-600 mb-4">Invalid participant ID: {participantId}</p>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-800 mb-2">Available Participants:</h4>
              <div className="space-y-2">
                {results.leaderboard.map(p => (
                  <div key={p.id} className="flex justify-between items-center py-1">
                    <span className="text-slate-600">ID: {p.id}</span>
                    <span className="font-medium text-slate-800">{p.name || 'Unknown'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { name, correct_count } = participantEntry;
  const totalQuestions = results.leaderboard[0]?.total_questions || correct_count;
  const percentage = totalQuestions ? Math.round((correct_count / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Quiz Results</h1>
          <p className="text-slate-600">Great job completing the quiz!</p>
        </div>

        {/* Personal Score Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Hello, {name || 'Participant'}!</h2>
            <div className="flex items-center justify-center space-x-8">
              <div>
                <div className="text-4xl font-bold">{correct_count || 0}</div>
                <div className="text-blue-100">Correct Answers</div>
              </div>
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">{percentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <svg className="w-6 h-6 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L13.09 8.26L20 9.27L15 14.14L16.18 21.02L10 17.77L3.82 21.02L5 14.14L0 9.27L6.91 8.26L10 2Z" clipRule="evenodd" />
            </svg>
            Leaderboard
          </h3>
          <div className="space-y-3">
            {results.leaderboard.map((player, index) => {
              const isCurrentUser = parseInt(player.id) === parseInt(participantId);
              const position = index + 1;
              
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    isCurrentUser 
                      ? 'bg-blue-50 border-2 border-blue-200 shadow-md' 
                      : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      position === 1 ? 'bg-yellow-100 text-yellow-800' :
                      position === 2 ? 'bg-slate-100 text-slate-600' :
                      position === 3 ? 'bg-orange-100 text-orange-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {position}
                    </div>
                    <div>
                      <div className={`font-semibold ${isCurrentUser ? 'text-blue-800' : 'text-slate-800'}`}>
                        {player.name || 'Unknown'}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${isCurrentUser ? 'text-blue-600' : 'text-slate-800'}`}>
                      {player.correct_count || 0}
                    </div>
                    <div className="text-sm text-slate-500">points</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Share Your Experience</h3>
          
          <div className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                How would you rate this quiz?
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-colors ${
                      star <= rating ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {rating === 1 && "Needs improvement"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Great"}
                {rating === 5 && "Excellent"}
              </p>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Additional Comments
              </label>
              <textarea
                className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Tell us what you thought of the quiz..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/participant/${code}/summary?participant_id=${participantId}`}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-3 rounded-lg font-medium text-center transition-colors"
              >
                View Detailed Summary
              </Link>
              <button
                onClick={submitFeedback}
                disabled={feedback.trim() === '' || submitted}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                {submitted ? 'Feedback Submitted!' : 'Submit Feedback'}
              </button>
            </div>

            {/* Success/Error Messages */}
            {submissionError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700">{submissionError}</p>
                </div>
              </div>
            )}

            {submitted && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-700">Thank you for your feedback! It helps us improve.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}