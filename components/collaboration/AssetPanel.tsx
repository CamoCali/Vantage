"use client";

import { useState, useEffect } from "react";
import { Paperclip, Plus, ExternalLink, Trash2, Loader2, Link2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Asset {
  id: string;
  title: string;
  url: string;
  provider: string;
  createdAt: string;
  addedBy: { id: string; name: string | null; email: string };
}

interface AssetPanelProps {
  campaignId: string;
  currentUserId?: string;
}

function ProviderIcon({ provider }: { provider: string }) {
  if (provider === "google_drive") {
    return (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
        <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
        <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
        <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
        <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
        <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
        <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
      </svg>
    );
  }
  if (provider === "onedrive") {
    return (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.318 8.338a4.91 4.91 0 0 1 7.39 2.005A3.903 3.903 0 0 1 21 14.139a3.92 3.92 0 0 1-3.92 3.92H6.685A4.685 4.685 0 0 1 4.56 9.684a4.665 4.665 0 0 1 5.758-1.346z" fill="#0364b8"/>
      </svg>
    );
  }
  return <Link2 className="w-4 h-4 shrink-0 text-gray-400" />;
}

export default function AssetPanel({ campaignId, currentUserId }: AssetPanelProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  async function fetchAssets() {
    try {
      const res = await fetch(`/api/assets?campaignId=${campaignId}`);
      const data = await res.json();
      setAssets(data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    fetchAssets();
  }, [campaignId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || adding) return;
    setAdding(true);
    try {
      await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), title: title.trim(), campaignId }),
      });
      setUrl("");
      setTitle("");
      setShowForm(false);
      await fetchAssets();
    } catch {}
    setAdding(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/assets?id=${id}`, { method: "DELETE" });
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-gray-400" />
          <h3 className="text-[13px] font-semibold text-gray-700">Assets</h3>
          {assets.length > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 font-medium">
              {assets.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-6 h-6 rounded-md bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-600" />
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="px-4 py-3 border-b border-gray-100 space-y-2 bg-gray-50/50">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a Google Drive or OneDrive link…"
            required
            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 text-gray-700 placeholder-gray-400"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Label (optional)"
            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 text-gray-700 placeholder-gray-400"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!url.trim() || adding}
              className="flex-1 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-colors"
            >
              {adding ? "Pinning…" : "Pin link"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setUrl(""); setTitle(""); }}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Asset list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 text-gray-300 animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <Paperclip className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-[13px] font-medium text-gray-400">No assets yet</p>
            <p className="text-xs text-gray-300 mt-1">Pin a Google Drive or OneDrive link</p>
          </div>
        ) : (
          assets.map((asset) => (
            <div
              key={asset.id}
              className="group flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="mt-0.5">
                <ProviderIcon provider={asset.provider} />
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[12px] font-semibold text-gray-700 hover:text-indigo-600 transition-colors truncate"
                >
                  <span className="truncate">{asset.title}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {asset.addedBy.name ?? asset.addedBy.email} ·{" "}
                  {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
                </p>
              </div>
              <button
                onClick={() => handleDelete(asset.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-50 text-gray-300 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
