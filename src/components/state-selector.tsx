"use client"

import { NIGERIAN_STATES } from "@/lib/data-types"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

export function statesArray(states: string): string[] {
  return states.split(",").map((s) => s.trim()).filter(Boolean)
}

/** Multi-select chip picker for Nigerian operating states. */
export function StateSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  const selected = statesArray(value)

  const toggle = (state: string) => {
    const next = selected.includes(state)
      ? selected.filter((s) => s !== state)
      : [...selected, state]
    onChange(next.join(", "))
  }

  return (
    <div className="flex flex-wrap gap-2">
      {NIGERIAN_STATES.map((state) => {
        const on = selected.includes(state)
        return (
          <button
            key={state}
            type="button"
            onClick={() => toggle(state)}
            className={cn(
              "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
              on
                ? "border-brand-teal bg-brand-teal text-white"
                : "border-border hover:border-gray-300 text-brand-navy"
            )}
          >
            {on && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
            {state}
          </button>
        )
      })}
    </div>
  )
}
