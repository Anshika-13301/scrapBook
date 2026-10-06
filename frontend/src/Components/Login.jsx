import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Mail, BookOpen } from 'lucide-react';

export default function Login({ setToken }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await axios.post(`https://scrapbook-270h.onrender.com${endpoint}`, { email, password });

      if (isRegister) {
        setMessage(res.data.message);
        setIsRegister(false);
      } else {
        setToken(res.data.token);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8f2] text-stone-800 font-serif flex items-center justify-center p-6 relative overflow-hidden">
      {/* Top Ribbon */}
      <div className="fixed top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-600 via-amber-500 to-rose-400" />

      {/* Main Form Box */}
      <div className="relative bg-white border border-stone-200/90 rounded-3xl p-8 md:p-10 shadow-xl max-w-md w-full z-10 font-sans">
        
        {/* Washi Tape Accent */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-amber-100/90 border border-amber-200/60 shadow-sm rotate-[1deg] z-20 pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-emerald-800 text-amber-100 rounded-2xl shadow-md mb-2 rotate-[-3deg]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-stone-800">
            {isRegister ? 'Register Email Access' : 'My Memory Vault'} 🌿
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {isRegister ? 'Authorized email registration' : 'Sign in to access your private scrapbook'}
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                placeholder="shuklaanshika115@gmail.com"
                className="w-full bg-stone-50 border border-stone-200 focus:border-emerald-600 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none transition-all shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-stone-50 border border-stone-200 focus:border-emerald-600 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none transition-all shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-emerald-800 hover:bg-emerald-900 text-amber-50 font-medium text-xs py-3 rounded-2xl shadow-md transition-all active:scale-[0.98]"
          >
            {isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500">
          {isRegister ? 'Already registered?' : 'First time signing in?'}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setMessage(''); }}
            className="text-emerald-800 hover:underline font-semibold ml-1"
          >
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}