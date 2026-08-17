import React, { useState } from 'react';
import { 
  Bot, 
  Server, 
  Key, 
  User, 
  LogOut, 
  ShieldCheck, 
  Cpu, 
  Activity,
  ChevronDown,
  Layers,
  Sparkles,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ 
  activeView, 
  setActiveView, 
  onOpenSettings, 
  onOpenAuth,
  apiKey 
}) {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="glass-panel border-b border-gray-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
      {/* Brand & AWS Badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Bot className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              AWS Serverless <span className="text-amber-500">AI Chatbot</span>
            </h1>
            <span className="aws-badge flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live AWS Lambda
            </span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-2">
            <span>React + Node.js</span> • <span>API Gateway</span> • <span>DynamoDB</span> • <span>OpenAI SSE</span>
          </p>
        </div>
      </div>

      {/* View Switcher & Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Navigation Tabs */}
        <div className="bg-slate-900/80 p-1 rounded-xl border border-gray-800 flex items-center gap-1">
          <button
            onClick={() => setActiveView('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeView === 'chat'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Chat View
          </button>
          
          <button
            onClick={() => setActiveView('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeView === 'architecture'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Cloud Architecture & Telemetry
          </button>
        </div>

        {/* API Key Modal / Settings Button */}
        <button
          onClick={onOpenSettings}
          className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
            apiKey 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 font-semibold' 
              : 'bg-slate-800/80 border-amber-500/40 text-amber-400 hover:bg-slate-700/80 font-semibold shadow-lg shadow-amber-500/10'
          }`}
          title="Configure OpenAI API Key & Model Settings"
        >
          <Settings className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span className="font-semibold">
            {apiKey ? 'Settings (Key Active)' : 'Settings'}
          </span>
        </button>

        {/* User Account Dropdown / Auth Button */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-slate-800/80 border border-gray-700 hover:border-amber-500/40 transition-all text-xs text-left"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 font-bold flex items-center justify-center text-xs uppercase">
                {user.name ? user.name[0] : user.email[0]}
              </div>
              <div className="hidden md:block">
                <p className="font-semibold text-gray-200 leading-tight">{user.name || user.email}</p>
                <p className="text-[10px] text-amber-400 flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" /> JWT Verified
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl shadow-2xl py-2 z-50 border border-gray-800">
                <div className="px-3 py-2 border-b border-gray-800">
                  <p className="text-xs font-semibold text-gray-200">{user.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                  <span className="mt-1 inline-block text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono">
                    User ID: {user.userId.slice(0, 12)}...
                  </span>
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-950/30 flex items-center gap-2 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out (Clear JWT)
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="aws-btn-primary text-xs"
          >
            <User className="w-3.5 h-3.5" />
            Sign In / Register
          </button>
        )}
      </div>
    </header>
  );
}
