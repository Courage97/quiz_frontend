'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Radio, CheckCircle, XCircle, Users, Wifi, WifiOff, Send, Timer, Trophy } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function ParticipantQuizPage() {
  const { code } = useParams()
  const searchParams = useSearchParams()
  const participantId = searchParams.get('participant_id')
  const router = useRouter()

  const socketRef = useRef(null)
  const timerRef = useRef(null)

  const [question, setQuestion] = useState(null)
  const [duration, setDuration] = useState(30)
  const [remaining, setRemaining] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [answeredPlayers, setAnsweredPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!participantId) {
      router.push('/')
      return
    }

    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/session/${code}/`)
    socketRef.current = socket

    socket.onopen = () => {
      console.log('✅ WebSocket connected')
      setLoading(false)
      setIsConnected(true)
      toast.success('Connected to quiz session!', {
        icon: '🎯',
        style: {
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#f8fafc'
        }
      })
    }

    socket.onerror = (e) => {
      console.error('❌ WebSocket error:', e)
      setLoading(false)
      setIsConnected(false)
      toast.error('Connection failed', {
        icon: '❌',
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f8fafc'
        }
      })
    }

    socket.onclose = () => {
      console.warn('🔌 WebSocket closed')
      setIsConnected(false)
      clearInterval(timerRef.current)
      toast.error('Connection lost', {
        icon: '🔌',
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f8fafc'
        }
      })
    }

    socket.onmessage = (e) => {
      console.log('🛰 WS message:', e.data)
      try {
        const data = JSON.parse(e.data)

        if (data.type === 'question_with_leaderboard') {
          setQuestion(data.question)
          setSelected(null)
          setAnswerSubmitted(false)
          setFeedback(null)
          setAnsweredPlayers([])
          const seconds = data.duration || 30
          setDuration(seconds)
          setRemaining(seconds)
          clearInterval(timerRef.current)
          
          toast.success('New question!', {
            icon: '❓',
            style: {
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#f8fafc'
            }
          })

          timerRef.current = setInterval(() => {
            setRemaining(prev => {
              if (prev <= 1) {
                clearInterval(timerRef.current)
                return 0
              }
              return prev - 1
            })
          }, 1000)
        }

        if (data.type === 'reveal_answer') {
          console.log('🟩 Reveal payload:', data)
          setFeedback({
            correct: data.correct_option,
            correct_participants: data.correct_participants,
            total_answers: data.total_answers,
            correct_count: data.correct_count
          })
          clearInterval(timerRef.current)
          
          const isCorrect = selected === data.correct_option
          toast.success(isCorrect ? 'Correct answer! 🎉' : 'Answer revealed', {
            icon: isCorrect ? '🎉' : '📝',
            style: {
              background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              border: isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
              color: '#f8fafc'
            }
          })
        }

        if (data.type === 'send_waiting_on') {
          console.log('👥 Players answered:', data.players)
          setAnsweredPlayers(data.players)
        }

        if (data.type === 'session_ended') {
          console.log('🛑 Session ended')
          toast.success('Quiz completed! Redirecting to results...', {
            icon: '🏁',
            style: {
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#f8fafc'
            }
          })
          setTimeout(() => {
            router.push(`/result/${code}?participant_id=${participantId}`)
          }, 2000)
        }
      } catch (err) {
        console.error('⚠️ Parsing WS message failed:', err)
      }
    }

    return () => {
      socket.close()
      clearInterval(timerRef.current)
    }
  }, [code, participantId, router])

  const handleSubmit = async () => {
    if (!selected || answerSubmitted) return
    
    setAnswerSubmitted(true)
    console.log('📝 Submit', { participantId, questionId: question.id, selected })
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/answers/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          participant: participantId,
          question: question.id,
          selected_option: selected
        })
      })
      
      if (!res.ok) {
        const data = await res.json()
        console.error('Error:', data)
        toast.error(data.detail || JSON.stringify(data), {
          icon: '❌',
          style: {
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f8fafc'
          }
        })
        setAnswerSubmitted(false)
      } else {
        toast.success('Answer submitted successfully!', {
          icon: '✅',
          style: {
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#f8fafc'
          }
        })
      }
    } catch (error) {
      console.error('Network error:', error)
      toast.error('Network error occurred. Please check your connection.', {
        icon: '🔌',
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f8fafc'
        }
      })
      setAnswerSubmitted(false)
    }
  }

  const getOptionClass = (option) => {
    const baseClass = "quiz-option w-full text-left relative overflow-hidden"
    
    if (!feedback && selected === option) {
      return `${baseClass} quiz-option-selected`
    }
    
    if (feedback) {
      if (feedback.correct === option) {
        return `${baseClass} quiz-option-correct`
      } else if (selected === option && feedback.correct !== option) {
        return `${baseClass} quiz-option-incorrect`
      }
    }
    
    return baseClass
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  }

  const optionVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  }

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#f8fafc'
          }
        }}
      />
      
      <motion.div
        className="w-full max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div 
          className="glass rounded-2xl p-6 mb-6"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="live-indicator">
                <div className="live-dot"></div>
                <span className="text-sm font-semibold">LIVE</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="w-4 h-4" />
                <span className="text-sm">Session: {code}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-400" />
              )}
              <span className="text-sm text-gray-300">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <motion.div
            className="quiz-card text-center py-16"
            variants={itemVariants}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <Radio className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gradient mb-4">
              Connecting to Session
            </h2>
            <p className="text-gray-300 text-lg">
              Please wait while we connect you to the quiz...
            </p>
          </motion.div>
        ) : question ? (
          <motion.div
            className="quiz-card"
            variants={itemVariants}
            key={question.id}
          >
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gradient">
                Question {question.id}
              </h1>
              
              <motion.div 
                className="flex items-center gap-2 px-4 py-2 glass rounded-full"
                animate={{ 
                  scale: remaining <= 10 ? [1, 1.05, 1] : 1,
                  color: remaining <= 10 ? '#ef4444' : '#f8fafc'
                }}
                transition={{ 
                  repeat: remaining <= 10 ? Infinity : 0,
                  duration: 1
                }}
              >
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg font-bold">
                  {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}
                </span>
              </motion.div>
            </div>

            {/* Question Text */}
            <motion.div 
              className="mb-8"
              variants={itemVariants}
            >
              <h2 className="text-xl text-white leading-relaxed">
                {question.text}
              </h2>
            </motion.div>

            {/* Options */}
            <motion.div 
              className="space-y-4 mb-6"
              variants={containerVariants}
            >
              {['A', 'B', 'C', 'D'].map((opt, index) => {
                const optionText = question[`option_${opt.toLowerCase()}`]
                if (!optionText) return null
                
                const isSelected = selected === opt
                const isCorrect = feedback?.correct === opt
                const isWrong = feedback && selected === opt && !isCorrect
                
                return (
                  <motion.button
                    key={opt}
                    className={getOptionClass(opt)}
                    disabled={answerSubmitted || remaining === 0}
                    onClick={() => setSelected(opt)}
                    variants={optionVariants}
                    whileHover={!answerSubmitted && remaining > 0 ? "hover" : undefined}
                    whileTap={!answerSubmitted && remaining > 0 ? "tap" : undefined}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                        {opt}
                      </div>
                      
                      <span className="flex-1 text-left text-lg">
                        {optionText}
                      </span>
                      
                      <AnimatePresence>
                        {isSelected && !feedback && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <Radio className="w-5 h-5 text-purple-400" />
                          </motion.div>
                        )}
                        
                        {isCorrect && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          </motion.div>
                        )}
                        
                        {isWrong && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <XCircle className="w-6 h-6 text-red-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {isSelected && !feedback && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl loading-shimmer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </motion.div>

            {/* Submit Button */}
            <AnimatePresence>
              {!answerSubmitted && selected && remaining > 0 && (
                <motion.button
                  onClick={handleSubmit}
                  className="w-full btn-primary flex items-center justify-center gap-3 text-lg py-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send className="w-5 h-5" />
                  Submit Answer
                </motion.button>
              )}
            </AnimatePresence>

            {/* Submission Status */}
            <AnimatePresence>
              {answerSubmitted && !feedback && (
                <motion.div
                  className="p-4 glass rounded-xl border-l-4 border-purple-500"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="animate-float">
                      <CheckCircle className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-purple-400 font-semibold">
                        Answer Submitted!
                      </p>
                      <p className="text-gray-300 text-sm">
                        Waiting for results...
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Answer Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  className="mt-6 p-6 glass rounded-xl border-l-4 border-green-500"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      <div>
                        <p className="text-lg font-semibold text-green-400">
                          Correct Answer: Option {feedback.correct}
                        </p>
                        <p className="text-gray-300 mt-1">
                          {question[`option_${feedback.correct.toLowerCase()}`]}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Users className="w-4 h-4" />
                      <span>
                        {feedback.correct_count} out of {feedback.total_answers} players got it right
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Players Status */}
            <AnimatePresence>
              {answeredPlayers.length > 0 && !feedback && (
                <motion.div
                  className="mt-4 p-4 glass rounded-xl border-l-4 border-blue-500"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <div className="flex items-center gap-3">
                    <Timer className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-blue-400 font-semibold text-sm">
                        Players who have answered: {answeredPlayers.join(', ')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            className="quiz-card text-center py-16"
            variants={itemVariants}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <Radio className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gradient mb-4">
              Waiting for Next Question
            </h2>
            <p className="text-gray-300 text-lg">
              The host will start the next question soon...
            </p>
            
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-purple-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}