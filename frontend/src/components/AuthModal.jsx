import React, { useState } from 'react';
import { X, Lock, Mail, User, Key, ShieldCheck, Zap, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setName('AWS Cloud Engineer');
    setEmail('developer@aws-serverless.io');
    setPassword('Serverless123!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-800 shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isRegister ? 'Create AWS Account' : 'AWS JWT Sign In'}
              </h2>
              <p className="text-xs text-gray-400">DynamoDB Auth & Custom Authorizer</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Fill Button */}
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            Auto-Fill Demo Credentials (1-Click)
          </button>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-950 border border-gray-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-gray-100 placeholder-gray-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@aws-serverless.io"
                  className="w-full bg-slate-950 border border-gray-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-gray-100 placeholder-gray-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-gray-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-gray-100 placeholder-gray-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full aws-btn-primary justify-center py-3 text-xs font-bold mt-2"
            >
              {loading ? (
                <span>Invoking AWS Lambda Auth...</span>
              ) : (
                <span className="flex items-center gap-2">
                  {isRegister ? 'Register Account' : 'Authenticate & Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Toggle Register / Login */}
          <div className="pt-2 text-center text-xs text-gray-400">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-amber-400 font-semibold hover:underline"
            >
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>

        {/* AWS Architecture Explanation Footer */}
        <div className="bg-slate-950/90 p-4 border-t border-gray-800 text-[11px] text-gray-400 space-y-1">
          <p className="font-semibold text-gray-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Security & Authentication Flow
          </p>
          <p className="text-gray-400">
            Passwords are hashed using <code className="text-amber-400 font-mono">Bcrypt</code> inside AWS Lambda and stored in Amazon DynamoDB. Issuing JWT tokens signed with SHA-256 for API Gateway Custom Authorizer verification.
          </p>
        </div>
      </div>
    </div>
  );
}
