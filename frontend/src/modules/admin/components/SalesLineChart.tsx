import { useRef, useEffect, useState } from 'react';

interface SalesLineChartProps {
  thisMonthData: { date: string; value: number }[];
  lastMonthData: { date: string; value: number }[];
  height?: number;
}

export default function SalesLineChart({ thisMonthData, lastMonthData, height = 250 }: SalesLineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(600);

  useEffect(() => {
    const updateChartWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        if (containerWidth < 640) {
          setChartWidth(400);
        } else if (containerWidth < 1024) {
          setChartWidth(500);
        } else {
          setChartWidth(600);
        }
      }
    };

    updateChartWidth();
    window.addEventListener('resize', updateChartWidth);
    return () => window.removeEventListener('resize', updateChartWidth);
  }, []);

  const chartHeight = height;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  const maxValue = Math.max(
    ...thisMonthData.map(d => d.value),
    ...lastMonthData.map(d => d.value),
    60000
  );

  const thisMonthPoints = thisMonthData.map((item, index) => {
    const x = padding.left + (index / (thisMonthData.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - (item.value / maxValue) * graphHeight;
    return { x, y, value: item.value, date: item.date };
  });

  const lastMonthPoints = lastMonthData.map((item, index) => {
    const x = padding.left + (index / (lastMonthData.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - (item.value / maxValue) * graphHeight;
    return { x, y, value: item.value, date: item.date };
  });

  const createLinePath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  const thisMonthPath = createLinePath(thisMonthPoints);
  const lastMonthPath = createLinePath(lastMonthPoints);

  return (
    <div ref={containerRef} className="w-full">
      <svg width={chartWidth} height={chartHeight} className="w-full h-auto">
        <defs>
          <linearGradient id="thisMonthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lastMonthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padding.top + graphHeight - ratio * graphHeight;
          return (
            <line
              key={idx}
              x1={padding.left}
              y1={y}
              x2={padding.left + graphWidth}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.5"
            />
          );
        })}

        {/* Area fills */}
        <path
          d={`${thisMonthPath} L ${thisMonthPoints[thisMonthPoints.length - 1]?.x || 0} ${padding.top + graphHeight} L ${thisMonthPoints[0]?.x || 0} ${padding.top + graphHeight} Z`}
          fill="url(#thisMonthGradient)"
        />
        <path
          d={`${lastMonthPath} L ${lastMonthPoints[lastMonthPoints.length - 1]?.x || 0} ${padding.top + graphHeight} L ${lastMonthPoints[0]?.x || 0} ${padding.top + graphHeight} Z`}
          fill="url(#lastMonthGradient)"
        />

        {/* Lines */}
        <path
          d={thisMonthPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={lastMonthPath}
          fill="none"
          stroke="#eab308"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {thisMonthPoints.map((point, idx) => (
          <circle
            key={`this-${idx}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="2"
          />
        ))}
        {lastMonthPoints.map((point, idx) => (
          <circle
            key={`last-${idx}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#eab308"
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 15000, 30000, 45000, 60000].map((value, idx) => {
          const ratio = value / maxValue;
          const y = padding.top + graphHeight - ratio * graphHeight;
          return (
            <text
              key={idx}
              x={padding.left - 10}
              y={y + 5}
              textAnchor="end"
              className="text-xs fill-neutral-600"
            >
              {value.toLocaleString()}
            </text>
          );
        })}

        {/* X-axis labels */}
        {thisMonthData.map((item, index) => {
          const x = padding.left + (index / (thisMonthData.length - 1)) * graphWidth;
          return (
            <text
              key={index}
              x={x}
              y={chartHeight - padding.bottom + 15}
              textAnchor="middle"
              className="text-xs fill-neutral-600"
            >
              {item.date}
            </text>
          );
        })}

        {/* Axes */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + graphHeight}
          stroke="#9ca3af"
          strokeWidth="2"
        />
        <line
          x1={padding.left}
          y1={padding.top + graphHeight}
          x2={padding.left + graphWidth}
          y2={padding.top + graphHeight}
          stroke="#9ca3af"
          strokeWidth="2"
        />
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-xs text-neutral-600">This Month</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-xs text-neutral-600">Last Month</span>
        </div>
      </div>
    </div>
  );
}

