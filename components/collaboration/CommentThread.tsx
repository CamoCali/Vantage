"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string };
}

interface CommentThreadProps {
  campaignId: string;
  currentUserId?: string;
}

function Avatar({ name, email }: { name?: string | null; email: string }) {
  const initials = name ? name[0].toUpperCase() : email[0].toUpperCase();
  const colors = [
    "from-indigo-400 to-violet-500",
    "from-emerald-400 to-teal-500",
    "from-orange-400 to-rose-500",
    "from-blue-400 to-cyan-500",
    "from-pink-400 to-rose-500",
  ];
  const color = colors[email.charCodeAt(0) % colors.length];

  return (
    <div className={cn(
      "w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shrink-0",
      color
    )}>
      {initials}
    </div>
  );
}

export default function CommentThread({ campaignId, currentUserId }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchComments() {
    try {
      const res = await fetch(`/api/comments?campaignId=${campaignId}`);
      const data = await res.json();
      setComments(data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    fetchComments();
    // Poll for new comments every 15 seconds
    const interval = setInterval(fetchComments, 15000);
    return () => clearInterval(interval);
  }, [campaignId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || posting) return;
    setPosting(true);

    const optimistic: Comment = {
      id: `temp-${Date.now()}`,
      content: input.trim(),
      createdAt: new Date().toISOString(),
      author: { id: currentUserId ?? "", name: "You", email: "" },
    };
    setComments((prev) => [...prev, optimistic]);
    setInput("");

    try {
      await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: optimistic.content, campaignId }),
      });
      await fetchComments();
    } catch {}
    setPosting(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100">
        <MessageSquare className="w-4 h-4 text-gray-400" />
        <h3 className="text-[13px] font-semibold text-gray-700">Discussion</h3>
        {comments.length > 0 && (
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 font-medium">
            {comments.length}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 text-gray-300 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-[13px] font-medium text-gray-400">No comments yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Start the discussion below
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5 group">
              <Avatar
                name={comment.author.name}
                email={comment.author.email || comment.author.name || "U"}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[12px] font-semibold text-gray-700">
                    {comment.author.name ?? comment.author.email}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl rounded-tl-sm px-3 py-2.5">
                  <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            placeholder="Add a comment…"
            rows={2}
            className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 resize-none transition text-gray-700 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || posting}
            className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 flex items-center justify-center transition-colors shrink-0 mb-0.5"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </form>
        <p className="text-[10px] text-gray-300 mt-1.5 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
