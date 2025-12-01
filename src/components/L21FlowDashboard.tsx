// src/components/L21FlowDashboard.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export type FlowQuality = "low" | "medium" | "high";
export type LuckTiming = "now" | "soon" | "later";
export type CoopMode = "solo" | "team" | "clustered";
export type FlowMode =
  | "stabilize"
  | "explore"
  | "push"
  | "pivot"
  | "slow_down";

export interface L21FlowAlignment {
  value: number; // 0..1
  quality: FlowQuality;
}

export interface L21LuckWindow {
  isOpen: boolean;
  openness: number; // 0..1
  timing: LuckTiming;
}

export interface L21CooperativeField {
  score: number; // 0..1
  mode: CoopMode;
}

export interface L21FlowSuggestion {
  mode: FlowMode;
  confidence: number; // 0..1
}

export interface L21DecisionSnapshot {
  top_candidate: string;
  score: number;
}

export interface L21FlowDashboardPayload {
  flow_alignment: L21FlowAlignment;
  luck_window: L21LuckWindow;
  cooperative_field: L21CooperativeField;
  flow_suggestion: L21FlowSuggestion;
  flow_explain: string[];

  decision_before_flow?: L21DecisionSnapshot;
  decision_after_flow?: L21DecisionSnapshot;
  decision_delta_score?: number;
}

interface L21FlowDashboardProps {
  data: L21FlowDashboardPayload;
  title?: string;
}

export const L21FlowDashboard: React.FC<L21FlowDashboardProps> = ({
  data,
  title = "L21 – Flow & Luck Alignment",
}) => {
  const { flow_alignment, luck_window, cooperative_field, flow_suggestion } = data;

  return (
    <Card className="w-full max-w-4xl mx-auto space-y-4 p-4 sm:p-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-lg sm:text-xl font-semibold">{title}</CardTitle>
          <ModeBadge mode={flow_suggestion.mode} confidence={flow_suggestion.confidence} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Верхний блок: flow / luck / coop */}
        <div className="grid gap-4 sm:grid-cols-3">
          <FlowAlignmentCard alignment={flow_alignment} />
          <LuckWindowCard luck={luck_window} />
          <CooperativeFieldCard coop={cooperative_field} />
        </div>

        {/* Объяснения */}
        <FlowExplainList reasons={data.flow_explain} />

        {/* Влияние на решение */}
        <DecisionImpactBlock
          before={data.decision_before_flow}
          after={data.decision_after_flow}
          delta={data.decision_delta_score}
        />
      </CardContent>
    </Card>
  );
};

interface FlowAlignmentCardProps {
  alignment: L21FlowDashboardPayload["flow_alignment"];
}

const FlowAlignmentCard: React.FC<FlowAlignmentCardProps> = ({ alignment }) => {
  const percent = Math.round(alignment.value * 100);

  return (
    <div className="flex flex-col gap-2 rounded-2xl border bg-background/60 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">Flow alignment</span>
        <FlowQualityBadge quality={alignment.quality} />
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums">
          {percent}
          <span className="text-sm align-top ml-0.5">%</span>
        </span>
      </div>
      <Progress value={percent} className="h-2 rounded-full" />
    </div>
  );
};

const FlowQualityBadge: React.FC<{ quality: FlowQuality }> = ({ quality }) => {
  const label = quality.toUpperCase();
  const variant =
    quality === "high"
      ? "default"
      : quality === "medium"
      ? "outline"
      : "destructive";

  return (
    <Badge variant={variant} className="text-[0.7rem]">
      {label}
    </Badge>
  );
};

interface LuckWindowCardProps {
  luck: L21FlowDashboardPayload["luck_window"];
}

const LuckWindowCard: React.FC<LuckWindowCardProps> = ({ luck }) => {
  const opennessPercent = Math.round(luck.openness * 100);

  return (
    <div className="flex flex-col gap-2 rounded-2xl border bg-background/60 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">Luck window</span>
        <LuckTimingBadge timing={luck.timing} isOpen={luck.isOpen} />
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums">
          {opennessPercent}
          <span className="text-sm align-top ml-0.5">%</span>
        </span>
        <span className="text-xs text-muted-foreground">openness</span>
      </div>
      <Progress value={opennessPercent} className="h-2 rounded-full" />
    </div>
  );
};

