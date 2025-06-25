'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Brain, Trophy, Target, TrendingUp, Home, Share2, Printer, Award, Star, Zap } from 'lucide-react';

export default function ParticipantSessionSummaryPage() {
  const { code } = useParams();
  const searchParams = useSearchParams();
  const participantId = searchParams.get('participant_id');
  const router = useRouter();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!participantId) {
      router.push('/');
      return;
    }

    const fetchSummary = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/sessions/${code}/participant-summary/?participant_id=${participantId}`);
        if (!res.ok) throw new Error(`Failed to fetch summary. Status ${res.status}`);
        const data = await res.json();
        setSummary(data);
        
        // Trigger confetti for high scores
        if (data.accuracy >= 80) {
          setTimeout(() => setShowConfetti(true), 1000);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [code, participantId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-600 rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Analyzing Results</h2>
            <p className="text-slate-300 text-lg mb-6">Computing your performance metrics...</p>
            <div className="flex justify-center gap-2">
              {[0, 150, 300].map((delay, i) => (
                <div 
                  key={i}
                  className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-600 rounded-full animate-bounce" 
                  style={{animationDelay: `${delay}ms`}}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-6">
        <div className="backdrop-blur-xl bg-white/5 border border-red-400/30 rounded-3xl p-12 max-w-lg w-full text-center shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">!</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-red-400 mb-4">Results Unavailable</h2>
          <p className="text-slate-200 text-lg mb-6">We encountered an issue loading your quiz summary.</p>
          <div className="bg-black/30 border border-red-400/20 rounded-lg p-4 mb-8">
            <code className="text-red-300 text-sm">{error}</code>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getPerformanceLevel = (accuracy) => {
    if (accuracy >= 90) return { 
      level: 'Exceptional', 
      gradient: 'from-yellow-400 via-orange-500 to-red-500', 
      icon: Trophy, 
      message: 'Outstanding mastery!',
      bgColor: 'from-yellow-500/20 to-orange-500/20'
    };
    if (accuracy >= 80) return { 
      level: 'Excellent', 
      gradient: 'from-emerald-400 to-cyan-500', 
      icon: Star, 
      message: 'Impressive performance!',
      bgColor: 'from-emerald-500/20 to-cyan-500/20'
    };
    if (accuracy >= 70) return { 
      level: 'Good', 
      gradient: 'from-blue-400 to-purple-500', 
      icon: Target, 
      message: 'Well executed!',
      bgColor: 'from-blue-500/20 to-purple-500/20'
    };
    if (accuracy >= 60) return { 
      level: 'Fair', 
      gradient: 'from-orange-400 to-yellow-500', 
      icon: TrendingUp, 
      message: 'Room for growth!',
      bgColor: 'from-orange-500/20 to-yellow-500/20'
    };
    return { 
      level: 'Developing', 
      gradient: 'from-purple-400 to-pink-500', 
      icon: Zap, 
      message: 'Keep practicing!',
      bgColor: 'from-purple-500/20 to-pink-500/20'
    };
  };

  const performance = getPerformanceLevel(summary.accuracy);
  const completionRate = Math.round((summary.total_answers / summary.total_questions) * 100);
  const IconComponent = performance.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      )}

      <div className="relative z-10 p-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">SessQ</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Session</div>
              <div className="text-lg font-semibold text-white">{code}</div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-32 h-32 mb-6 bg-gradient-to-br ${performance.gradient} rounded-full shadow-2xl relative`}>
              <IconComponent className="w-16 h-16 text-white" />
              <div className="absolute -inset-2 bg-gradient-to-r from-white/20 to-transparent rounded-full blur-sm"></div>
            </div>
            <h1 className="text-6xl font-black text-white mb-4 tracking-tight">
              Quiz Complete!
            </h1>
            <p className="text-2xl text-slate-300 mb-8">{performance.message}</p>
            
            {/* Participant Badge */}
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-2xl backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">
                  {summary.participant.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-left">
                <div className="text-sm text-slate-400">Participant</div>
                <div className="text-2xl font-bold text-white">{summary.participant}</div>
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Score Display */}
            <div className="lg:col-span-1">
              <div className={`backdrop-blur-xl bg-gradient-to-br ${performance.bgColor} border border-white/10 rounded-3xl p-8 text-center shadow-2xl`}>
                <div className="text-8xl font-black text-white mb-4">{summary.score}</div>
                <div className="text-xl text-slate-300 font-medium mb-4">Total Points</div>
                <div className={`text-2xl font-bold bg-gradient-to-r ${performance.gradient} bg-clip-text text-transparent`}>
                  {performance.level}
                </div>
              </div>
            </div>

            {/* Accuracy Visualization */}
            <div className="lg:col-span-2">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Accuracy Score</h3>
                    <p className="text-slate-400">Your precision in answering questions</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-white">{summary.accuracy}%</div>
                    <div className="text-sm text-slate-400">Accuracy Rate</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${performance.gradient} transition-all duration-2000 ease-out relative`}
                    style={{ width: `${summary.accuracy}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Questions Answered */}
            <div className="backdrop-blur-xl bg-white/5 border border-blue-400/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{summary.total_answers}</div>
                  <div className="text-sm text-slate-400">of {summary.total_questions}</div>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-lg font-semibold text-blue-300">Questions Answered</div>
                <div className="text-sm text-slate-400">{completionRate}% completion rate</div>
              </div>
              <div className="bg-blue-500/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>

            {/* Correct Answers */}
            <div className="backdrop-blur-xl bg-white/5 border border-emerald-400/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{summary.correct_answers}</div>
                  <div className="text-sm text-slate-400">correct</div>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-lg font-semibold text-emerald-300">Correct Answers</div>
                <div className="text-sm text-slate-400">Great job on these!</div>
              </div>
              <div className="bg-emerald-500/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${summary.accuracy}%` }}
                ></div>
              </div>
            </div>

            {/* Incorrect Answers */}
            <div className="backdrop-blur-xl bg-white/5 border border-red-400/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{summary.total_answers - summary.correct_answers}</div>
                  <div className="text-sm text-slate-400">to improve</div>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-lg font-semibold text-red-300">Learning Opportunities</div>
                <div className="text-sm text-slate-400">Areas for growth</div>
              </div>
              <div className="bg-red-500/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${100 - summary.accuracy}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Achievement Badge */}
          {summary.accuracy >= 80 && (
            <div className="backdrop-blur-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/30 rounded-2xl p-8 text-center shadow-2xl mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-yellow-400 mb-2">Achievement Unlocked!</h3>
              <p className="text-xl text-slate-300">Excellence Award - 80%+ Accuracy</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
            <button
              onClick={() => {
                const summaryText = `SessQ Quiz Summary
Participant: ${summary.participant}
Score: ${summary.score} points
Accuracy: ${summary.accuracy}%
Performance: ${performance.level}
Questions: ${summary.total_answers}/${summary.total_questions}
Correct: ${summary.correct_answers}`;
                navigator.clipboard.writeText(summaryText);
              }}
              className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Share2 className="w-5 h-5" />
              Share Results
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Printer className="w-5 h-5" />
              Print Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}