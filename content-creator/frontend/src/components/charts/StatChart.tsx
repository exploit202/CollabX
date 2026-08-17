import React from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface StatChartProps {
  type?: 'line' | 'bar' | 'donut';
  data: ChartDataPoint[];
  color?: string; // Hex e.g. #EC4899 or #8B5CF6
  height?: number;
  prefix?: string;
  suffix?: string;
}

export const StatChart: React.FC<StatChartProps> = ({
  type = 'line',
  data,
  color = '#EC4899',
  height = 180,
  prefix = '',
  suffix = '',
}) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (type === 'bar') {
    return (
      <div className="w-full" style={{ height: `${height}px` }}>
        <div className="h-full flex items-end gap-2 pt-4 pb-6 px-2">
          {data.map((item, idx) => {
            const heightPercent = Math.max(8, (item.value / maxValue) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded-md mb-1 whitespace-nowrap shadow-sm">
                  {prefix}{item.value.toLocaleString('en-IN')}{suffix}
                </div>
                <div
                  className="w-full rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: color,
                  }}
                />
                <span className="text-[10px] text-slate-400 mt-2 truncate max-w-full font-medium">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'donut') {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let cumulativeAngle = 0;
    const colors = ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'];

    return (
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {data.map((item, idx) => {
              const sliceAngle = (item.value / total) * 360;
              const x1 = 50 + 40 * Math.cos((Math.PI * cumulativeAngle) / 180);
              const y1 = 50 + 40 * Math.sin((Math.PI * cumulativeAngle) / 180);
              cumulativeAngle += sliceAngle;
              const x2 = 50 + 40 * Math.cos((Math.PI * cumulativeAngle) / 180);
              const y2 = 50 + 40 * Math.sin((Math.PI * cumulativeAngle) / 180);
              const largeArc = sliceAngle > 180 ? 1 : 0;

              return (
                <path
                  key={idx}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={colors[idx % colors.length]}
                  className="transition-opacity hover:opacity-90 cursor-pointer"
                />
              );
            })}
            <circle cx="50" cy="50" r="24" fill="white" />
          </svg>
        </div>

        <div className="flex flex-col gap-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              <span className="text-slate-600 font-medium">{item.label}:</span>
              <span className="text-slate-900 font-bold">
                {prefix}{item.value.toLocaleString('en-IN')}{suffix} ({Math.round((item.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default Line Chart
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d.value / maxValue) * 80;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
        <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
      </svg>
      <div className="flex justify-between mt-2 px-1 text-[10px] text-slate-400 font-medium">
        {data.map((d, idx) => (
          <span key={idx}>{d.label}</span>
        ))}
      </div>
    </div>
  );
};
