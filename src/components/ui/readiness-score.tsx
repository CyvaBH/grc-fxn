"use client"

import { cn } from "@/lib/utils"

interface ReadinessScoreProps {
  score: number
  previousScore?: number
  size?: "sm" | "lg"
  className?: string
}

function getScoreColor(score: number): string {
  if (score >= 70) return "text-brand-teal"
  if (score >= 40) return "text-status-warnTx"
  return "text-status-critTx"
}

function getStrokeColor(score: number): string {
  if (score >= 70) return "#0E9F6E"
  if (score >= 40) return "#C27803"
  return "#C81E1E"
}

export function ReadinessScore({
  score,
  previousScore,
  size = "lg",
  className,
}: ReadinessScoreProps) {
  const delta = previousScore ? score - previousScore : null
  const radius = size === "lg" ? 54 : 20
  const stroke = size === "lg" ? 8 : 4
  const normalizedRadius = radius - stroke
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: radius * 2, height: radius * 2 }}>
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="#E2E8F0"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={getStrokeColor(score)}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: "stroke-dashoffset 1s ease-out",
            }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-bold leading-none",
              getScoreColor(score),
              size === "lg" ? "text-4xl" : "text-lg"
            )}
          >
            {score}
          </span>
          {size === "lg" && (
            <span className="text-xs text-gray-500 mt-0.5">out of 100</span>
          )}
        </div>
      </div>
      {delta !== null && delta !== 0 && (
        <span
          className={cn(
            "text-sm font-medium",
            delta > 0 ? "text-brand-teal" : "text-status-critTx"
          )}
        >
          {delta > 0 ? "+" : ""}
          {delta} since last assessment
        </span>
      )}
    </div>
  )
}