const LuckTimingBadge: React.FC<{
  timing: LuckTiming;
  isOpen: boolean;
}> = ({ timing, isOpen }) => {
  let label = timing.toUpperCase();
  if (!isOpen) label = `CLOSED · ${label}`;

  const color =
    timing === "now" && isOpen
      ? "bg-emerald-500/90 text-emerald-950"
      : timing === "soon"
      ? "bg-amber-500/90 text-amber-950"
      : "bg-slate-500/80 text-slate-50";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${color}`}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

interface CooperativeFieldCardProps {
  coop: L21FlowDashboardPayload["cooperative_field"];
}

const CooperativeFieldCard: React.FC<CooperativeFieldCardProps> = ({ coop }) => {
  const percent = Math.round(coop.score * 100);

  return (
    <div className="flex flex-col gap-2 rounded-2xl border bg-background/60 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">Cooperative field</span>
        <CoopModeBadge mode={coop.mode} />
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums">
          {percent}
          <span className="text-sm align-top ml-0.5">%</span>
        </span>
        <Stars score={coop.score} />
      </div>

      <Progress value={percent} className="h-2 rounded-full" />
    </div>
  );
};

const CoopModeBadge: React.FC<{ mode: CoopMode }> = ({ mode }) => {
  const label = mode === "solo" ? "SOLO" : mode === "team" ? "TEAM" : "CLUSTERED";

  return (
    <Badge variant="outline" className="text-[0.7rem]">
      {label}
    </Badge>
  );
};

const Stars: React.FC<{ score: number }> = ({ score }) => {
  const stars = Math.round(score * 5);
  return (
    <div className="flex items-center gap-0.5 text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < stars ? "★" : "☆"}</span>
      ))}
    </div>
  );
};

const ModeBadge: React.FC<{
  mode: FlowMode;
  confidence: number;
}> = ({ mode, confidence }) => {
  const label = mode.replace("_", " ").toUpperCase();
  const confPercent = Math.round(confidence * 100);

  let colorClasses = "bg-slate-800 text-slate-50 border border-slate-700 shadow-sm";

  if (mode === "push") colorClasses = "bg-emerald-600 text-emerald-50 shadow";
  if (mode === "explore") colorClasses = "bg-sky-600 text-sky-50 shadow";
  if (mode === "stabilize") colorClasses = "bg-amber-500 text-amber-950 shadow";
  if (mode === "slow_down") colorClasses = "bg-rose-600 text-rose-50 shadow";
  if (mode === "pivot") colorClasses = "bg-violet-600 text-violet-50 shadow";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${colorClasses}`}
    >
      <span>{label}</span>
      <span className="text-[0.7rem] opacity-80">{confPercent}% conf</span>
    </div>
  );
};

interface FlowExplainListProps {
  reasons: string[];
}

const FlowExplainList: React.FC<FlowExplainListProps> = ({ reasons }) => {
  if (!reasons || reasons.length === 0) return null;

  return (
    <div className="rounded-2xl border bg-muted/40 p-3 sm:p-4 space-y-2">
      <div className="text-sm font-medium text-muted-foreground">Flow explanation</div>
      <ul className="space-y-1 text-sm">
        {reasons.map((reason, idx) => (
          <li key={idx} className="flex gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface DecisionImpactBlockProps {
  before?: L21FlowDashboardPayload["decision_before_flow"];
  after?: L21FlowDashboardPayload["decision_after_flow"];
  delta?: number;
}

const DecisionImpactBlock: React.FC<DecisionImpactBlockProps> = ({ before, after, delta }) => {
  if (!before && !after) return null;

  const formattedDelta = typeof delta === "number" ? `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}` : null;

  return (
    <div className="rounded-2xl border bg-background/60 p-3 sm:p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">Decision impact (before / after flow)</span>
        {formattedDelta && (
          <Badge variant="outline" className="text-[0.7rem]">
            Δ {formattedDelta}
          </Badge>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        {before && (
          <div className="space-y-1">
            <div className="text-xs uppercase text-muted-foreground">Baseline decision</div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">{before.top_candidate}</span>
              <span className="text-xs text-muted-foreground">score {before.score.toFixed(2)}</span>
            </div>
          </div>
        )}

        {after && (
          <div className="space-y-1">
            <div className="text-xs uppercase text-muted-foreground">Flow-adjusted decision</div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">{after.top_candidate}</span>
              <span className="text-xs text-muted-foreground">score {after.score.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
