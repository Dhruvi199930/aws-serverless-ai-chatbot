import React, { useRef, useEffect, useState } from 'react';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Sparkles, 
  Cpu, 
  Database, 
  Zap, 
  ShieldCheck,
  Server,
  Terminal,
  Volume2,
  VolumeX,
  Download,
  FileCode,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ChatArea({ 
  messages, 
  isStreaming, 
  streamingText, 
  streamingMeta, 
  onQuickPrompt 
}) {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Text-to-Speech (TTS) Audio Speaker Handler
  const toggleTextToSpeech = (msgId, text) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech audio synthesis is not supported in your browser.');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown code blocks before reading
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block snippet omitted for speech.').slice(0, 800);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Export Transcript Handler
  const handleExportTranscript = (format = 'markdown') => {
    if (messages.length === 0) return;

    let content = '';
    let fileName = `aws_chatbot_transcript_${Date.now()}`;

    if (format === 'markdown') {
      fileName += '.md';
      content = `# 🚀 AWS Serverless Chatbot Transcript\n\n**Exported On**: ${new Date().toLocaleString()}\n**User**: ${user ? user.email : 'Guest'}\n\n---\n\n`;
      messages.forEach((msg) => {
        const role = msg.role === 'user' ? '👤 User' : '🤖 AWS Serverless AI';
        content += `### ${role} (${new Date(msg.timestamp).toLocaleTimeString()})\n\n${msg.content}\n\n---\n\n`;
      });
    } else {
      fileName += '.json';
      content = JSON.stringify(messages, null, 2);
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Helper to format markdown code blocks nicely
   */
  const renderMessageContent = (content) => {
    if (!content) return null;
    
    // Split by triple backticks for code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const firstLine = lines[0].trim();
        let language = 'code';
        let codeBody = part.slice(3, -3).trim();

        if (firstLine && !firstLine.includes(' ') && lines.length > 1) {
          language = firstLine;
          codeBody = lines.slice(1).join('\n');
        }

        return (
          <div key={idx} className="my-3 rounded-xl overflow-hidden border border-gray-800 bg-slate-950 font-mono text-xs shadow-xl">
            <div className="bg-slate-900/90 px-4 py-2 flex items-center justify-between border-b border-gray-800 text-gray-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold text-gray-300 uppercase tracking-wider text-[10px]">{language}</span>
              </div>
              <button
                onClick={() => copyToClipboard(codeBody, `${idx}`)}
                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
              >
                {copiedIndex === `${idx}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-gray-200 leading-relaxed font-mono">
              <code>{codeBody}</code>
            </pre>
          </div>
        );
      }

      // Format bold text and paragraphs
      return (
        <div key={idx} className="whitespace-pre-wrap leading-relaxed text-sm">
          {part}
        </div>
      );
    });
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-6 ${messages.length === 0 && !isStreaming ? 'flex flex-col items-center justify-center min-h-[calc(100vh-200px)]' : ''}`}>
      {/* Top Action Bar when messages exist */}
      {messages.length > 0 && (
        <div className="max-w-4xl mx-auto flex items-center justify-between pb-2 border-b border-gray-800/80 text-xs text-gray-400">
          <span className="flex items-center gap-1.5 font-medium text-gray-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Active Session Stream ({messages.length} messages)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportTranscript('markdown')}
              className="p-1.5 px-2.5 rounded-lg bg-slate-900 border border-gray-800 hover:border-amber-500/40 text-gray-300 hover:text-amber-400 transition-all flex items-center gap-1.5"
              title="Download Transcript as Markdown (.md)"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export .MD</span>
            </button>
            <button
              onClick={() => handleExportTranscript('json')}
              className="p-1.5 px-2.5 rounded-lg bg-slate-900 border border-gray-800 hover:border-cyan-500/40 text-gray-300 hover:text-cyan-400 transition-all flex items-center gap-1.5"
              title="Download Transcript as JSON (.json)"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      )}

      {messages.length === 0 && !isStreaming ? (
        <div className="w-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/20 mb-6">
            <Bot className="w-10 h-10 text-slate-950" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            AWS Serverless <span className="text-amber-500">AI Assistant</span>
          </h2>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            Full-stack serverless architecture powered by <strong className="text-gray-200">AWS Lambda</strong>, <strong className="text-gray-200">API Gateway</strong>, <strong className="text-gray-200">DynamoDB</strong>, <strong className="text-gray-200">JWT Security</strong>, and <strong className="text-gray-200">OpenAI Response Streaming</strong>.
          </p>

          {/* Quick Prompts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            {[
              {
                title: '⚡ AWS Lambda SSE Stream',
                desc: 'How does Lambda stream OpenAI completions via API Gateway?',
                prompt: 'Explain how AWS Lambda and API Gateway handle streaming SSE responses with OpenAI.'
              },
              {
                title: '🔐 JWT Lambda Authorizer',
                desc: 'Explain the custom API Gateway JWT verification policy.',
                prompt: 'Write a full example of an AWS Lambda Custom Authorizer for JWT verification.'
              },
              {
                title: '💾 DynamoDB Schema',
                desc: 'View conversation history partitioning strategy.',
                prompt: 'Explain DynamoDB single-table design for chat application history.'
              },
              {
                title: '🚀 Cloud Deployment',
                desc: 'Deploy with Serverless Framework or AWS SAM.',
                prompt: 'Give me the step-by-step terminal commands to deploy this application to AWS.'
              }
            ].map((card, idx) => (
              <button
                key={idx}
                onClick={() => onQuickPrompt(card.prompt)}
                className="glass-panel p-4 rounded-xl text-left hover:border-amber-500/50 hover:bg-slate-800/80 transition-all group"
              >
                <p className="font-semibold text-xs text-amber-400 group-hover:text-amber-300">{card.title}</p>
                <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isSpeaking = speakingMsgId === msg.messageId;

            return (
              <div
                key={msg.messageId || index}
                className={`flex gap-3 md:gap-4 max-w-4xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/20 mt-1">
                    <Bot className="w-5 h-5 text-slate-950" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Sender Label & AWS Telemetry / TTS Button */}
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <span className="font-semibold text-gray-300">
                      {isUser ? (user ? user.name || 'User' : 'Authenticated User') : 'AWS Serverless AI'}
                    </span>
                    {!isUser && (
                      <>
                        <span className="text-[10px] bg-slate-800 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          Lambda • 140ms
                        </span>
                        <button
                          onClick={() => toggleTextToSpeech(msg.messageId, msg.content)}
                          className={`p-1 rounded-md transition-all flex items-center gap-1 ${
                            isSpeaking
                              ? 'bg-amber-500 text-slate-950 font-semibold animate-pulse'
                              : 'hover:bg-slate-800 text-gray-400 hover:text-amber-400'
                          }`}
                          title={isSpeaking ? 'Stop speaking' : 'Text-to-Speech (Listen)'}
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    )}
                    {isUser && (
                      <span className="text-[10px] bg-slate-800 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        JWT Bearer
                      </span>
                    )}
                  </div>

                  {/* Message Card */}
                  <div
                    className={`p-4 rounded-2xl glass-panel ${
                      isUser
                        ? 'bg-amber-500/15 border-amber-500/30 text-white rounded-tr-none'
                        : 'bg-slate-900/80 border-gray-800 text-gray-200 rounded-tl-none shadow-xl'
                    }`}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-gray-700 flex items-center justify-center flex-shrink-0 shadow-md text-amber-400 font-bold text-xs mt-1">
                    {user?.name ? user.name[0].toUpperCase() : <User className="w-4 h-4 text-gray-300" />}
                  </div>
                )}
              </div>
            );
          })}

          {/* Active Streaming Chunk Output */}
          {isStreaming && (
            <div className="flex gap-3 md:gap-4 max-w-4xl mx-auto justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/20 mt-1 animate-pulse">
                <Bot className="w-5 h-5 text-slate-950" />
              </div>

              <div className="space-y-2 max-w-[85%]">
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <span className="font-semibold text-gray-300">AWS Serverless AI</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                    Streaming SSE Tokens...
                  </span>
                </div>

                <div className="p-4 rounded-2xl glass-panel bg-slate-900/90 border-amber-500/30 text-gray-200 rounded-tl-none shadow-2xl typing-cursor">
                  {renderMessageContent(streamingText)}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
