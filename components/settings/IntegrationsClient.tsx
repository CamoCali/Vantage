"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectedInfo { provider: string; connectedAt: string; updatedAt: string }

const INTEGRATIONS = [
  {
    id: "HUBSPOT",
    name: "HubSpot",
    description: "Sync pipeline, MQLs, SQLs, deal stages, and contact data.",
    connectPath: "/api/integrations/hubspot/connect",
    syncPath: "/api/integrations/hubspot/sync",
    logo: (
      <svg viewBox="0 0 512 512" className="w-5 h-5"><path fill="#ff7a59" d="M374.5 173.6V117a43.9 43.9 0 1 0-52.7 0v56.6a124.8 124.8 0 0 0-53.5 30.7L135.6 128a61 61 0 1 0-28.5 44.5l129.2 75.9a124.3 124.3 0 0 0 0 55.2L107.2 379.5a61 61 0 1 0 28.5 44.5l133-76.3a124.9 124.9 0 1 0 105.8-174.1z"/></svg>
    ),
    fields: ["Pipeline value", "MQLs & SQLs", "Contact stages", "Deal close rates"],
    envRequired: ["HUBSPOT_CLIENT_ID", "HUBSPOT_CLIENT_SECRET"],
  },
  {
    id: "GA4",
    name: "Google Analytics 4",
    description: "Pull sessions, users, conversions, and traffic sources.",
    connectPath: "/api/integrations/ga4/connect",
    syncPath: "/api/integrations/ga4/sync",
    logo: (
      <svg viewBox="0 0 192 192" className="w-5 h-5"><path fill="#F9AB00" d="M130 29v132c0 14.77 10.19 23 21 23 10 0 21-7 21-23V30c0-13.54-10-22-21-22s-21 9.06-21 21z"/><path fill="#E37400" d="M72 96v65c0 14.77 10.19 23 21 23 10 0 21-7 21-23V97c0-13.54-10-22-21-22s-21 9.06-21 21z"/><circle fill="#E37400" cx="21" cy="161" r="21"/></svg>
    ),
    fields: ["Sessions & users", "Conversions", "Traffic by channel", "Bounce rate"],
    envRequired: ["GA4_CLIENT_ID", "GA4_CLIENT_SECRET", "GA4_PROPERTY_ID"],
  },
  {
    id: "META",
    name: "Meta Ads",
    description: "Import campaign spend, impressions, clicks, and ROAS from Meta.",
    connectPath: "/api/integrations/meta/connect",
    syncPath: "/api/integrations/meta/sync",
    logo: (
      <svg viewBox="0 0 36 36" className="w-5 h-5"><path fill="#0082FB" d="M15 13.5C15 9.91 16.99 7 19.5 7S24 9.91 24 13.5c0 2.16-.75 4.09-1.94 5.42L24 29H12l1.94-10.08C12.75 17.59 12 15.66 12 13.5z"/><path fill="#0082FB" d="M6 20c0-3.87 2.24-7 5-7 1.38 0 2.63.7 3.56 1.85L13 29H3l1.44-7.15A5.1 5.1 0 0 1 6 20z"/></svg>
    ),
    fields: ["Spend by campaign", "CPL & CPC", "ROAS", "Reach & frequency"],
    envRequired: ["META_APP_ID", "META_APP_SECRET", "META_AD_ACCOUNT_ID"],
  },
  {
    id: "GOOGLE_ADS",
    name: "Google Ads",
    description: "Sync search & display campaign performance including conversions.",
    connectPath: "/api/integrations/google-ads/connect",
    syncPath: "/api/integrations/google-ads/sync",
    logo: (
      <svg viewBox="0 0 192 192" className="w-5 h-5"><path fill="#FBBC04" d="M144 144l-48-83.1V144z"/><path fill="#4285F4" d="M48 144l48-83.1L144 144z"/><circle fill="#34A853" cx="48" cy="144" r="28"/><circle fill="#EA4335" cx="144" cy="144" r="28"/></svg>
    ),
    fields: ["Spend by campaign", "Search impression share", "Conversions", "CPA"],
    note: "Requires a Google Ads Developer Token — apply at Google Ads API Center (1-3 days approval).",
    envRequired: ["GOOGLE_ADS_CLIENT_ID", "GOOGLE_ADS_CLIENT_SECRET", "GOOGLE_ADS_DEVELOPER_TOKEN", "GOOGLE_ADS_CUSTOMER_ID"],
  },
  {
    id: "SALESFORCE",
    name: "Salesforce",
    description: "Pull opportunity pipeline, stage progression, and revenue data.",
    connectPath: "/api/integrations/salesforce/connect",
    syncPath: "/api/integrations/salesforce/sync",
    logo: (
      <svg viewBox="0 0 64 64" className="w-5 h-5"><path fill="#00A1E0" d="M26.4 13.1a12.2 12.2 0 0 1 8.7-3.6 12.3 12.3 0 0 1 11 6.8 9.8 9.8 0 0 1 4.2-.9 9.9 9.9 0 0 1 9.9 9.9 9.9 9.9 0 0 1-9.9 9.9H14.5a8.7 8.7 0 0 1-.4-17.4 12.2 12.2 0 0 1 12.3-4.7z"/></svg>
    ),
    fields: ["Pipeline by stage", "Open opportunities", "Won revenue", "Win rate"],
    envRequired: ["SALESFORCE_CLIENT_ID", "SALESFORCE_CLIENT_SECRET"],
  },
] as const;

