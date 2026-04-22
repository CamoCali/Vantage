import { CheckCircle2, Circle, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const integrations = [
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Sync pipeline, MQLs, SQLs, deal stages, and contact data.",
    logo: "🟠",
    connected: false,
    docUrl: "#",
    fields: [
      "Pipeline value by stage",
      "MQL & SQL counts",
      "Contact lifecycle stages",
      "Deal close rates",
    ],
  },
  {
    id: "ga4",
    name: "Google Analytics 4",
    description: "Pull sessions, users, conversions, and traffic sources.",
    logo: "🔵",
    connected: false,
    docUrl: "#",
    fields: ["Sessions & users", "Conversion events", "Traffic by channel", "Top landing pages"],
  },
  {
    id: "meta",
    name: "Meta Ads",
    description: "Import campaign spend, impressions, clicks, and ROAS from Meta.",
    logo: "🔷",
    connected: false,
    docUrl: "#",
    fields: ["Spend by campaign", "CPL & CPC", "ROAS", "Reach & frequency"],
  },
  {
    id: "google_ads",
    name: "Google Ads",
    description: "Sync search & display campaign performance including conversions.",
    logo: "🟡",
    connected: false,
    note: "Requires a Google Ads Developer Token (apply in Google Ads API Center — takes 1-3 days).",
    docUrl: "#",
    fields: ["Spend by campaign", "Search impression share", "Conversions", "CPA"],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Pull opportunity pipeline, stage progression, and ARR data.",
    logo: "☁️",
    connected: false,
    docUrl: "#",
    fields: ["Pipeline by stage", "Opportunities", "Win rate", "ARR by rep"],
  },
];

export default function IntegrationsPage() {
  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="text-sm text-slate-500 mt-1">
          {connectedCount} of {integrations.length} connected · Data syncs every 4 hours
        </p>
      </div>

      {/* Setup guide banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-indigo-900 mb-1">
          Getting started
        </h3>
        <p className="text-sm text-indigo-700 leading-relaxed">
          Each integration uses OAuth — click <strong>Connect</strong> and you'll be taken through
          the authorization flow. Credentials are stored encrypted. After connecting, your first
          data sync runs automatically.
        </p>
        <p className="text-sm text-indigo-700 mt-2">
          <strong>Google Ads:</strong> You need a Developer Token before connecting. Apply at{" "}
          <span className="underline cursor-pointer">Google Ads API Center</span> — approval takes 1-3 business days.
        </p>
      </div>

      {/* Integration cards */}
      <div className="space-y-3">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className={cn(
              "bg-white rounded-xl border shadow-sm p-5 transition-all",
              integration.connected
                ? "border-emerald-200"
                : "border-slate-100 hover:border-slate-200"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
                {integration.logo}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 text-sm">
                    {integration.name}
                  </h3>
                  {integration.connected ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Circle className="w-3.5 h-3.5" />
                      Not connected
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mb-3">{integration.description}</p>

                {integration.note && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">{integration.note}</p>
                  </div>
                )}

                {/* Data fields */}
                <div className="flex flex-wrap gap-1.5">
                  {integration.fields.map((f) => (
                    <span
                      key={f}
                      className="text-xs px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-slate-500"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="shrink-0 flex flex-col items-end gap-2">
                {integration.connected ? (
                  <>
                    <button className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium">
                      Disconnect
                    </button>
                    <button className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors font-medium flex items-center gap-1">
                      Sync now
                    </button>
                  </>
                ) : (
                  <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
