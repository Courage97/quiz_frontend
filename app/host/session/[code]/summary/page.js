'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function HostSessionSummaryPage() {
  const { code } = useParams();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/host/login');
      return;
    }

    const fetchSummary = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/sessions/${code}/summary/`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const payload = await res.json();
        payload.participants.sort((a, b) => b.score - a.score);
        setData(payload);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [code, token, router]);

  if (loading) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="glass rounded-3xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 loading-shimmer rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30"></div>
          <h2 className="text-2xl font-bold text-white mb-3">Loading Summary</h2>
          <p className="text-slate-300 text-lg">Gathering session data...</p>
          <div className="mt-6 flex justify-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="glass rounded-3xl p-12 max-w-lg w-full text-center border-2 border-red-400/30">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Unable to Load Summary</h2>
          <p className="text-slate-200 text-lg mb-6">We encountered an issue loading your session data.</p>
          <p className="text-slate-400 text-sm mb-8 font-mono bg-black/20 p-3 rounded-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const getRankIcon = (index) => {
    switch(index) {
      case 0: return '🏆';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🎯';
    }
  };

  const getRankColor = (index) => {
    switch(index) {
      case 0: return 'from-yellow-400 to-yellow-600';
      case 1: return 'from-gray-300 to-gray-500';
      case 2: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getRankBorder = (index) => {
    switch(index) {
      case 0: return 'border-yellow-400/50';
      case 1: return 'border-gray-400/50';
      case 2: return 'border-orange-400/50';
      default: return 'border-blue-400/30';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Enhanced Header */}
        <div className="glass rounded-3xl p-8 md:p-12 animate-slideInRight">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-3xl animate-glow">
              <span className="text-4xl">📊</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
              Session Complete
            </h1>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/20 border border-green-400/30 rounded-2xl">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 font-semibold text-lg">Summary Ready</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="glass rounded-2xl p-6 border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-xl font-bold text-blue-300">Quiz Title</h3>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white leading-tight">{data.quiz_title}</p>
            </div>
            
            <div className="glass rounded-2xl p-6 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🔑</span>
                </div>
                <h3 className="text-xl font-bold text-purple-300">Session Code</h3>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white font-mono tracking-wider">{data.session_code}</p>
            </div>
          </div>
        </div>

        {/* Enhanced Leaderboard */}
        <section className="quiz-card animate-slideInRight" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🏅</span>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white">Leaderboard</h2>
              <p className="text-slate-300 text-lg mt-1">{data.participants.length} participants competed</p>
            </div>
          </div>
          
          {data.participants.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-600/20 rounded-3xl flex items-center justify-center">
                <span className="text-4xl opacity-50">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-400 mb-3">No Participants Yet</h3>
              <p className="text-slate-500 text-lg">Results will appear here once participants join and complete the quiz.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.participants.map((participant, index) => (
                <div
                  key={index}
                  className={`glass rounded-2xl p-6 border-2 ${getRankBorder(index)} hover:scale-[1.02] transition-all duration-300 animate-slideInRight`}
                  style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${getRankColor(index)} rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl md:text-2xl font-bold text-white">{participant.name}</h3>
                          <span className="text-2xl">{getRankIcon(index)}</span>
                        </div>
                        {index === 0 && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded-lg">
                            <span className="text-yellow-300 font-semibold text-sm">CHAMPION</span>
                          </div>
                        )}
                        {index === 1 && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-400/20 border border-gray-400/30 rounded-lg">
                            <span className="text-gray-300 font-semibold text-sm">RUNNER UP</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                        {participant.score}
                      </div>
                      <div className="text-slate-400 font-medium">points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Enhanced Feedback Section */}
        <section className="quiz-card animate-slideInRight" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">💬</span>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white">Feedback</h2>
              <p className="text-slate-300 text-lg mt-1">What participants thought about the quiz</p>
            </div>
          </div>
          
          {data.feedback.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-purple-500/20 rounded-3xl flex items-center justify-center">
                <span className="text-4xl opacity-50">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-400 mb-3">No Feedback Yet</h3>
              <p className="text-slate-500 text-lg max-w-md mx-auto">
                Participant feedback and comments will be displayed here once submitted.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {data.feedback.map((feedback, index) => (
                <div
                  key={index}
                  className="glass rounded-2xl p-6 border-l-4 border-pink-400 hover:border-pink-300 transition-all duration-300 animate-slideInRight"
                  style={{ animationDelay: `${(index + 5) * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xl">
                        {feedback.participant__name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xl font-bold text-pink-300 mb-3">{feedback.participant__name}</h4>
                      <blockquote className="text-slate-200 text-lg leading-relaxed italic border-l-2 border-pink-400/30 pl-4">
                        "{feedback.comments}"
                      </blockquote>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slideInRight" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={() => router.push('/host/dashboard')}
            className="btn-secondary w-full sm:w-auto text-lg px-8 py-4"
          >
            <span className="mr-2">←</span>
            Back to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="btn-primary w-full sm:w-auto text-lg px-8 py-4"
          >
            <span className="mr-2">🖨️</span>
            Print Summary
          </button>
          <button
            onClick={() => {
              const summaryData = {
                quiz: data.quiz_title,
                code: data.session_code,
                participants: data.participants,
                feedback: data.feedback
              };
              navigator.clipboard.writeText(JSON.stringify(summaryData, null, 2));
            }}
            className="btn-secondary w-full sm:w-auto text-lg px-8 py-4"
          >
            <span className="mr-2">📋</span>
            Copy Data
          </button>
        </div>
      </div>
    </div>
  );
}