"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import MetricChart from "@/components/dashboard/MetricChart";
import { cn } from "@/lib/utils";
import type { Widget } from "@/lib/ai/tools";

interface Message {
  role: "user" | "assistant";
  text: string;
  widgets?: Widget[];
  loading?: boolean;
}

const SUGGESTED_PROMPTS = [
  "What campaigns are currently active and how are they tracking?",
  "How are MQLs trending over the last 30 days?",
  "Show me our ad spend breakdown by channel",
  "What tasks are still in progress across all campaigns?",
  "Summarize our overall marketing performance right now",
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setInput("");
    setLoading(true);

    const userMsg: Message = { role: "user", text };
    const assistantMsg: Message = { role: "assistant", text: "", loading: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const widgets: Widget[] = [];
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "widgets") {
              widgets.push(...data.widgets);
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                  ...next[next.length - 1],
                  widgets: [...widgets],
                };
                return next;
              });
            } else if (data.type === "text") {
              fullText += data.text;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                  ...next[next.length - 1],
                  text: fullText,
                  loading: false,
                };
                return next;
              });
            } else if (data.type === "done") {
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                  ...next[next.length - 1],
                  loading: false,
                };
                return next;
              });
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          ...next[next.length - 1],
          text: "Sorry, something went wrong. Please try again.",
          loading: false,
        };
        return next;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-5 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900">Vantage AI</h1>
            <p className="text-xs text-slate-400">Ask anything about your marketing performance</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center mt-16">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Ask Vantage AI anything
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              Get instant insights about your campaigns, channel performance, and marketing KPIs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-left px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3", msg.role === "user" && "justify-end")}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-indigo-600" />
                  </div>
                )}
                <div className={cn("flex-1 max-w-2xl", msg.role === "user" && "max-w-lg")}>
                  {msg.role === "user" ? (
                    <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm ml-auto inline-block max-w-full">
                      {msg.text}
                    </div>
                  ) : (
                    <div>
                      {/* Widgets */}
                      {msg.widgets && msg.widgets.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {msg.widgets.map((w, wi) => (
                            <div key={wi}>
                              {w.description && (
                                <p className="text-xs text-slate-500 mb-2">{w.description}</p>
                              )}
                              {(w.type === "bar" || w.type === "line") && (
                                <MetricChart
                                  title={w.title}
                                  data={w.data}
                                  type={w.type}
                                  lines={w.lines ?? [{ key: "value", color: "#6366f1" }]}
                                />
                              )}
                              {w.type === "spend_breakdown" && (
                                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                                  <h3 className="text-sm font-semibold text-slate-700 mb-4">{w.title}</h3>
                                  <div className="space-y-3">
                                    {w.data.map((d, di) => {
                                      const total = w.data.reduce((s, r) => s + (Number(r.value) || 0), 0);
                                      const pct = total > 0 ? ((Number(d.value) / total) * 100).toFixed(0) : 0;
                                      return (
                                        <div key={di}>
                                          <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-600 font-medium">{d.name}</span>
                                            <span className="text-slate-500">${Number(d.value).toLocaleString()} ({pct}%)</span>
                                          </div>
                                          <div className="h-1.5 bg-slate-100 rounded-full">
                                            <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Text */}
                      {msg.loading && !msg.text ? (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          <span>Analyzing…</span>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-8 py-4 border-t border-slate-100 bg-white">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex items-end gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your marketing performance…"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Powered by Claude · Reads from your connected integrations
          </p>
        </div>
      </div>
    </div>
  );
}
