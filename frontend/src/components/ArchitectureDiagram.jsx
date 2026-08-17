import React, { useState, useEffect, useRef } from 'react';
import { 
  Server, 
  Database, 
  Lock, 
  Zap, 
  Cpu, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Cloud, 
  ArrowRight,
  Terminal,
  Code,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Trash2,
  Play,
  Pause,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ArchitectureDiagram({ isStreaming }) {
  const { user, token } = useAuth();
  const [selectedNode, setSelectedNode] = useState('gateway');
  const [logs, setLogs] = useState([
    { ts: new Date(Date.now() - 15000).toISOString(), level: 'INFO', msg: 'INIT_START Runtime Version: nodejs:20.v12 MemorySize: 256MB' },
    { ts: new Date(Date.now() - 12000).toISOString(), level: 'INFO', msg: 'API Gateway HTTP API v2 route POST /api/auth/login matched' },
    { ts: new Date(Date.now() - 10000).toISOString(), level: 'INFO', msg: 'Lambda Authorizer: Validating Bearer JWT token signature...' },
    { ts: new Date(Date.now() - 9800).toISOString(), level: 'INFO', msg: 'Lambda Authorizer: Token signature verified. PrincipalId: usr_guest_992' },
    { ts: new Date(Date.now() - 5000).toISOString(), level: 'INFO', msg: 'DynamoDB: Query table ChatbotConversations partitionKey=usr_guest_992' }
  ]);
  const [logFilter, setLogFilter] = useState('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const logTerminalEndRef = useRef(null);

  // Auto add CloudWatch logs when streaming starts or finishes
  useEffect(() => {
    if (isStreaming) {
      const now = new Date().toISOString();
      const reqId = 'aws-req-' + Math.random().toString(36).substring(2, 9);
      setLogs(prev => [
        ...prev,
        { ts: now, level: 'START', msg: `START RequestId: ${reqId} Version: $LATEST` },
        { ts: now, level: 'INFO', msg: `[ChatStreamHandler] Invoking OpenAI completion API (model: gpt-4o-mini)...` },
        { ts: now, level: 'INFO', msg: `[SSE Stream] Emitting chunked text tokens to client response socket...` }
      ]);
    } else {
      const now = new Date().toISOString();
      const reqId = 'aws-req-' + Math.random().toString(36).substring(2, 9);
      const duration = (Math.random() * 80 + 110).toFixed(2);
      setLogs(prev => [
        ...prev,
        { ts: now, level: 'INFO', msg: `[DynamoDB] Successfully updated ChatbotMessages table` },
        { ts: now, level: 'REPORT', msg: `REPORT RequestId: ${reqId}\tDuration: ${duration} ms\tBilled Duration: ${Math.ceil(duration)} ms\tMemory Size: 256 MB\tMax Memory Used: 82 MB` },
        { ts: now, level: 'END', msg: `END RequestId: ${reqId}` }
      ]);
    }
  }, [isStreaming]);

  useEffect(() => {
    if (autoScroll) {
      logTerminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const clearLogs = () => {
    setLogs([]);
  };

  const filteredLogs = logs.filter(l => {
    if (logFilter === 'ALL') return true;
    return l.level === logFilter;
  });

  const nodes = [
    {
      id: 'client',
      title: 'React Single Page App',
      service: 'Frontend Client (Vite)',
      icon: Cpu,
      color: 'from-blue-500 to-indigo-600',
      badge: 'HTTPS / SSE Reader',
      details: {
        description: 'React SPA state management, JWT bearer token persistence, real-time Server-Sent Events stream reader with typewriter animation.',
        tech: ['React 18', 'Vite', 'Custom Hooks', 'Fetch Stream Reader']
      }
    },
    {
      id: 'gateway',
      title: 'Amazon API Gateway',
      service: 'AWS HTTP API v2',
      icon: Cloud,
      color: 'from-amber-500 to-orange-600',
      badge: 'CORS & Route Dispatch',
      details: {
        description: 'Low-latency serverless HTTP proxy API Gateway. Intercepts incoming requests, executes CORS origin policies, and triggers Lambda custom authorizers.',
        tech: ['HTTP API v2', 'Payload Format 2.0', 'CORS Headers', 'SSE Chunk Proxying']
      }
    },
    {
      id: 'authorizer',
      title: 'AWS Lambda Authorizer',
      service: 'Custom JWT Security Handler',
      icon: Lock,
      color: 'from-emerald-500 to-teal-600',
      badge: 'JWT Bearer Auth',
      details: {
        description: 'Decodes and verifies SHA-256 JWT signature using secret key. Evaluates IAM user policy (Allow/Deny) and injects decoded user claims into request context.',
        tech: ['Node.js 20.x', 'JSONWebToken', 'Bcrypt.js', 'IAM Policy Engine']
      }
    },
    {
      id: 'lambda',
      title: 'AWS Lambda Chat Handler',
      service: 'Serverless Compute',
      icon: Zap,
      color: 'from-orange-500 to-amber-600',
      badge: 'Node.js 20.x Execution',
      details: {
        description: 'Stateless serverless function compute. Fetches conversation history, saves incoming user messages to DynamoDB, and streams OpenAI completion tokens back via HTTP response streams.',
        tech: ['Node.js 20.x', 'Serverless Framework / SAM', 'Response Streaming', 'AWS SDK v3']
      }
    },
    {
      id: 'dynamodb',
      title: 'Amazon DynamoDB',
      service: 'NoSQL Serverless Database',
      icon: Database,
      color: 'from-blue-600 to-cyan-600',
      badge: 'Pay-Per-Request',
      details: {
        description: 'Fully managed key-value database storing Users, Conversations, and Messages tables. Utilizes partition keys and sort keys for sub-10ms query speeds.',
        tech: ['Users Table', 'Conversations Table', 'Messages Table', 'DynamoDB DocumentClient']
      }
    },
    {
      id: 'openai',
      title: 'OpenAI API Stream',
      service: 'AI Model Endpoint',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600',
      badge: 'GPT-4o Stream',
      details: {
        description: 'Generative AI completions engine. Streams response tokens back to Lambda via Server-Sent Events for real-time typewriter feedback in the client interface.',
        tech: ['GPT-4o-mini', 'GPT-4o', 'SSE Streaming', 'Token Streaming']
      }
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-cyan-400" />
              AWS Cloud Infrastructure Architecture
            </h2>
            <span className="aws-badge">Production Architecture</span>
          </div>
          <p className="text-xs text-gray-400">
            Interactive system diagram displaying end-to-end data flow from React to AWS API Gateway, Lambda Authorizer, DynamoDB & OpenAI.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-3 rounded-xl border border-gray-800 text-xs">
          <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
          <div>
            <p className="font-semibold text-gray-200">
              {isStreaming ? '⚡ Active Lambda Execution (Streaming)' : '🟢 AWS System Ready'}
            </p>
            <p className="text-[10px] text-gray-400">Region: us-east-1 • Memory: 256MB</p>
          </div>
        </div>
      </div>

      {/* Visual System Flow Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-500" />
          Serverless Request Pipeline & Component Graph
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nodes.map((node, idx) => {
            const Icon = node.icon;
            const isSelected = selectedNode === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative ${
                  isStreaming && (node.id === 'gateway' || node.id === 'lambda' || node.id === 'openai')
                    ? 'active-architecture-node border-amber-500'
                    : isSelected
                    ? 'border-amber-500/80 bg-slate-800/80 shadow-xl shadow-amber-500/10'
                    : 'border-gray-800 hover:border-gray-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${node.color} flex items-center justify-center shadow-lg text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] bg-slate-950 text-gray-400 border border-gray-800 px-2 py-0.5 rounded-full font-mono">
                    {node.badge}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-gray-100">{node.title}</h4>
                <p className="text-xs text-amber-400 font-mono mt-0.5">{node.service}</p>
                <p className="text-[11px] text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                  {node.details.description}
                </p>

                {/* Connection Arrow indicator for grid flow */}
                {idx < nodes.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Component Technical Detail Box */}
      {selectedNode && (
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-slate-900/90 shadow-2xl">
          {(() => {
            const active = nodes.find(n => n.id === selectedNode);
            if (!active) return null;
            const Icon = active.icon;

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${active.color} flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{active.title}</h3>
                      <p className="text-xs text-amber-400 font-mono">{active.service}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active Component
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {active.details.description}
                </p>

                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Technologies & Specs:</h4>
                  <div className="flex flex-wrap gap-2">
                    {active.details.tech.map((t, idx) => (
                      <span key={idx} className="text-xs bg-slate-950 text-gray-300 border border-gray-800 px-2.5 py-1 rounded-lg font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Live AWS CloudWatch Logs Terminal Stream */}
      <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="bg-slate-900/95 px-4 py-3 border-b border-gray-800 flex items-center justify-between text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white font-mono">AWS CloudWatch Live Terminal Logs</span>
            <span className="text-[10px] bg-slate-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
              /aws/lambda/ChatStreamHandler
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-gray-800">
              {['ALL', 'INFO', 'START', 'REPORT'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    logFilter === lvl ? 'bg-amber-500 text-slate-950 font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`p-1 px-2 rounded-lg text-[10px] font-mono flex items-center gap-1 border border-gray-800 transition-colors ${
                autoScroll ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' : 'text-gray-400'
              }`}
            >
              {autoScroll ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{autoScroll ? 'Auto-scroll ON' : 'Paused'}</span>
            </button>

            <button
              onClick={clearLogs}
              className="p-1 px-2 rounded-lg text-[10px] font-mono text-gray-400 hover:text-red-400 border border-gray-800 hover:border-red-500/40 transition-colors flex items-center gap-1"
              title="Clear terminal logs"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950 font-mono text-xs text-gray-300 max-h-64 overflow-y-auto space-y-1.5 leading-relaxed">
          {filteredLogs.length === 0 ? (
            <p className="text-gray-600 italic text-center py-4">No CloudWatch log events found for current filter.</p>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 hover:bg-slate-900/50 p-1 rounded font-mono text-[11px]">
                <span className="text-gray-500 flex-shrink-0">{log.ts.split('T')[1].slice(0, 12)}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold flex-shrink-0 ${
                    log.level === 'REPORT'
                      ? 'bg-purple-950 text-purple-400 border border-purple-500/40'
                      : log.level === 'START' || log.level === 'END'
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                      : 'bg-slate-800 text-amber-400'
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-gray-300 break-all">{log.msg}</span>
              </div>
            ))
          )}
          <div ref={logTerminalEndRef} />
        </div>
      </div>

      {/* Telemetry Metrics & Infrastructure Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-gray-800">
          <p className="text-[11px] text-gray-400 font-semibold uppercase">API Gateway Route</p>
          <p className="text-base font-bold text-amber-400 mt-1 font-mono">POST /api/chat</p>
          <p className="text-[10px] text-gray-500 mt-1">Format 2.0 • CORS Enabled</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-gray-800">
          <p className="text-[11px] text-gray-400 font-semibold uppercase">Lambda Runtime</p>
          <p className="text-base font-bold text-cyan-400 mt-1 font-mono">Node.js 20.x</p>
          <p className="text-[10px] text-gray-500 mt-1">256MB RAM • 30s Timeout</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-gray-800">
          <p className="text-[11px] text-gray-400 font-semibold uppercase">DynamoDB Mode</p>
          <p className="text-base font-bold text-emerald-400 mt-1 font-mono">PAY_PER_REQUEST</p>
          <p className="text-[10px] text-gray-500 mt-1">Sub-10ms Key Query</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-gray-800">
          <p className="text-[11px] text-gray-400 font-semibold uppercase">JWT Auth Claim</p>
          <p className="text-base font-bold text-purple-400 mt-1 font-mono truncate">
            {user ? user.email : 'Anonymous'}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">HMAC SHA-256 Validated</p>
        </div>
      </div>
    </div>
  );
}
