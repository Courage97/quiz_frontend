'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Play, 
  Users, 
  Trophy, 
  Zap, 
  ArrowRight, 
  Sparkles,
  Brain,
  Target,
  Clock,
  Crown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const SessQHomepage = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!name || !sessionCode) {
      setError('Please enter your name and session code');
      toast.error('Please fill in all fields', {
        icon: <AlertCircle className="w-5 h-5" />,
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'white',
        },
      });
      return;
    }

    setLoading(true);
    setError('');
    
    // Show loading toast
    const loadingToast = toast.loading('Joining session...', {
      style: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
      },
    });

    try {
      const res = await fetch('http://127.0.0.1:8000/api/join/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, session_code: sessionCode.toUpperCase() })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success('Successfully joined session!', {
          id: loadingToast,
          icon: <CheckCircle className="w-5 h-5" />,
          style: {
            background: 'rgba(16, 185, 129, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'white',
          },
        });
        
        // Navigate after a brief delay to show success message
        setTimeout(() => {
          router.push(`/quiz/${sessionCode.toUpperCase()}?participant_id=${data.id}`);
        }, 1000);
      } else {
        const errorMessage = data.error || 'Failed to join session';
        setError(errorMessage);
        toast.error(errorMessage, {
          id: loadingToast,
          icon: <AlertCircle className="w-5 h-5" />,
          style: {
            background: 'rgba(239, 68, 68, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'white',
          },
        });
      }
    } catch (err) {
      const errorMessage = 'Something went wrong. Try again.';
      setError(errorMessage);
      toast.error(errorMessage, {
        id: loadingToast,
        icon: <AlertCircle className="w-5 h-5" />,
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'white',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHostLogin = () => {
    router.push('/host/login');
  };

  // Clear error when user starts typing
  useEffect(() => {
    if (error && (name || sessionCode)) {
      setError('');
    }
  }, [name, sessionCode, error]);

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-Time Battles",
      description: "Instant quiz battles powered by WebSockets for seamless real-time interaction",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Timed Questions",
      description: "Fast-paced challenges with instant feedback that test your speed and knowledge",
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Live Leaderboard",
      description: "Track your progress in real-time and compete with players worldwide",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Smart Analytics",
      description: "Detailed insights and performance tracking to improve your quiz skills",
      gradient: "from-emerald-400 to-cyan-500"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Pinterest Background with Overlay */}
      <div className="fixed inset-0 z-0">
        <iframe 
          src="https://assets.pinterest.com/ext/embed.html?id=175921929187918007" 
          className="w-full h-full"
          style={{ 
            transform: 'scale(1.1)', 
            transformOrigin: 'center',
            minWidth: '100vw',
            minHeight: '100vh'
          }}
          frameBorder="0" 
          scrolling="no"
        />
        {/* Subtle overlay for better readability */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </div>

      {/* Toast Container */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
          },
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 min-h-screen">
        {/* Header with Logo */}
        <motion.header 
          className="p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="top fixed flex items-center">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">
                SessQ
              </h1>
            </motion.div>
          </div>
        </motion.header>

        {/* Main Content - Two Column Layout */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
              
              {/* Left Side - Hero Content and Features */}
              <motion.div 
                className="space-y-12"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Hero Section */}
                <div className="space-y-6">
                  <motion.h2 
                    className="text-5xl md:text-6xl font-black text-white leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    Quiz Like Never
                    <motion.span 
                      className="block bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      Before
                    </motion.span>
                  </motion.h2>
                  
                  <motion.p 
                    className="text-xl text-gray-200 font-light leading-relaxed max-w-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  >
                    Join live quiz sessions, compete in real-time, and climb the leaderboard with friends and players worldwide.
                  </motion.p>
                </div>

                {/* Features Grid */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.0 + (index * 0.1) }}
                      whileHover={{ 
                        scale: 1.05, 
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)" 
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl mb-4 shadow-lg`}>
                        {feature.icon}
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Live Status */}
                <motion.div 
                  className="flex justify-center lg:justify-start"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                >
                  <motion.div 
                    className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-pink-600 px-6 py-3 rounded-full shadow-lg"
                    animate={{ 
                      boxShadow: [
                        "0 0 20px rgba(239, 68, 68, 0.3)",
                        "0 0 30px rgba(239, 68, 68, 0.6)",
                        "0 0 20px rgba(239, 68, 68, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.div 
                      className="w-3 h-3 bg-white rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-white font-semibold text-sm">
                      🔥 1,247 players online now
                    </span>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Right Side - Join Form */}
              <motion.div 
                className="flex flex-col items-center justify-center"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <motion.div 
                  className="w-full max-w-md"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                    <motion.div 
                      className="text-center mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <motion.div 
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl mb-4 shadow-lg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Play className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-2">Ready to Play?</h3>
                      <p className="text-gray-300">Enter your details to join a live session</p>
                    </motion.div>

                    <AnimatePresence>
                      {error && (
                        <motion.div 
                          className="bg-red-500/20 border border-red-400/50 rounded-2xl p-4 mb-6"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="text-red-200 text-sm text-center font-medium">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                    >
                      <motion.div 
                        className="relative"
                        whileFocus={{ scale: 1.02 }}
                      >
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-lg"
                          disabled={loading}
                        />
                        <Users className="absolute right-4 top-4 w-6 h-6 text-gray-400" />
                      </motion.div>
                      
                      <motion.div 
                        className="relative"
                        whileFocus={{ scale: 1.02 }}
                      >
                        <input
                          type="text"
                          placeholder="Session Code"
                          value={sessionCode}
                          onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                          className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-lg font-mono tracking-wider"
                          disabled={loading}
                        />
                        <Sparkles className="absolute right-4 top-4 w-6 h-6 text-gray-400" />
                      </motion.div>

                      <motion.button
                        onClick={handleJoin}
                        className={`w-full p-4 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg ${
                          loading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        animate={loading ? { 
                          boxShadow: [
                            "0 0 20px rgba(16, 185, 129, 0.3)",
                            "0 0 30px rgba(16, 185, 129, 0.6)",
                            "0 0 20px rgba(16, 185, 129, 0.3)"
                          ]
                        } : {}}
                        transition={{ duration: 2, repeat: loading ? Infinity : 0 }}
                      >
                        {loading ? (
                          <>
                            <motion.div 
                              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Joining Session...
                          </>
                        ) : (
                          <>
                            Join Quiz
                            <ArrowRight className="w-6 h-6" />
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Host Login */}
                <motion.div 
                  className="text-center mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <p className="text-gray-300 text-lg">
                    Want to host a quiz?{' '}
                    <motion.button
                      onClick={handleHostLogin}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline transition-all duration-300 inline-flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Crown className="w-5 h-5" />
                      Host Login
                    </motion.button>
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SessQHomepage;