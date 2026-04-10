interface BarData {
  label: string;
  values: number[];
  colors: string[];
}

interface BarChartProps {
  data: BarData[];
  maxValue?: number;
  height?: number;
}

export default function BarChart({ data, maxValue, height = 200 }: BarChartProps) {
  const max = maxValue || Math.max(...data.flatMap(d => d.values)) * 1.2;

  return (
    <div className="flex items-end justify-between gap-3 w-full" style={{ height }}>
      {data.map((bar) => (
        <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-end gap-1 w-full justify-center" style={{ height: height - 24 }}>
            {bar.values.map((val, i) => (
              <div
                key={i}
                className="rounded-t-md min-w-[14px] flex-1 max-w-[24px] transition-all duration-500"
                style={{
                  height: `${(val / max) * 100}%`,
                  backgroundColor: bar.colors[i] || '#06b6d4',
                }}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}
