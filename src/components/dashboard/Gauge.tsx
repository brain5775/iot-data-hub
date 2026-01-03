import { useEffect, useState } from "react";

interface GaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  color: string;
}

export function Gauge({ value, min, max, label, unit, color }: GaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const percentage = ((animatedValue - min) / (max - min)) * 100;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  // SVG arc calculation for semi-circle gauge
  const radius = 45;
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div className="gauge-container">
      <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
      <div className="relative w-28 h-16">
        <svg className="w-full h-full" viewBox="0 0 100 60">
          {/* Background arc */}
          <path
            d="M 5 55 A 45 45 0 0 1 95 55"
            fill="none"
            stroke="hsl(var(--gauge-track))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <path
            d="M 5 55 A 45 45 0 0 1 95 55"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Value display */}
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="text-xl font-bold text-foreground">
            {animatedValue.toFixed(1)}
          </span>
        </div>
      </div>
      {/* Scale */}
      <div className="flex justify-between w-28 text-xs text-muted-foreground mt-1">
        <span>{min}</span>
        <span className="text-xs font-medium">{unit}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
