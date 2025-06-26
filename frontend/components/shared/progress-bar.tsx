interface ProgressBarProps {
  percentage: number;
}

export function ProgressBar({ percentage }: ProgressBarProps) {
  return (
    <div className="relative w-full h-4 bg-gray-100 overflow-hidden">
      <div
        className="h-full bg-blue-400 transition-all duration-500"
        style={{ width: `${percentage}%` }}
      ></div>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-black">
        {percentage}%
      </span>
    </div>
  );
}
