import React from "react";
import { L21FlowDashboard } from "@/components/L21FlowDashboard";
import type { L21FlowDashboardPayload } from "@/components/L21FlowDashboard";

const mockData: L21FlowDashboardPayload = {
  flow_alignment: {
    value: 0.78,
    quality: "high",
  },
  luck_window: {
    isOpen: true,
    openness: 0.63,
    timing: "now",
  },
  cooperative_field: {
    score: 0.71,
    mode: "team",
  },
  flow_suggestion: {
    mode: "push",
    confidence: 0.82,
  },
  flow_explain: [
    "высокий flow и открытое окно удачи",
    "сильное коллективное поле → режим push",
  ],
  decision_before_flow: {
    top_candidate: "Option B",
    score: 0.52,
  },
  decision_after_flow: {
    top_candidate: "Option A",
    score: 0.83,
  },
  decision_delta_score: 0.31,
};

export const L21DashboardDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-foreground p-4 sm:p-8">
      <L21FlowDashboard data={mockData} />
    </div>
  );
};
