import React, { useState, useRef } from 'react';
import { 
  Send, 
  Square, 
  Sparkles, 
  Cpu, 
  ChevronDown, 
  Paperclip, 
  Mic, 
  MicOff, 
  FileText, 
  X 
} from 'lucide-react';

export default function ChatInput({ 
  onSend, 
  isStreaming, 
  onStop, 
  selectedModel, 
  onSelectModel 
}) {
  const [input, setInput] = useState('');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const models = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tag: 'Fast & Lightweight' },
    { id: 'gpt-4o', name: 'GPT-4o Omnimodal', tag: 'High Intelligence' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', tag: 'Standard' }
  ];

  // Document Attachment Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        content: event.target.result
      });
    };
    reader.readAsText(file);
    e.target.value = ''; // reset file input
  };

  // Speech-to-Text (STT) Voice Recording Handler
  const toggleVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Try Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(prev => (prev ? prev + ' ' : '') + transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech Recognition error:', err);
      setIsListening(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!input.trim() && !attachedFile) || isStreaming) return;
    
    onSend(input, attachedFile);
    setInput('');
    setAttachedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  return (
    <div className="p-3.5 border-t border-gray-800/80 glass-panel sticky bottom-0 z-20 bg-slate-950/95 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Model Selector & Attachments Bar */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-gray-800 text-gray-300 hover:border-amber-500/40 transition-all font-mono"
              >
                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                <span>{models.find(m => m.id === selectedModel)?.name || selectedModel}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {modelDropdownOpen && (
                <div className="absolute left-0 bottom-8 w-56 glass-panel rounded-xl shadow-2xl py-1 z-50 border border-gray-800">
                  {models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectModel(m.id);
                        setModelDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col transition-all ${
                        selectedModel === m.id
                          ? 'bg-amber-500/10 text-amber-400 font-semibold'
                          : 'text-gray-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <span>{m.name}</span>
                      <span className="text-[10px] text-gray-500 font-normal">{m.tag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Document Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.json,.csv,.pdf"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg bg-slate-900/90 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all flex items-center gap-1"
              title="Upload Document (.txt, .md, .json, .csv, .pdf)"
            >
              <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline text-[11px]">Attach Document</span>
            </button>

            {/* Speech Recognition Button */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                isListening
                  ? 'bg-red-950/60 border-red-500/60 text-red-400 animate-pulse'
                  : 'bg-slate-900/90 border-gray-800 text-gray-400 hover:text-white'
              }`}
              title={isListening ? 'Stop voice recording' : 'Voice Input (Speech-to-Text)'}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[10px] font-semibold text-red-400">Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-[11px]">Voice Prompt</span>
                </>
              )}
            </button>
          </div>

          <span className="text-[10px] text-gray-500 hidden sm:inline">
            Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-gray-400">Enter</kbd> to send, <kbd className="bg-slate-800 px-1 py-0.5 rounded text-gray-400">Shift+Enter</kbd> for new line
          </span>
        </div>

        {/* Attached Document Pill Chip */}
        {attachedFile && (
          <div className="flex items-center gap-2 bg-slate-900 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs text-cyan-300 w-fit">
            <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="font-semibold">{attachedFile.name}</span>
            <span className="text-[10px] text-gray-400">({attachedFile.size})</span>
            <button
              onClick={() => setAttachedFile(null)}
              className="p-0.5 rounded hover:bg-slate-800 text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Textarea Form */}
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={attachedFile ? `Ask something about ${attachedFile.name}...` : "Ask your AWS Serverless AI Assistant..."}
            className="w-full bg-slate-950/80 text-gray-100 placeholder-gray-500 rounded-xl p-3.5 pr-12 border border-gray-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40 text-sm resize-none transition-all leading-relaxed"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="absolute right-3 bottom-3 p-2 rounded-lg bg-red-950 text-red-400 border border-red-500/40 hover:bg-red-900/60 transition-all flex items-center justify-center"
              title="Stop streaming response"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() && !attachedFile}
              className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all flex items-center justify-center ${
                input.trim() || attachedFile
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
