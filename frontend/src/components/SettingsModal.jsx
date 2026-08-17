import React, { useState } from 'react';
import { X, Key, Cpu, ShieldCheck, Sparkles, Check, Trash2, ExternalLink } from 'lucide-react';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  apiKey, 
  onSaveApiKey, 
  selectedModel, 
  onSelectModel 
}) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApiKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setKeyInput('');
    onSaveApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">API Settings & Models</h2>
              <p className="text-xs text-gray-400">Configure OpenAI Key & Lambda Runtime</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* OpenAI API Key */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
              <span>OpenAI API Key (Optional)</span>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                Get Key <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-slate-950 border border-gray-800 rounded-xl py-2.5 px-3 text-sm font-mono text-gray-100 placeholder-gray-600 focus:border-amber-500 focus:outline-none"
              />
              {keyInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-3 text-gray-500 hover:text-red-400"
                  title="Clear API Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              If no API key is provided, the chatbot automatically runs in <strong className="text-amber-400">Serverless Live Simulation Mode</strong> streaming interactive AWS response chunks.
            </p>
          </div>

          {/* Model Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Default OpenAI Model
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Fast, efficient token streaming' },
                { id: 'gpt-4o', name: 'GPT-4o', desc: 'Flagship high intelligence model' },
                { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', desc: 'Legacy standard model' }
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectModel(m.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedModel === m.id
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-md'
                      : 'bg-slate-950/60 border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{m.name}</p>
                    <p className="text-[11px] text-gray-400">{m.desc}</p>
                  </div>
                  {selectedModel === m.id && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-800 text-xs font-semibold text-gray-300 hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="aws-btn-primary py-2.5 px-5 text-xs font-bold"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                  Saved Settings!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
