'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Edit3, Trash2, ArrowLeft, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ManageQuestions() {
  const router = useRouter();
  const { id } = useParams();
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
  });

  useEffect(() => {
    if (!token) {
      router.push('/host/login');
      return;
    }
    const fetchData = async () => {
      await fetchQuiz();
      await fetchQuestions();
    };
    fetchData();
  }, [token, id, router]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/quizzes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
      } else {
        toast.error('Failed to fetch quiz details');
      }
    } catch (error) {
      toast.error('Error fetching quiz details');
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/questions/?quiz=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      } else {
        toast.error('Failed to fetch questions');
      }
    } catch (error) {
      toast.error('Error fetching questions');
    }
  };

  const handleInput = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitQuestion = async () => {
    if (!form.text || !form.option_a || !form.option_b || !form.correct_option) {
      toast.error('All fields are required (at least A and B options)');
      return;
    }

    setLoading(true);
    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `http://127.0.0.1:8000/api/questions/${editId}/`
      : `http://127.0.0.1:8000/api/questions/`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quiz: id, ...form }),
      });

      if (res.ok) {
        setForm({
          text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_option: 'A',
        });
        setEditId(null);
        await fetchQuestions();
        toast.success(editId ? 'Question updated successfully!' : 'Question added successfully!');
      } else {
        const errorData = await res.json();
        toast.error(`Failed to submit question: ${errorData.detail || res.statusText}`);
      }
    } catch (error) {
      toast.error('Error submitting question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const editQuestion = (question) => {
    setForm({
      text: question.text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c || '',
      option_d: question.option_d || '',
      correct_option: question.correct_option,
    });
    setEditId(question.id);
    toast.success('Question loaded for editing');
  };

  const cancelEdit = () => {
    setForm({
      text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
    });
    setEditId(null);
    toast('Edit cancelled');
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/questions/${questionId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchQuestions();
        toast.success('Question deleted successfully');
      } else {
        toast.error('Failed to delete question');
      }
    } catch (error) {
      toast.error('Error deleting question');
    }
  };

  const getCorrectOptionLabel = (option) => {
    const labels = { A: 'A', B: 'B', C: 'C', D: 'D' };
    return labels[option] || 'A';
  };

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-dark)' }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/host/dashboard')}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gradient">Manage Quiz Questions</h1>
        </div>

        {quiz && (
          <div className="glass rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">{quiz.title}</h2>
                <p className="text-gray-400 mt-1">Managing questions for this quiz</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">{questions.length}</div>
                  <div className="text-sm text-gray-400">Questions</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Add/Edit Question Form */}
        <div className="quiz-card">
          <div className="flex items-center gap-3 mb-6">
            {editId ? <Edit3 size={24} className="text-yellow-400" /> : <Plus size={24} className="text-blue-400" />}
            <h2 className="text-xl font-semibold text-white">
              {editId ? 'Edit Question' : 'Add New Question'}
            </h2>
          </div>

          <div className="space-y-4">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Question Text
              </label>
              <textarea
                placeholder="Enter your question..."
                value={form.text}
                onChange={(e) => handleInput('text', e.target.value)}
                className="w-full p-4 glass rounded-xl text-white placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Option A *
                </label>
                <input
                  type="text"
                  placeholder="Option A"
                  className="w-full p-3 glass rounded-xl text-white placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.option_a}
                  onChange={(e) => handleInput('option_a', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Option B *
                </label>
                <input
                  type="text"
                  placeholder="Option B"
                  className="w-full p-3 glass rounded-xl text-white placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.option_b}
                  onChange={(e) => handleInput('option_b', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Option C (optional)
                </label>
                <input
                  type="text"
                  placeholder="Option C"
                  className="w-full p-3 glass rounded-xl text-white placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.option_c}
                  onChange={(e) => handleInput('option_c', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Option D (optional)
                </label>
                <input
                  type="text"
                  placeholder="Option D"
                  className="w-full p-3 glass rounded-xl text-white placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.option_d}
                  onChange={(e) => handleInput('option_d', e.target.value)}
                />
              </div>
            </div>

            {/* Correct Option Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Correct Option
              </label>
              <select
                className="p-3 glass rounded-xl text-white border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                value={form.correct_option}
                onChange={(e) => handleInput('correct_option', e.target.value.toUpperCase())}
              >
                <option value="A" className="bg-gray-800">A</option>
                <option value="B" className="bg-gray-800">B</option>
                <option value="C" className="bg-gray-800">C</option>
                <option value="D" className="bg-gray-800">D</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={submitQuestion}
                disabled={loading}
                className={`btn-primary flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Save size={18} />
                {loading ? 'Saving...' : editId ? 'Update Question' : 'Add Question'}
              </button>
              {editId && (
                <button
                  onClick={cancelEdit}
                  className="btn-secondary flex items-center gap-2"
                >
                  <X size={18} />
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="quiz-card">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle size={24} className="text-green-400" />
            <h2 className="text-xl font-semibold text-white">Questions ({questions.length})</h2>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle size={48} className="text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No questions added yet</p>
              <p className="text-gray-500">Add your first question using the form above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={q.id} className="quiz-option group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-white text-lg mb-3">
                        {index + 1}. {q.text}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        <div className={`p-2 rounded-lg ${q.correct_option === 'A' ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-500/10'}`}>
                          <span className="text-gray-400 text-sm font-medium">A.</span>
                          <span className="text-white ml-2">{q.option_a}</span>
                        </div>
                        <div className={`p-2 rounded-lg ${q.correct_option === 'B' ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-500/10'}`}>
                          <span className="text-gray-400 text-sm font-medium">B.</span>
                          <span className="text-white ml-2">{q.option_b}</span>
                        </div>
                        {q.option_c && (
                          <div className={`p-2 rounded-lg ${q.correct_option === 'C' ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-500/10'}`}>
                            <span className="text-gray-400 text-sm font-medium">C.</span>
                            <span className="text-white ml-2">{q.option_c}</span>
                          </div>
                        )}
                        {q.option_d && (
                          <div className={`p-2 rounded-lg ${q.correct_option === 'D' ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-500/10'}`}>
                            <span className="text-gray-400 text-sm font-medium">D.</span>
                            <span className="text-white ml-2">{q.option_d}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-400" />
                        <span className="text-green-400 font-semibold text-sm">
                          Correct Answer: {getCorrectOptionLabel(q.correct_option)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => editQuestion(q)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors text-sm"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}