export default function IntegrationsClient({
  connectedMap,
}: {
  connectedMap: Record<string, ConnectedInfo>;
}) {
  const router = useRouter();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncMsg, setSyncMsg] = useState<Record<string, string>>({});

  async function handleSync(id: string, path: string) {
    setSyncing(id);
    setSyncMsg((p) => ({ ...p, [id]: "" }));
    try {
      const res = await fetch(path, { method: "POST" });
      const data = await res.json();
      setSyncMsg((p) => ({ ...p, [id]: res.ok ? "Synced!" : (data.error ?? "Sync failed") }));
      if (res.ok) router.refresh();
    } catch {
      setSyncMsg((p) => ({ ...p, [id]: "Sync failed" }));
    }
    setSyncing(null);
    setTimeout(() => setSyncMsg((p) => ({ ...p, [id]: "" })), 3000);
  }

  const connectedCount = INTEGRATIONS.filter((i) => connectedMap[i.id]).length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="text-sm text-slate-500 mt-1">
          {connectedCount} of {INTEGRATIONS.length} connected · Data syncs daily at 8am
        </p>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-indigo-900 mb-1">How to connect</h3>
        <p className="text-sm text-indigo-700 leading-relaxed">
          Each integration uses OAuth — click <strong>Connect</strong> and you'll be taken through the
          authorization flow. After connecting, click <strong>Sync now</strong> to pull your first data.
          After that, syncs happen automatically every day.
        </p>
      </div>

      <div className="space-y-3">
        {INTEGRATIONS.map((integration) => {
          const info = connectedMap[integration.id];
          const isConnected = !!info;
          const isSyncing = syncing === integration.id;

          return (
            <div key={integration.id}
              className={cn("bg-white rounded-xl border shadow-sm p-5 transition-all",
                isConnected ? "border-emerald-200" : "border-slate-100 hover:border-slate-200")}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {integration.logo}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 text-sm">{integration.name}</h3>
                    {isConnected ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Circle className="w-3.5 h-3.5" /> Not connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-3">{integration.description}</p>

                  {"note" in integration && integration.note && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">{integration.note}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {integration.fields.map((f) => (
                      <span key={f} className="text-xs px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-slate-500">{f}</span>
                    ))}
                  </div>

                  {isConnected && info && (
                    <p className="text-xs text-slate-400 mt-2">
                      Connected {new Date(info.connectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      {" · "}Last synced {new Date(info.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  {isConnected ? (
                    <>
                      <button onClick={() => handleSync(integration.id, integration.syncPath)} disabled={isSyncing}
                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition-colors">
                        {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        {syncMsg[integration.id] || (isSyncing ? "Syncing…" : "Sync now")}
                      </button>
                      <a href={integration.connectPath}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium">
                        Reconnect
                      </a>
                    </>
                  ) : (
                    <a href={integration.connectPath}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors">
                      Connect
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
