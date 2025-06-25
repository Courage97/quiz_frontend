// /app/quiz/[code]/page.js or similar
'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

export default function ParticipantQuizPage() {
  const { code } = useParams()
  const search = useSearchParams()
  const participantId = search.get('participant_id')
  const [question, setQuestion] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const [hasRevealed, setHasRevealed] = useState(false)
  const socketRef = useRef(null)
  const timerRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (!participantId) return router.push('/')

    const ws = new WebSocket(`ws://${window.location.host}/ws/session/${code}/`)
    socketRef.current = ws

    ws.onopen = () => console.log('✅ Participant WS connected')
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'question_with_leaderboard') {
        clearInterval(timerRef.current)
        setQuestion(msg.question)
        setHasRevealed(false)
        const start = parseFloat(msg.start_time)
        const end = start + msg.duration
        const tick = () => {
          const rem = Math.max(0, Math.round(end - Date.now()/1000))
          setCountdown(rem)
          if (rem <= 0) clearInterval(timerRef.current)
        }
        tick()
        timerRef.current = setInterval(tick, 1000)
      }
      else if (msg.type === 'reveal_answer') {
        setHasRevealed(true)
        clearInterval(timerRef.current)
      }
      else if (msg.type === 'session_ended') {
        alert(`Session ended`);
        router.push('/')
      }
    }

    return () => {
      clearInterval(timerRef.current)
      ws.close()
    }
  }, [code, participantId, router])

  const submitAnswer = async (option) => {
  if (!question || hasRevealed) {
    console.log('❌ Cannot submit: question not available or answer already revealed')
    return
  }

  // Disable all buttons to prevent double submission
  const buttons = document.querySelectorAll('button')
  buttons.forEach(btn => btn.disabled = true)

  const payload = {
    participant: parseInt(participantId), // Ensure it's an integer
    question: question.id,
    selected_option: option.toUpperCase() // Ensure consistent format
  }
  
  console.log('📤 Submitting answer with payload:', payload)
  
  try {
    const res = await fetch('http://127.0.0.1:8000/api/answers/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    if (!res.ok) {
      const errorData = await res.json()
      console.error('❌ Error response from API:', errorData)
      
      // Handle specific error types
      if (errorData.detail) {
        alert(errorData.detail)
      } else if (errorData.participant) {
        alert(`Participant error: ${errorData.participant.join(', ')}`)
      } else if (errorData.question) {
        alert(`Question error: ${errorData.question.join(', ')}`)
      } else if (errorData.selected_option) {
        alert(`Option error: ${errorData.selected_option.join(', ')}`)
      } else {
        alert(`Error: ${JSON.stringify(errorData)}`)
      }
    } else {
      const responseData = await res.json()
      console.log('✅ Answer submitted successfully:', responseData)
      
      // Show feedback to user
      const feedback = document.createElement('div')
      feedback.textContent = '✅ Answer submitted!'
      feedback.className = 'text-green-600 font-medium mt-2'
      document.querySelector('.space-y-2').appendChild(feedback)
    }
  } catch (error) {
    console.error('❌ Network error:', error)
    alert('Network error occurred. Please check your connection.')
  } finally {
    // Re-enable buttons after a short delay (unless revealed)
    setTimeout(() => {
      if (!hasRevealed) {
        buttons.forEach(btn => btn.disabled = false)
      }
    }, 1000)
  }
}

  return (
    <div>
      {question ? (
        <div>
          <h2>{question.text}</h2>
          <p>Time left: {countdown}s</p>
          {['A','B','C','D'].map(opt => (
            <button key={opt} disabled={hasRevealed} onClick={() => submitAnswer(opt)}>
              {question[`option_${opt.toLowerCase()}`]}
            </button>
          ))}
          {hasRevealed && <p>Correct answer: {question.correct_option}</p>}
        </div>
      ) : (
        <p>Waiting for next question…</p>
      )}
    </div>
  )
}
