import React from "react";
import { Loader2 } from "lucide-react";

interface ResultSectionProps {
  title: string;
  children: React.ReactNode;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ title, children }) => (
  <div className="ag-glass-static p-6">
    <div className="text-xs font-medium text-muted-foreground mb-4 pb-3 border-b border-foreground/[0.06] uppercase tracking-wider">
      {title}
    </div>
    {children}
  </div>
);

interface IssueListProps {
  items: string[];
  emptyMessage?: string;
}

export const IssueList: React.FC<IssueListProps> = ({ items, emptyMessage = "No issues found ✓" }) => (
  <div className="space-y-2.5">
    {items.length === 0 ? (
      <div className="text-sm text-muted-foreground">{emptyMessage}</div>
    ) : (
      items.map((item, i) => (
        <div key={i} className="text-sm text-foreground/75 flex gap-3 items-start leading-relaxed">
          <span className="text-muted-foreground/40 shrink-0 mt-0.5 font-mono text-xs">›</span>
          <span>{item}</span>
        </div>
      ))
    )}
  </div>
);

interface SectionChecklistProps {
  sections: { name: string; present: boolean }[];
}

export const SectionChecklist: React.FC<SectionChecklistProps> = ({ sections }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
    {sections.map((s) => (
      <div
        key={s.name}
        className={`text-sm flex items-center gap-3 p-3 rounded-lg transition-colors ${
          s.present
            ? "text-foreground/80 bg-foreground/[0.03] border border-foreground/[0.05]"
            : "text-muted-foreground/60 bg-foreground/[0.015] border border-foreground/[0.03]"
        }`}
      >
        <span className="font-mono text-xs">{s.present ? "✓" : "—"}</span>
        <span>{s.name}</span>
      </div>
    ))}
  </div>
);

export const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex flex-col items-center justify-center">
    <div className="ag-glass-static p-10 text-center max-w-sm">
      <Loader2 className="w-6 h-6 mx-auto mb-5 text-foreground/50 animate-spin" />
      <div className="text-sm font-medium text-foreground/80 mb-6">{message}</div>
      <div className="h-px bg-foreground/[0.06] rounded-full w-48 mx-auto overflow-hidden">
        <div className="h-full w-1/4 bg-foreground/30 rounded-full ag-loading-bar" />
      </div>
    </div>
  </div>
);

interface KeywordTagsProps {
  keywords: string[];
  variant?: "default" | "missing";
}

export const KeywordTags: React.FC<KeywordTagsProps> = ({ keywords, variant = "default" }) => (
  <div className="flex flex-wrap gap-2">
    {keywords.slice(0, 20).map((kw) => (
      <span
        key={kw}
        className={variant === "missing" ? "ag-pill-muted" : "ag-pill"}
      >
        {kw}
      </span>
    ))}
    {keywords.length > 20 && (
      <span className="text-xs text-muted-foreground/50 px-3 py-1.5">
        +{keywords.length - 20} more
      </span>
    )}
  </div>
);