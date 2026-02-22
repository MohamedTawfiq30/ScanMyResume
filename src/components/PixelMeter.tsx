import React from "react";

interface PixelMeterProps {
  score: number;
  label: string;
}

const PixelMeter: React.FC<PixelMeterProps> = ({ score, label }) => {
  const getScoreLabel = (s: number) => {
    if (s >= 80) return "Excellent";
    if (s >= 60) return "Good";
    if (s >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <div className="ag-glass-static p-6">
      <div className="flex justify-between items-end mb-4">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="text-right">
          <span className="text-3xl font-bold text-foreground font-mono">{score}</span>
          <span className="text-sm text-muted-foreground font-mono ml-0.5">/100</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full ag-score-fill"
          style={{
            "--fill": `${score}%`,
            background: "linear-gradient(90deg, hsla(0,0%,100%,0.3), hsla(0,0%,100%,0.7))",
          } as React.CSSProperties}
        />
      </div>

      <div className="mt-3 text-right">
        <span className="text-[11px] text-muted-foreground/60 font-mono uppercase tracking-wider">
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
};

export default PixelMeter;