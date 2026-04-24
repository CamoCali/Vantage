"use client";

import { useState } from "react";
import { MessageSquare, Paperclip } from "lucide-react";
import CommentThread from "@/components/collaboration/CommentThread";
import AssetPanel from "@/components/collaboration/AssetPanel";
import { cn } from "@/lib/utils";

interface CampaignSidePanelProps {
  campaignId: string;
  currentUserId?: string;
}

const TABS = [
  { id: "discussion", label: "Discussion", icon: MessageSquare },
  { id: "assets", label: "Assets", icon: Paperclip },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function CampaignSidePanel({ campaignId, currentUserId }: CampaignSidePanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("discussion");

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-semibold transition-colors border-b-2 -mb-px",
              activeTab === id
                ? "text-indigo-600 border-indigo-600"
                : "text-gray-400 border-transparent hover:text-gray-600"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "discussion" ? (
          <CommentThread campaignId={campaignId} currentUserId={currentUserId} />
        ) : (
          <AssetPanel campaignId={campaignId} currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
}
