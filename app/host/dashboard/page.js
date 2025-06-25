'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, Plus, Edit2, Settings, Play, BarChart3, Users, Clock, Sparkles, CheckCircle, XCircle } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast';

export default function HostDashboard() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [editingQuizId, setEditingQuizId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [sessionCode, setSessionCode] = useState(null)
  const [selectedQuizId, setSelectedQuizId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false)

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  // Custom toast configuration
  const toastConfig = {
    position: "top-right",
    autoClose: 6000, // 6 seconds
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    style: {
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      borderRadius: '12px',
    }
  }

  useEffect(() => {
    if (!token) {
      router.push('/host/login')
      return
    }
    fetchQuizzes()
  }, [token])

  const fetchQuizzes = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/api/quizzes/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setQuizzes(data)
    } catch {
      toast.error('Failed to load quizzes. Please try refreshing the page.', toastConfig)
    } finally {
      setIsLoading(false)
    }
  }

  const createQuiz = async () => {
    if (!newTitle.trim()) {
      toast.warn('Quiz title cannot be empty.', toastConfig)
      return
    }
    
    setIsCreatingQuiz(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/api/quizzes/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle.trim() })
      })
      if (!res.ok) throw new Error()
      
      setNewTitle('')
      toast.success(`Quiz "${newTitle}" created successfully!`, toastConfig)
      fetchQuizzes()
    } catch {
      toast.error('Failed to create quiz. Please try again.', toastConfig)
    } finally {
      setIsCreatingQuiz(false)
    }
  }

  const updateQuizTitle = async (quizId) => {
    if (!editingTitle.trim()) {
      toast.warn('Title cannot be empty', toastConfig)
      return
    }
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/quizzes/${quizId}/`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: editingTitle.trim() })
      })
      if (!res.ok) throw new Error()
      
      setEditingQuizId(null)
      setEditingTitle('')
      toast.success('Quiz title updated successfully!', toastConfig)
      fetchQuizzes()
    } catch {
      toast.error('Failed to update quiz title. Please try again.', toastConfig)
    }
  }

  const startSession = async (quizId) => {
    const quiz = quizzes.find(q => q.id === quizId)
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/sessions/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quiz_id: quizId })
      })
      const data = await res.json()
      
      if (res.ok) {
        setSessionCode(data.session_code)
        setSelectedQuizId(quizId)
        toast.success(`Session started for "${quiz?.title}"! Share code: ${data.session_code}`, toastConfig)
      } else {
        throw new Error()
      }
    } catch {
      toast.error('Failed to start session. Please try again.', toastConfig)
    }
  }

  const viewResults = (code) => {
    router.push(`/results/${code}`)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newTitle.trim()) {
      createQuiz()
    }
  }

  const handleEditKeyPress = (e, quizId) => {
    if (e.key === 'Enter') {
      updateQuizTitle(quizId)
    } else if (e.key === 'Escape') {
      setEditingQuizId(null)
      setEditingTitle('')
    }
  }

  return (
    <>
      <div className="min-h-screen bg-slate-950 relative">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:24px_24px]"></div>

        {/* Header */}
        <header className="relative z-10 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">SessQ</h1>
                  <p className="text-sm text-slate-400">Host Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>{quizzes.length} Quiz{quizzes.length !== 1 ? 'es' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Create New Quiz Section */}
          <section className="mb-8">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Create New Quiz</h2>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter your quiz title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    disabled={isCreatingQuiz}
                  />
                </div>
                <button
                  onClick={createQuiz}
                  disabled={isCreatingQuiz || !newTitle.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center"
                >
                  {isCreatingQuiz ? (
                    <div className="w-full p-4 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg animate-spin"></div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Quizzes Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Your Quizzes</h2>
              </div>
            </div>

            {isLoading && quizzes.length === 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-slate-900/30 border border-slate-800/30 rounded-2xl p-6 animate-pulse">
                    <div className="h-4 bg-slate-700/50 rounded mb-4"></div>
                    <div className="h-3 bg-slate-700/30 rounded mb-6"></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-8 bg-slate-700/30 rounded"></div>
                      <div className="h-8 bg-slate-700/30 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-800/50 rounded-full flex items-center justify-center">
                  <Brain className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No quizzes yet</h3>
                <p className="text-slate-400 mb-6">Create your first quiz to get started with SessQ!</p>
                <button
                  onClick={() => document.querySelector('input[placeholder="Enter your quiz title..."]')?.focus()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Create Your First Quiz
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map((quiz, index) => (
                  <div 
                    key={quiz.id} 
                    className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-slate-700/50 transition-all duration-300 group"
                  >
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-400">Recently created</span>
                      </div>
                      {quiz.session_code && (
                        <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-400 font-medium">ACTIVE</span>
                        </div>
                      )}
                    </div>

                    {editingQuizId === quiz.id ? (
                      <div className="space-y-4">
                        <input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyPress={(e) => handleEditKeyPress(e, quiz.id)}
                          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateQuizTitle(quiz.id)}
                            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingQuizId(null)
                              setEditingTitle('')
                            }}
                            className="flex-1 px-3 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition-colors duration-200 flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors duration-200">
                            {quiz.title}
                          </h3>
                          <p className="text-sm text-slate-400">Ready to launch</p>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => {
                                setEditingQuizId(quiz.id)
                                setEditingTitle(quiz.title)
                              }}
                              className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            
                            <button
                              onClick={() => router.push(`/host/quiz/manage/${quiz.id}`)}
                              className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                            >
                              <Settings className="w-4 h-4" />
                              Manage
                            </button>
                          </div>
                          
                          <button
                            onClick={() => startSession(quiz.id)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Start Session
                          </button>
                          
                          {quiz.session_code && (
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/50">
                              <button
                                onClick={() => viewResults(quiz.session_code)}
                                className="px-3 py-2 bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 text-sm rounded-lg hover:bg-emerald-600/30 transition-all duration-200 flex items-center justify-center gap-2"
                              >
                                <BarChart3 className="w-4 h-4" />
                                Results
                              </button>
                              <Link 
                                href={`/host/session/${quiz.session_code}/summary`} 
                                className="px-3 py-2 bg-blue-600/20 border border-blue-600/30 text-blue-400 text-sm rounded-lg hover:bg-blue-600/30 transition-all duration-200 flex items-center justify-center gap-2"
                              >
                                <Users className="w-4 h-4" />
                                Summary
                              </Link>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Session Created Modal */}
          {sessionCode && selectedQuizId && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">Session Active!</h3>
                  <p className="text-slate-400 mb-6">Share this code with participants:</p>
                  
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-mono tracking-wider">
                      {sessionCode}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSessionCode(null)
                        setSelectedQuizId(null)
                      }}
                      className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors duration-200"
                    >
                      Close
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/host/session/${sessionCode}?quiz=${selectedQuizId}`)
                      }
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    >
                      Control Session
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toast Container */}
      <Toaster
        position="top-right"
        autoClose={6000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '12px',
        }}
      />
    </>
  )
}