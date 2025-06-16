interface ProgressBarProps {
  percentage: number
}

export function ProgressBar({ percentage }: ProgressBarProps) {
  return (
    <div className="w-full h-2 bg-gray-100">
      <div
        className="h-full bg-blue-400 transition-all duration-500"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  )
}
