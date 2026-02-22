import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface PixelRadarChartProps {
  data: { category: string; score: number }[];
}

const PixelRadarChart: React.FC<PixelRadarChartProps> = ({ data }) => {
  return (
    <div className="ag-glass-static p-6">
      <div className="text-xs text-muted-foreground mb-4 text-center uppercase tracking-wider">
        Match Breakdown
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsla(0, 0%, 100%, 0.06)" />
          <PolarAngleAxis
            dataKey="category"
            tick={{
              fill: "hsla(0, 0%, 100%, 0.6)",
              fontSize: 11,
              fontFamily: '"Satoshi"',
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{
              fill: "hsla(0, 0%, 100%, 0.25)",
              fontSize: 10,
              fontFamily: '"JetBrains Mono"',
            }}
            axisLine={false}
          />
          <Radar
            dataKey="score"
            stroke="hsla(0, 0%, 100%, 0.4)"
            fill="hsla(0, 0%, 100%, 0.06)"
            fillOpacity={1}
            strokeWidth={1.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PixelRadarChart;