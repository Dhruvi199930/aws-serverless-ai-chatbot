import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Database, 
  ShieldCheck, 
  Sparkles,
  Server,
  Cloud,
  ChevronRight,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  onToggleSidebar
}) {
  const { user } = useAuth();

  return (
    <aside className={`glass-panel border-r border-gray-800 flex flex-col h-[calc(100vh-61px)] w-72 transition-all duration-300 z-20 ${
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    } fixed md:relative left-0 top-[61px] md:top-0`}>
      {/* New Conversation Button */}
      <div className="p-3 border-b border-gray-800/80">
        <button
          onClick={onNewConversation}
          className="w-full aws-btn-primary justify-center py-2.5 shadow-lg shadow-amber-500/10 text-xs font-semibold"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          New Serverless Session
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Database className="w-3 h-3 text-amber-500" />
            DynamoDB History
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            {conversations.length} sessions
          </span>
        </div>

        {!user ? (
          <div className="p-4 text-center glass-panel rounded-xl my-2 border border-gray-800">
            <Lock className="w-6 h-6 text-amber-500 mx-auto mb-2 opacity-70" />
            <p className="text-xs text-gray-300 font-medium">Authentication Required</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Sign in to save and sync your DynamoDB conversation history.
            </p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center rounded-xl border border-dashed border-gray-800 my-2">
            <MessageSquare className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No chat history yet</p>
            <p className="text-[10px] text-gray-500 mt-1">Click above to start a new chat session!</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.conversationId === currentConversationId;
            return (
              <div
                key={conv.conversationId}
                onClick={() => onSelectConversation(conv.conversationId)}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-medium shadow-md shadow-amber-500/5'
                    : 'border-transparent text-gray-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-gray-400'}`} />
                  <div className="truncate text-xs">
                    <p className="truncate font-medium">{conv.title || 'Untitled Session'}</p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {conv.model || 'gpt-4o-mini'} • {new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.conversationId);
                  }}
                  className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete from DynamoDB"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Cloud Architecture Badge Footer */}
      <div className="p-3 border-t border-gray-800/80 bg-slate-950/40 text-[11px]">
        <div className="flex items-center justify-between mb-1.5 text-gray-400">
          <span className="flex items-center gap-1.5 font-medium text-gray-300">
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            AWS Infrastructure
          </span>
          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
            HTTP API 200
          </span>
        </div>
        <div className="text-[10px] text-gray-500 space-y-1 font-mono">
          <div className="flex justify-between">
            <span>Auth:</span>
            <span className="text-gray-400">Lambda JWT Authorizer</span>
          </div>
          <div className="flex justify-between">
            <span>Storage:</span>
            <span className="text-gray-400">Amazon DynamoDB</span>
          </div>
          <div className="flex justify-between">
            <span>Response:</span>
            <span className="text-amber-400">OpenAI Chunked SSE</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
