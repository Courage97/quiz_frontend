'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { 
  Play, 
  Eye, 
  Square, 
  Users, 
  Clock, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  ArrowLeft,
  Send,
  Timer
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function HostSessionPage() {
  const { code } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const quizId = searchParams.get('quiz')

  const socketRef = useRef(null)
  const timerRef = useRef(null)

  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const [canReveal, setCanReveal] = useState(false)
  const [socketReady, setSocketReady] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)
  const [pushedQuestions, setPushedQuestions] = useState(new Set())
  const [sessionStats, setSessionStats] = useState({
    totalAnswers: 0,
    correctAnswers: 0
  })

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  useEffect(() => {
    if (!token || !quizId) return router.push('/host/login')

    const wsUrl = `ws://127.0.0.1:8000/ws/session/${code}/`
    console.log('Connecting to:', wsUrl)

    socketRef.current = new WebSocket(wsUrl)

    socketRef.current.onopen = () => {
      console.log('✅ Host WebSocket connected')
      setSocketReady(true)
      toast.success('Connected to session')
    }

    socketRef.current.onclose = () => {
      console.warn('WebSocket disconnected')
      setSocketReady(false)
      toast.error('Connection lost')
    }

    socketRef.current.onerror = (err) => {
      console.error('WebSocket error:', err)
      toast.error('Connection error')
    }

    socketRef.current.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      console.log('✅ Message received:', msg)

      if (msg.type === 'question_with_leaderboard') {
        clearInterval(timerRef.current)
        const now = Date.now() / 1000
        const startTime = parseFloat(msg.start_time)
        const expectedEnd = now + msg.duration

        setCurrentQuestion(msg.question)
        setCanReveal(false)
        setPushedQuestions(prev => new Set([...prev, msg.question.id]))
        toast.success('Question sent to participants!')

        const tick = () => {
          const remaining = Math.max(0, Math.round(expectedEnd - (Date.now() / 1000)))
          setCountdown(remaining)
          if (remaining <= 0) {
            clearInterval(timerRef.current)
            setCanReveal(true)
            toast('Time\'s up! You can now reveal the answer', { icon: '⏰' })
          }
        }

        tick()
        timerRef.current = setInterval(tick, 1000)
      }

      if (msg.type === 'reveal_answer') {
        toast.success(`Correct Answer: ${msg.correct_option}`, { duration: 5000 })
        setCanReveal(false)
        setCurrentQuestion(null)
        clearInterval(timerRef.current)
      }

      if (msg.type === 'session_ended') {
        toast.success(`Session ended: ${msg.message}`);
        clearInterval(timerRef.current);
        setCurrentQuestion(null);
      }
      
      if (msg.type === 'participant_count') {
        setParticipantCount(msg.count)
      }

      if (msg.type === 'answer_stats') {
        setSessionStats({
          totalAnswers: msg.total_answers,
          correctAnswers: msg.correct_answers
        })
      }
    }

    fetch(`http://127.0.0.1:8000/api/quizzes/${quizId}/questions/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setQuestions)
      .catch(() => toast.error('Failed to load questions'))

    return () => {
      clearInterval(timerRef.current)
      socketRef.current?.close()
    }
  }, [code, token, quizId, router])

  const pushQuestion = (q) => {
    if (!socketReady) {
      toast.error('Connection not ready')
      return
    }
    if (currentQuestion) {
      toast.error('Finish the current question first')
      return
    }

    socketRef.current.send(JSON.stringify({
      type: 'push_question',
      question: {
        ...q,
        duration: 60,
      }
    }))
  }

  const revealAnswer = () => {
    if (!currentQuestion) return
    socketRef.current.send(JSON.stringify({
      type: 'reveal_answer',
      question_id: currentQuestion.id,
      correct_option: currentQuestion.correct_option
    }))
  }

  const endSession = () => {
    if (!confirm('Are you sure you want to end this session? This action cannot be undone.')) return
    
    socketRef.current.send(JSON.stringify({
      type: 'end_session',
      message: 'Session ended by host.'
    }))
    router.push(`/host/session/${code}/summary`)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getConnectionStatus = () => {
    return socketReady ? (
      <div className="flex items-center gap-2 text-green-400">
        <Wifi size={16} />
        <span className="text-sm">Connected</span>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-red-400">
        <WifiOff size={16} />
        <span className="text-sm">Disconnected</span>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-dark)' }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/host/dashboard')}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Dashboard
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Session Control</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="live-indicator">
                  <div className="live-dot"></div>
                  <span className="text-sm font-medium">LIVE</span>
                </div>
                <span className="text-2xl font-mono text-gradient">{code}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {getConnectionStatus()}
            <div className="flex items-center gap-2 text-blue-400">
              <Users size={20} />
              <span className="text-lg font-semibold">{participantCount}</span>
              <span className="text-sm text-gray-400">participants</span>
            </div>
          </div>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Questions</p>
                <p className="text-2xl font-bold text-white">{questions.length}</p>
              </div>
              <BarChart3 size={32} className="text-blue-400" />
            </div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Questions Sent</p>
                <p className="text-2xl font-bold text-white">{pushedQuestions.size}</p>
              </div>
              <Send size={32} className="text-purple-400" />
            </div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Accuracy Rate</p>
                <p className="text-2xl font-bold text-white">
                  {sessionStats.totalAnswers > 0 
                    ? Math.round((sessionStats.correctAnswers / sessionStats.totalAnswers) * 100)
                    : 0}%
                </p>
              </div>
              <CheckCircle size={32} className="text-green-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Questions Panel */}
          <div className="lg:col-span-2">
            <div className="quiz-card">
              <div className="flex items-center gap-3 mb-6">
                <Play size={24} className="text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Questions</h2>
                <span className="text-sm text-gray-400">({questions.length} total)</span>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle size={48} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No questions available</p>
                  <p className="text-gray-500">Add questions to your quiz first</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {questions.map((q, index) => (
                    <div key={q.id} className={`quiz-option ${pushedQuestions.has(q.id) ? 'opacity-50' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-blue-400 font-semibold">Q{index + 1}</span>
                            {pushedQuestions.has(q.id) && (
                              <CheckCircle size={16} className="text-green-400" />
                            )}
                          </div>
                          <p className="text-white font-medium">{q.text}</p>
                          <div className="mt-2 text-sm text-gray-400">
                            <span>Correct: {q.correct_option}</span>
                          </div>
                        </div>
                        <button
                          disabled={!socketReady || !!currentQuestion || pushedQuestions.has(q.id)}
                          onClick={() => pushQuestion(q)}
                          className={`btn-primary flex items-center gap-2 ml-4 ${
                            (!socketReady || !!currentQuestion || pushedQuestions.has(q.id)) 
                              ? 'opacity-50 cursor-not-allowed' 
                              : ''
                          }`}
                        >
                          <Send size={16} />
                          {pushedQuestions.has(q.id) ? 'Sent' : 'Send'}
                        </button>
                      </div>
                    </div>  
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live Question & Controls */}
          <div className="space-y-6">
            {/* Current Question */}
            {currentQuestion ? (
              <div className="quiz-card animate-slideInRight">
                <div className="flex items-center gap-3 mb-4">
                  <div className="live-indicator">
                    <div className="live-dot"></div>
                    <span className="text-sm font-medium">LIVE</span>
                  </div>
                  <span className="text-white font-semibold">Current Question</span>
                </div>
                
                <div className="space-y-4">
                  <p className="text-white font-medium text-lg">{currentQuestion.text}</p>
                  
                  {/* Timer */}
                  <div className="flex items-center justify-center">
                    <div className={`text-center p-4 rounded-xl ${
                      countdown <= 10 ? 'bg-red-500/20 animate-pulse' : 'bg-blue-500/20'
                    }`}>
                      <Timer size={32} className={countdown <= 10 ? 'text-red-400 mx-auto mb-2' : 'text-blue-400 mx-auto mb-2'} />
                      <div className={`text-3xl font-bold ${countdown <= 10 ? 'text-red-400' : 'text-white'}`}>
                        {formatTime(countdown)}
                      </div>
                      <div className="text-sm text-gray-400">remaining</div>
                    </div>
                  </div>

                  {/* Options Preview */}
                  <div className="space-y-2">
                    <div className={`p-2 rounded-lg text-sm ${
                      currentQuestion.correct_option === 'A' ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-500/10'
                    }`}>
                      <span className="text-gray-400 font-medium">A.</span>
                      <span className="text-white ml-2">{currentQuestion.option_a}</span>
                    </div>
                    <div className={`p-2 rounded-lg text-sm ${
                      currentQuestion.correct_option === 'B' ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-500/10'
                    }`}>
                      <span className="text-gray-400 font-medium">B.</span>
                      <span className="text-white ml-2">{currentQuestion.option_b}</span>
                    </div>
                    {currentQuestion.option_c && (
                      <div className={`p-2 rounded-lg text-sm ${
                        currentQuestion.correct_option === 'C' ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-500/10'
                      }`}>
                        <span className="text-gray-400 font-medium">C.</span>
                        <span className="text-white ml-2">{currentQuestion.option_c}</span>
                      </div>
                    )}
                    {currentQuestion.option_d && (
                      <div className={`p-2 rounded-lg text-sm ${
                        currentQuestion.correct_option === 'D' ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-500/10'
                      }`}>
                        <span className="text-gray-400 font-medium">D.</span>
                        <span className="text-white ml-2">{currentQuestion.option_d}</span>
                      </div>
                    )}
                  </div>

                  {canReveal && (
                    <button
                      onClick={revealAnswer}
                      className="btn-primary w-full flex items-center justify-center gap-2 animate-glow"
                    >
                      <Eye size={18} />
                      Reveal Answer
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="quiz-card">
                <div className="text-center py-8">
                  <Clock size={48} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No active question</p>
                  <p className="text-gray-500 text-sm">Send a question to participants</p>
                </div>
              </div>
            )}

            {/* Session Controls */}
            <div className="quiz-card">
              <h3 className="text-lg font-semibold text-white mb-4">Session Controls</h3>
              <div className="space-y-3">
                <button
                  onClick={endSession}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-medium"
                >
                  <Square size={18} />
                  End Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}